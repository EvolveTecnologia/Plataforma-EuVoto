import fs from 'fs';
import path from 'path';

const candidateData = [
  {
    sq: '280002538811',
    numero: '80',
    nome: 'SAMARA MARTINS DA SILVA FEITOSA',
    nomeUrna: 'SAMARA',
    cargo: 'PRESIDENTE',
    partido: 'UP',
    sigla: 'UP',
    corPrimaria: '#1E1E1E',
    corSecundaria: '#EAB308',
    genero: 'FEMININO',
    iniciais: 'SM'
  },
  {
    sq: '280002538812',
    numero: '80',
    nome: 'RAQUEL NONATO DE BRICIO',
    nomeUrna: 'RAQUEL BRÍCIO',
    cargo: 'VICE-PRESIDENTE',
    partido: 'UP',
    sigla: 'UP',
    corPrimaria: '#1E1E1E',
    corSecundaria: '#CA8A04',
    genero: 'FEMININO',
    iniciais: 'RB'
  },
  {
    sq: '280002539825',
    numero: '30',
    nome: 'LUIS EDUARDO GRANGEIRO GIRÃO',
    nomeUrna: 'EDUARDO GIRÃO',
    cargo: 'VICE-PRESIDENTE',
    partido: 'NOVO',
    sigla: 'NOVO',
    corPrimaria: '#EA580C',
    corSecundaria: '#C2410C',
    genero: 'MASCULINO',
    iniciais: 'EG'
  },
  {
    sq: '280002539826',
    numero: '30',
    nome: 'ROMEU ZEMA NETO',
    nomeUrna: 'ZEMA',
    cargo: 'PRESIDENTE',
    partido: 'NOVO',
    sigla: 'NOVO',
    corPrimaria: '#EA580C',
    corSecundaria: '#F97316',
    genero: 'MASCULINO',
    iniciais: 'RZ'
  },
  {
    sq: '280002540693',
    numero: '14',
    nome: 'AROLDO MEDINA',
    nomeUrna: 'CORONEL MEDINA',
    cargo: 'VICE-PRESIDENTE',
    partido: 'MISSÃO',
    sigla: 'MISSÃO',
    corPrimaria: '#0F172A',
    corSecundaria: '#EAB308',
    genero: 'MASCULINO',
    iniciais: 'CM'
  },
  {
    sq: '280002540694',
    numero: '14',
    nome: 'RENAN ANTONIO FERREIRA DOS SANTOS',
    nomeUrna: 'RENAN SANTOS',
    cargo: 'PRESIDENTE',
    partido: 'MISSÃO',
    sigla: 'MISSÃO',
    corPrimaria: '#0F172A',
    corSecundaria: '#38BDF8',
    genero: 'MASCULINO',
    iniciais: 'RS'
  },
  {
    sq: '280002541457',
    numero: '16',
    nome: 'HERTZ DA CONCEICAO DIAS',
    nomeUrna: 'HERTZ DIAS',
    cargo: 'PRESIDENTE',
    partido: 'PSTU',
    sigla: 'PSTU',
    corPrimaria: '#B91C1C',
    corSecundaria: '#1F2937',
    genero: 'MASCULINO',
    iniciais: 'HD'
  },
  {
    sq: '280002541458',
    numero: '16',
    nome: 'VANESSA PORTUGAL BARBOSA',
    nomeUrna: 'VANESSA PORTUGAL',
    cargo: 'VICE-PRESIDENTE',
    partido: 'PSTU',
    sigla: 'PSTU',
    corPrimaria: '#B91C1C',
    corSecundaria: '#4B5563',
    genero: 'FEMININO',
    iniciais: 'VP'
  },
  {
    sq: '280002542548',
    numero: '13',
    nome: 'LUIZ INÁCIO LULA DA SILVA',
    nomeUrna: 'LULA',
    cargo: 'PRESIDENTE',
    partido: 'PT',
    sigla: 'PT',
    corPrimaria: '#DC2626',
    corSecundaria: '#991B1B',
    genero: 'MASCULINO',
    iniciais: 'LS'
  },
  {
    sq: '280002542549',
    numero: '13',
    nome: 'GERALDO JOSE RODRIGUES ALCKMIN FILHO',
    nomeUrna: 'GERALDO ALCKMIN',
    cargo: 'VICE-PRESIDENTE',
    partido: 'PSB',
    sigla: 'PSB',
    corPrimaria: '#E11D48',
    corSecundaria: '#F59E0B',
    genero: 'MASCULINO',
    iniciais: 'GA'
  },
  {
    sq: '280002548139',
    numero: '35',
    nome: 'WILSON GRASSI JUNIOR',
    nomeUrna: 'VETERINÁRIO WILSON GRASSI',
    cargo: 'PRESIDENTE',
    partido: 'DEMOCRATA',
    sigla: 'DEMOCRATA',
    corPrimaria: '#0284C7',
    corSecundaria: '#0369A1',
    genero: 'MASCULINO',
    iniciais: 'WG'
  },
  {
    sq: '280002548140',
    numero: '35',
    nome: 'SUÊD HAIDAR NOGUEIRA',
    nomeUrna: 'SUÊD HAIDAR',
    cargo: 'VICE-PRESIDENTE',
    partido: 'DEMOCRATA',
    sigla: 'DEMOCRATA',
    corPrimaria: '#0284C7',
    corSecundaria: '#075985',
    genero: 'FEMININO',
    iniciais: 'SH'
  },
  {
    sq: '280002551543',
    numero: '22',
    nome: 'ALFREDO GASPAR DE MENDONÇA NETO',
    nomeUrna: 'ALFREDO GASPAR',
    cargo: 'VICE-PRESIDENTE',
    partido: 'PL',
    sigla: 'PL',
    corPrimaria: '#1E3A8A',
    corSecundaria: '#172554',
    genero: 'MASCULINO',
    iniciais: 'AG'
  },
  {
    sq: '280002551544',
    numero: '22',
    nome: 'FLAVIO NANTES BOLSONARO',
    nomeUrna: 'FLAVIO BOLSONARO',
    cargo: 'PRESIDENTE',
    partido: 'PL',
    sigla: 'PL',
    corPrimaria: '#1E3A8A',
    corSecundaria: '#2563EB',
    genero: 'MASCULINO',
    iniciais: 'FB'
  },
  {
    sq: '280002551546',
    numero: '70',
    nome: 'JULIO CESAR DELGADO',
    nomeUrna: 'JÚLIO DELGADO',
    cargo: 'VICE-PRESIDENTE',
    partido: 'AVANTE',
    sigla: 'AVANTE',
    corPrimaria: '#D97706',
    corSecundaria: '#B45309',
    genero: 'MASCULINO',
    iniciais: 'JD'
  },
  {
    sq: '280002551547',
    numero: '70',
    nome: 'AUGUSTO JORGE CURY',
    nomeUrna: 'ESCRITOR AUGUSTO CURY',
    cargo: 'PRESIDENTE',
    partido: 'AVANTE',
    sigla: 'AVANTE',
    corPrimaria: '#D97706',
    corSecundaria: '#EA580C',
    genero: 'MASCULINO',
    iniciais: 'AC'
  },
  {
    sq: '280002551932',
    numero: '55',
    nome: 'RONALDO RAMOS CAIADO',
    nomeUrna: 'RONALDO CAIADO',
    cargo: 'PRESIDENTE',
    partido: 'PSD',
    sigla: 'PSD',
    corPrimaria: '#2563EB',
    corSecundaria: '#1D4ED8',
    genero: 'MASCULINO',
    iniciais: 'RC'
  },
  {
    sq: '280002551933',
    numero: '55',
    nome: 'GILBERTO KASSAB',
    nomeUrna: 'GILBERTO KASSAB',
    cargo: 'VICE-PRESIDENTE',
    partido: 'PSD',
    sigla: 'PSD',
    corPrimaria: '#2563EB',
    corSecundaria: '#1E40AF',
    genero: 'MASCULINO',
    iniciais: 'GK'
  },
  {
    sq: '280002551975',
    numero: '21',
    nome: 'EDMILSON SILVA COSTA',
    nomeUrna: 'EDMILSON COSTA',
    cargo: 'PRESIDENTE',
    partido: 'PCB',
    sigla: 'PCB',
    corPrimaria: '#DC2626',
    corSecundaria: '#7F1D1D',
    genero: 'MASCULINO',
    iniciais: 'EC'
  },
  {
    sq: '280002551976',
    numero: '21',
    nome: 'CLEUSA DOS SANTOS',
    nomeUrna: 'CLEUSA SANTOS',
    cargo: 'VICE-PRESIDENTE',
    partido: 'PCB',
    sigla: 'PCB',
    corPrimaria: '#DC2626',
    corSecundaria: '#991B1B',
    genero: 'FEMININO',
    iniciais: 'CS'
  },
  {
    sq: '280002552484',
    numero: '27',
    nome: 'CLARIANA ZACARKIM BARAO',
    nomeUrna: 'CLARIANA BARAO',
    cargo: 'PRESIDENTE',
    partido: 'DC',
    sigla: 'DC',
    corPrimaria: '#0284C7',
    corSecundaria: '#0C4A6E',
    genero: 'FEMININO',
    iniciais: 'CB'
  },
  {
    sq: '280002552485',
    numero: '27',
    nome: 'FABIANA CRISTINA TAVARES TORQUATO',
    nomeUrna: 'FABIANA TORQUATO',
    cargo: 'VICE-PRESIDENTE',
    partido: 'DC',
    sigla: 'DC',
    corPrimaria: '#0284C7',
    corSecundaria: '#075985',
    genero: 'FEMININO',
    iniciais: 'FT'
  },
  {
    sq: '280002552486',
    numero: '29',
    nome: 'ANTONIO CARLOS SILVA',
    nomeUrna: 'ANTÔNIO CARLOS',
    cargo: 'VICE-PRESIDENTE',
    partido: 'PCO',
    sigla: 'PCO',
    corPrimaria: '#991B1B',
    corSecundaria: '#450A0A',
    genero: 'MASCULINO',
    iniciais: 'AC'
  },
  {
    sq: '280002552487',
    numero: '29',
    nome: 'RUI COSTA PIMENTA',
    nomeUrna: 'RUI COSTA PIMENTA',
    cargo: 'PRESIDENTE',
    partido: 'PCO',
    sigla: 'PCO',
    corPrimaria: '#991B1B',
    corSecundaria: '#7F1D1D',
    genero: 'MASCULINO',
    iniciais: 'RP'
  },
  {
    sq: '280002553883',
    numero: '28',
    nome: 'LEONARDO ALVES DE ARAUJO',
    nomeUrna: 'LEONARDO AVALANCHE',
    cargo: 'VICE-PRESIDENTE',
    partido: 'PRTB',
    sigla: 'PRTB',
    corPrimaria: '#15803D',
    corSecundaria: '#14532D',
    genero: 'MASCULINO',
    iniciais: 'LA'
  },
  {
    sq: '280002553884',
    numero: '28',
    nome: 'PABLO HENRIQUE COSTA MARCAL',
    nomeUrna: 'PABLO MARÇAL',
    cargo: 'PRESIDENTE',
    partido: 'PRTB',
    sigla: 'PRTB',
    corPrimaria: '#15803D',
    corSecundaria: '#166534',
    genero: 'MASCULINO',
    iniciais: 'PM'
  }
];

