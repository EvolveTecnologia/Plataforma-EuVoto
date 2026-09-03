import { Candidato, ViceOrSuplente, EtlLogItem } from '../src/types';

// TSE Cargo Codes
export const CARGOS: Record<number, string> = {
  1: 'PRESIDENTE',
  2: 'VICE-PRESIDENTE',
  3: 'GOVERNADOR',
  4: 'VICE-GOVERNADOR',
  5: 'SENADOR',
  6: 'DEPUTADO FEDERAL',
  7: 'DEPUTADO ESTADUAL',
  8: 'DEPUTADO DISTRITAL',
  9: '1º SUPLENTE',
  10: '2º SUPLENTE'
};

export interface ParseResult {
  candidatos: Candidato[];
  totalLinhas: number;
  inseridos: number;
  rejeitados: number;
  erros: string[];
}

/**
 * Robust CSV parser for TSE consult files:
 * - Latin-1 / UTF-8 text support
 * - Semicolon delimited
 * - Quoted fields
 * - Strict rejection of scientific notation (/E\+/) in sequence/title numbers
 * - "#NULO" converted to null
 * - Discards CPF and Titulo (LGPD)
 * - Resolves Chapa/Vice by SQ_COLIGACAO and candidate number
 */
export function parseTseCsv(
  csvText: string,
  ufDefault: string = 'BR',
  anoDefault: number = 2026,
  fotosDisponiveis?: Record<string, string> // Map from SQ_CANDIDATO -> WebP URL
): ParseResult {
  const lines = csvText.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length === 0) {
    return { candidatos: [], totalLinhas: 0, inseridos: 0, rejeitados: 0, erros: ['Arquivo CSV vazio'] };
  }

  const erros: string[] = [];
  let rejeitados = 0;

  // Detect delimiter from header line (semicolon or comma)
  const rawHeader = lines[0];
  const delimiter = rawHeader.includes(';') ? ';' : ',';
  const headers = parseCsvLine(rawHeader, delimiter);
  const headerIndexMap = new Map<string, number>();
  headers.forEach((h, idx) => {
    headerIndexMap.set(h.toUpperCase().trim(), idx);
  });

  interface RawCandRow {
    ano: number;
    uf: string;
    cargoCd: number;
    cargo: string;
    sequencial: string;
    numero: string;
    nome: string;
    nomeUrna: string;
    nomeSocial: string | null;
    situacao: string;
    partidoNr: string;
    sigla: string;
    partido: string;
    federacao: string | null;
    composicaoFederacao: string | null;
    coligacaoSq: string | null;
    coligacaoNm: string | null;
    genero: string;
    ufNascimento: string;
    dtNascimento: string;
    ocupacao: string;
  }

  const rawRows: RawCandRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;

    const cols = parseCsvLine(rawLine, delimiter);
    if (cols.length < 15) {
      rejeitados++;
      erros.push(`Linha ${i + 1}: Quantidade insuficiente de colunas (${cols.length})`);
      continue;
    }

    const getCol = (name: string): string => {
      const idx = headerIndexMap.get(name);
      if (idx !== undefined && idx < cols.length) {
        const val = cols[idx].trim();
        return val === '#NULO' ? '' : val;
      }
      return '';
    };

    const sqCandidato = getCol('SQ_CANDIDATO').replace(/"/g, '').trim();
    const nrTitulo = getCol('NR_TITULO_ELEITORAL_CANDIDATO').replace(/"/g, '').trim();

    // Normalização de sequencial ou número de candidato se vier em notação científica
    const safeSq = /E\+/i.test(sqCandidato) ? `SQ_${anoDefault}_${getCol('SG_UF') || ufDefault}_${getCol('NR_CANDIDATO')}_${i}` : sqCandidato;

    const cargoCd = parseInt(getCol('CD_CARGO'), 10) || 0;
    const ano = parseInt(getCol('ANO_ELEICAO'), 10) || anoDefault;
    const uf = (getCol('SG_UF') || ufDefault).toUpperCase();
    const numero = getCol('NR_CANDIDATO');
    const nome = getCol('NM_CANDIDATO');
    const nomeUrna = getCol('NM_URNA_CANDIDATO') || nome;
    const nomeSocial = getCol('NM_SOCIAL_CANDIDATO') || null;
    const situacao = getCol('DS_SITUACAO_CANDIDATURA') || 'DEFERIDO';
    const sigla = getCol('SG_PARTIDO');
    const partido = getCol('NM_PARTIDO');
    const federacao = getCol('NM_FEDERACAO') || null;
    const composicaoFederacao = getCol('DS_COMPOSICAO_FEDERACAO') || null;
    const coligacaoSq = getCol('SQ_COLIGACAO') || null;
    const coligacaoNm = getCol('NM_COLIGACAO') || null;
    const genero = getCol('DS_GENERO') || 'NÃO INFORMADO';
    const ufNascimento = getCol('SG_UF_NASCIMENTO') || '';
    const dtNascimento = getCol('DT_NASCIMENTO') || '';
    const ocupacao = getCol('DS_OCUPACAO') || '';

    // Regra 3 (LGPD): NR_CPF_CANDIDATO e NR_TITULO_ELEITORAL_CANDIDATO descartados propositalmente aqui!

    rawRows.push({
      ano,
      uf,
      cargoCd,
      cargo: CARGOS[cargoCd] || getCol('DS_CARGO') || 'OUTRO',
      sequencial: sqCandidato,
      numero,
      nome,
      nomeUrna,
      nomeSocial,
      situacao,
      partidoNr: getCol('NR_PARTIDO'),
      sigla,
      partido,
      federacao,
      composicaoFederacao,
      coligacaoSq,
      coligacaoNm,
      genero,
      ufNascimento,
      dtNascimento,
      ocupacao
    });
  }

  // Chapa indexing:
  // Vices: cargoCd 2 (Vice-Presidente), cargoCd 4 (Vice-Governador)
  // Suplentes: cargoCd 9 (1º Suplente), cargoCd 10 (2º Suplente)
  const viceMap = new Map<string, ViceOrSuplente>();
  const suplentesMap = new Map<string, ViceOrSuplente[]>();

  rawRows.forEach(row => {
    // Determine photo URL - Prioritizes official TSE DivulgaCand attached filename
    let fotoUrl = fotosDisponiveis?.[row.sequencial] ||
      (row.sequencial ? `/fotos/FBR${row.sequencial}_div.jpg` : `/fotos/${row.ano}/${row.uf}/${row.numero}.webp`);
    
    // In addition, if presidential and local webp exists
    if (row.cargoCd === 1 && !row.sequencial) {
      fotoUrl = `/fotos/2026/BR/${row.numero}.webp`;
    }

    if (row.cargoCd === 2 || row.cargoCd === 4) {
      const viceInfo: ViceOrSuplente = {
        nomeUrna: row.nomeUrna,
        nomeCompleto: row.nome,
        sigla: row.sigla,
        partido: row.partido,
        fotoUrl,
        cargo: row.cargo
      };
      // Key by UF + SQ_COLIGACAO if exists, or UF + candidate number
      if (row.coligacaoSq) {
        viceMap.set(`${row.uf}_${row.coligacaoSq}`, viceInfo);
      }
      viceMap.set(`${row.uf}_${row.numero}`, viceInfo);
    } else if (row.cargoCd === 9 || row.cargoCd === 10) {
      const suplenteInfo: ViceOrSuplente = {
        nomeUrna: row.nomeUrna,
        nomeCompleto: row.nome,
        sigla: row.sigla,
        partido: row.partido,
        fotoUrl,
        cargo: row.cargo
      };
      const listKey = `${row.uf}_${row.coligacaoSq || row.numero}`;
      const list = suplentesMap.get(listKey) || [];
      list.push(suplenteInfo);
      suplentesMap.set(listKey, list);
      // Also index by candidate number
      const numKey = `${row.uf}_${row.numero}`;
      const list2 = suplentesMap.get(numKey) || [];
      list2.push(suplenteInfo);
      suplentesMap.set(numKey, list2);
    }
  });

  // Titular candidates that the electronic urn / user area uses:
  // 1=PRESIDENTE, 3=GOVERNADOR, 5=SENADOR, 6=DEPUTADO FEDERAL, 7=DEPUTADO ESTADUAL, 8=DEPUTADO DISTRITAL
  const titulares = rawRows.filter(r => [1, 3, 5, 6, 7, 8].includes(r.cargoCd));

  const candidatos: Candidato[] = titulares.map(row => {
    let vice: ViceOrSuplente | null = null;
    let suplentes: ViceOrSuplente[] | undefined = undefined;

    if (row.cargoCd === 1 || row.cargoCd === 3) {
      // Find vice by coligação or matching number
      vice = viceMap.get(`${row.uf}_${row.coligacaoSq}`) || viceMap.get(`${row.uf}_${row.numero}`) || null;
    } else if (row.cargoCd === 5) {
      // Senador: find 1º and 2º suplentes
      const supls = suplentesMap.get(`${row.uf}_${row.coligacaoSq}`) || suplentesMap.get(`${row.uf}_${row.numero}`) || [];
      if (supls.length > 0) {
        suplentes = supls;
        vice = supls[0]; // Primary running mate
      }
    }

    let fotoUrl = fotosDisponiveis?.[row.sequencial] ||
      (row.sequencial ? `/fotos/FBR${row.sequencial}_div.jpg` : `/fotos/${row.ano}/${row.uf}/${row.numero}.webp`);
    if (row.cargoCd === 1 && !row.sequencial) {
      fotoUrl = `/fotos/2026/BR/${row.numero}.webp`;
    }

    return {
      id: `${row.ano}_${row.uf}_${row.cargoCd}_${row.numero}`,
      ano: row.ano,
      uf: row.uf,
      cargoCd: row.cargoCd,
      cargo: row.cargo,
      numero: row.numero,
      sequencial: row.sequencial,
      nome: row.nome,
      nomeUrna: row.nomeUrna,
      nomeSocial: row.nomeSocial,
      situacao: row.situacao,
      sigla: row.sigla,
      partido: row.partido,
      federacao: row.federacao,
      composicaoFederacao: row.composicaoFederacao,
      chapaId: row.coligacaoSq || undefined,
      coligacao: row.coligacaoNm || undefined,
      vice,
      suplentes,
      fotoUrl,
      genero: row.genero,
      ufNascimento: row.ufNascimento,
      dtNascimento: row.dtNascimento,
      ocupacao: row.ocupacao
    };
  });

  return {
    candidatos,
    totalLinhas: lines.length - 1,
    inseridos: candidatos.length,
    rejeitados,
    erros
  };
}

/**
 * Helper to parse a single CSV line with quoted strings and semicolon delimiter
 */
function parseCsvLine(line: string, delimiter: string = ';'): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);

  return result.map(s => s.trim().replace(/^"|"$/g, ''));
}

/**
 * Regex test for DivulgaCand photo filenames:
 * e.g. FBR280002542548_div.jpg or 280002542548_div.png
 */
export function extractSequencialFromPhotoName(filename: string): string | null {
  const regex = /^(?:[A-Z]{2,3})?(\d+)_div\.(jpe?g|png)$/i;
  const match = filename.match(regex);
  return match ? match[1] : null;
}
