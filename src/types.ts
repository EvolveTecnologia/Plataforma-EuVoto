export type CargoCodigo = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface ViceOrSuplente {
  nomeUrna: string;
  nomeCompleto?: string;
  sigla: string;
  partido?: string;
  fotoUrl?: string;
  cargo?: string;
}

export interface Candidato {
  id: string; // ano_uf_cargoCd_numero
  ano: number;
  uf: string;
  cargoCd: number;
  cargo: string;
  numero: string;
  sequencial: string;
  nome: string;
  nomeUrna: string;
  nomeSocial?: string | null;
  situacao: string;
  sigla: string;
  partido: string;
  federacao?: string | null;
  composicaoFederacao?: string | null;
  chapaId?: string; // SQ_COLIGACAO
  coligacao?: string;
  vice?: ViceOrSuplente | null;
  suplentes?: ViceOrSuplente[];
  fotoUrl: string;
  genero: string;
  ufNascimento?: string;
  dtNascimento?: string;
  ocupacao?: string;
}

export type PesquisaStatus = 'draft' | 'ativa' | 'encerrada' | 'publicada';

export interface Pesquisa {
  id: string;
  titulo: string;
  descricao: string;
  inicio: string;
  fim: string;
  status: PesquisaStatus;
  ufs: string[];
  metodologia: string;
  createdBy: string;
  totalVotos?: number;
}

export interface VotoCargo {
  tipo: 'CANDIDATO' | 'BRANCO' | 'NULO';
  numero: string;
  candidatoRef?: string;
  candidatoNome?: string;
  partido?: string;
}

export interface VotoCedula {
  pesquisaId: string;
  uid: string;
  uf: string;
  municipio: string;
  cargos: {
    deputadoFederal: VotoCargo;
    deputadoEstadual: VotoCargo;
    senador1: VotoCargo;
    senador2: VotoCargo;
    governador: VotoCargo;
    presidente: VotoCargo;
  };
  ts: string;
}

export interface ResultadoItem {
  numero: string;
  nomeUrna: string;
  nome?: string;
  partido: string;
  sigla: string;
  fotoUrl: string;
  vice?: ViceOrSuplente;
  count: number;
  porcentagem: number;
  tipo?: 'CANDIDATO' | 'BRANCO' | 'NULO';
}

export type CandidatoResultado = ResultadoItem;

export interface ResultadoConsulta {
  pesquisaId: string;
  pesquisaTitulo: string;
  inicio: string;
  fim: string;
  uf: string;
  cargo: string;
  totalVotosValidos: number;
  totalBrancos: number;
  totalNulos: number;
  totalGeral: number;
  ranking: ResultadoItem[];
}

export interface UsuarioPerfil {
  uid: string;
  nome: string;
  email: string;
  sexo: 'MASCULINO' | 'FEMININO' | 'OUTRO' | 'NAO_INFORMADO';
  dtNascimento: string;
  idade: number;
  celular: string;
  cpfHash: string;
  cpfMascarado?: string;
  municipio: string;
  uf: string;
  pushToken?: string;
  optInPush: boolean;
  isAdmin?: boolean;
  status?: 'ATIVO' | 'BLOQUEADO' | 'PENDENTE';
  createdAt: string;
}

export interface EtlLogItem {
  id: string;
  arquivo: string;
  uf: string;
  ano: number;
  totalLinhas: number;
  inseridos: number;
  rejeitados: number;
  status: 'processando' | 'sucesso' | 'erro';
  erros: string[];
  timestamp: string;
}

export interface ConfigLanding {
  sobreTitulo: string;
  sobreTexto: string;
  metodologiaTitulo: string;
  metodologiaTexto: string;
  avisoLegalTSE: string;
  contatoEmail: string;
  contatoTelefone: string;
  atualizadoEm: string;
}

export interface NotificacaoPush {
  id: string;
  titulo: string;
  mensagem: string;
  uf: string;
  pesquisaId?: string;
  enviadoEm: string;
  lidoPor?: string[];
}

export interface VotosPorCargoItem {
  cargo: string;
  total: number;
  validos: number;
  brancos: number;
  nulos: number;
}

export interface CandidatoRankingItem {
  numero: string;
  nomeUrna: string;
  sigla: string;
  partido: string;
  fotoUrl: string;
  count: number;
  porcentagem: number;
  tipo?: string;
}

export interface RankingUfCargo {
  uf: string;
  cargo: string;
  totalVotos: number;
  ranking: CandidatoRankingItem[];
}

export interface DemografiaItem {
  name: string;
  value: number;
  percentual: number;
}

export interface FaixaEtariaItem {
  faixa: string;
  total: number;
  percentual: number;
}

export interface UfDistribuicaoItem {
  uf: string;
  total: number;
  percentual: number;
}

export interface MunicipioDistribuicaoItem {
  municipio: string;
  uf: string;
  total: number;
  percentual: number;
}

export interface EvolucaoTemporalItem {
  data: string;
  label: string;
  votosDia: number;
  votosAcumulado: number;
  brancosNulos: number;
}

export interface AdminAnalyticsData {
  totalEleitores: number;
  totalVotosComputados: number;
  totalPesquisas: number;
  totalCandidatos: number;
  taxaVotosValidos: number;
  taxaBrancosNulos: number;
  votosPorCargo: VotosPorCargoItem[];
  rankingPorUfECargo: Record<string, CandidatoRankingItem[]>; // key: `${uf}_${cargo}`
  demografiaSexo: DemografiaItem[];
  demografiaFaixaEtaria: FaixaEtariaItem[];
  distribuicaoUf: UfDistribuicaoItem[];
  distribuicaoMunicipio: MunicipioDistribuicaoItem[];
  evolucaoTemporalVotos: EvolucaoTemporalItem[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'gemini';
  text: string;
  timestamp: string;
}