function generateSvgCard(cand) {
  const isVice = cand.cargo.includes('VICE');
  const badgeLabel = isVice ? 'VICE-PRESIDENTE' : 'PRESIDENTE DA REPÚBLICA';
  const roleColor = isVice ? '#F59E0B' : '#10B981';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 520" width="400" height="520">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F172A" />
      <stop offset="60%" stop-color="${cand.corSecundaria}" />
      <stop offset="100%" stop-color="${cand.corPrimaria}" />
    </linearGradient>
    <linearGradient id="avatarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.25" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0.4" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="10" flood-opacity="0.45" />
    </filter>
  </defs>

  <!-- Base Card Background -->
  <rect width="400" height="520" rx="24" fill="url(#bgGrad)" />
  
  <!-- Subtle Brazilian Grid Overlay -->
  <g opacity="0.08" stroke="#FFFFFF" stroke-width="1">
    <line x1="0" y1="80" x2="400" y2="80" />
    <line x1="0" y1="160" x2="400" y2="160" />
    <line x1="0" y1="240" x2="400" y2="240" />
    <line x1="0" y1="320" x2="400" y2="320" />
    <line x1="80" y1="0" x2="80" y2="520" />
    <line x1="160" y1="0" x2="160" y2="520" />
    <line x1="240" y1="0" x2="240" y2="520" />
    <line x1="320" y1="0" x2="320" y2="520" />
  </g>

  <!-- TSE Official Top Header -->
  <rect x="20" y="20" width="360" height="42" rx="10" fill="#0B3D91" opacity="0.9" />
  <text x="36" y="46" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="900" fill="#FFFFFF" letter-spacing="1">JUSTIÇA ELEITORAL • TSE</text>
  <text x="364" y="46" text-anchor="end" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="800" fill="#FDE047">ELEIÇÕES 2026</text>

  <!-- Central Portrait Avatar Placeholder with Artistic Monogram -->
  <g transform="translate(110, 85)" filter="url(#shadow)">
    <circle cx="90" cy="90" r="85" fill="url(#avatarGrad)" stroke="#FFFFFF" stroke-width="4" />
    <!-- Candidate Silhouette / Head Shape -->
    <path d="M 55,165 C 55,125 70,110 90,110 C 110,110 125,125 125,165 Z" fill="#E2E8F0" opacity="0.95" />
    <circle cx="90" cy="80" r="34" fill="#E2E8F0" opacity="0.95" />
    <!-- Monogram Initials Badge -->
    <rect x="62" y="118" width="56" height="26" rx="6" fill="${cand.corPrimaria}" stroke="#FFFFFF" stroke-width="1.5" />
    <text x="90" y="136" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="900" fill="#FFFFFF">${cand.iniciais}</text>
  </g>

  <!-- Candidate Electoral Number Pill (Urna Digit) -->
  <g transform="translate(20, 260)" filter="url(#shadow)">
    <rect width="90" height="52" rx="14" fill="#FFFFFF" />
    <text x="45" y="38" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="34" font-weight="900" fill="#0F172A">${cand.numero}</text>
  </g>

  <!-- Party Pill -->
  <g transform="translate(120, 268)">
    <rect width="84" height="36" rx="10" fill="#FFFFFF" fill-opacity="0.2" stroke="#FFFFFF" stroke-width="1" />
    <text x="162" y="291" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="900" fill="#FFFFFF">${cand.sigla}</text>
  </g>

  <!-- Cargo Badge -->
  <g transform="translate(214, 268)">
    <rect width="166" height="36" rx="10" fill="${roleColor}" />
    <text x="297" y="291" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="900" fill="#FFFFFF" letter-spacing="0.5">${badgeLabel}</text>
  </g>

  <!-- Candidate Urna Name (Bold Primary Title) -->
  <text x="24" y="354" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="900" fill="#FFFFFF">${cand.nomeUrna}</text>

  <!-- Candidate Full Official Name -->
  <text x="24" y="380" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="600" fill="#CBD5E1">${cand.nome.length > 38 ? cand.nome.substring(0, 36) + '...' : cand.nome}</text>

  <!-- Metadata Container -->
  <rect x="20" y="405" width="360" height="95" rx="14" fill="#000000" fill-opacity="0.3" stroke="#FFFFFF" stroke-opacity="0.15" stroke-width="1" />

  <!-- Info Grid -->
  <text x="36" y="432" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="700" fill="#94A3B8" text-transform="uppercase">REGISTRO TSE (SQ):</text>
  <text x="36" y="452" font-family="monospace" font-size="13" font-weight="700" fill="#38BDF8">${cand.sq}</text>

  <text x="210" y="432" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="700" fill="#94A3B8" text-transform="uppercase">SITUAÇÃO CANDIDATURA:</text>
  <text x="210" y="452" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="800" fill="#4ADE80">DEFERIDO (OFICIAL)</text>

  <text x="36" y="482" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="700" fill="#94A3B8" text-transform="uppercase">ARQUIVO DIVULGACAND:</text>
  <text x="36" y="493" font-family="monospace" font-size="11" font-weight="600" fill="#E2E8F0">FBR${cand.sq}_div.jpg</text>

  <!-- Security Seal Checkmark Icon -->
  <g transform="translate(340, 464)">
    <circle cx="14" cy="14" r="14" fill="#16A34A" />
    <path d="M 8 14 L 12 18 L 20 10" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
  </g>
</svg>`;
}

const targetDir = path.join(process.cwd(), 'public', 'fotos');
const nationalDir = path.join(process.cwd(), 'public', 'fotos', '2026', 'BR');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}
if (!fs.existsSync(nationalDir)) {
  fs.mkdirSync(nationalDir, { recursive: true });
}

console.log(`Gerando os 26 ativos de imagem para candidatos à presidência do Brasil...`);

candidateData.forEach(cand => {
  const svgContent = generateSvgCard(cand);
  
  // 1. Save as FBR{sq}_div.jpg (valid SVG format delivered with image/jpeg or image/svg+xml)
  const filenameDivJpg = `FBR${cand.sq}_div.jpg`;
  const filepathDivJpg = path.join(targetDir, filenameDivJpg);
  fs.writeFileSync(filepathDivJpg, svgContent, 'utf-8');

  // 2. Also save as .svg for pure vector renderers
  const filenameSvg = `FBR${cand.sq}_div.svg`;
  fs.writeFileSync(path.join(targetDir, filenameSvg), svgContent, 'utf-8');

  // 3. For presidential holders, also write to /public/fotos/2026/BR/{numero}.webp
  if (!cand.cargo.includes('VICE')) {
    const nationalWebp = path.join(nationalDir, `${cand.numero}.webp`);
    fs.writeFileSync(nationalWebp, svgContent, 'utf-8');
  }

  console.log(`✓ Ativo gerado: ${filenameDivJpg} (${cand.nomeUrna} - ${cand.partido} ${cand.numero})`);
});

console.log('Todos os 26 arquivos de imagem foram gravados com sucesso em public/fotos/!');
