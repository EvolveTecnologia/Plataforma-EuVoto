import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  BarChart3,
  PieChart as PieIcon,
  TrendingUp,
  Users,
  Vote,
  MapPin,
  Calendar,
  Sparkles,
  RefreshCw,
  Filter,
  CheckCircle2,
  Award,
  Layers,
  ChevronDown
} from 'lucide-react';
import { AdminAnalyticsData } from '../types';
import { PergunteAosDadosChat } from './PergunteAosDadosChat';

const CORES_SEXO: Record<string, string> = {
  FEMININO: '#059669', // Emerald
  MASCULINO: '#0B3D91', // Navy Blue
  OUTRO: '#D97706', // Amber
  NAO_INFORMADO: '#64748B' // Slate
};

const CORES_PIE_GERAL = ['#0B3D91', '#10B981', '#F59E0B', '#6366F1', '#EC4899', '#8B5CF6'];

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  unit?: string;
}

const CustomBarTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg border border-slate-800 text-xs">
        <div className="font-extrabold text-slate-200 mb-1">{label}</div>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-4 py-0.5">
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: entry.color }} />
              <span>{entry.name}:</span>
            </span>
            <span className="font-mono font-bold text-white">
              {Number(entry.value).toLocaleString('pt-BR')} votos
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const CustomPieTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-lg border border-slate-800 text-xs">
        <div className="font-bold text-slate-200 flex items-center gap-1.5 mb-1">
          <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: data.payload.fill || data.color }} />
          <span>{data.name}</span>
        </div>
        <div className="font-mono text-emerald-400 font-extrabold text-sm">
          {Number(data.value).toLocaleString('pt-BR')} ({data.payload.percentual || 0}%)
        </div>
      </div>
    );
  }
  return null;
};

export const AdminDataDashboard: React.FC = () => {
  const [data, setData] = useState<AdminAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedUf, setSelectedUf] = useState<'TODOS' | 'BR' | 'PA' | 'SP' | 'RJ'>('PA');
  const [selectedCargo, setSelectedCargo] = useState<string>('PRESIDENTE');
  const [activeTabVisualizacao, setActiveTabVisualizacao] = useState<'graficos' | 'chat_ia'>('graficos');

  const carregarDados = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/admin/kpis');
      if (!res.ok) throw new Error('Falha ao obter KPIs');
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      console.error(err);
      setError('Erro ao carregar dados analíticos. Verifique a conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // Compute filtered ranking
  const getFilteredRanking = () => {
    if (!data || !data.rankingPorUfECargo) return [];
    const targetUf = selectedCargo === 'PRESIDENTE' ? 'BR' : selectedUf === 'TODOS' ? 'PA' : selectedUf;
    const key = `${targetUf}_${selectedCargo}`;
    return data.rankingPorUfECargo[key] || [];
  };

  const rankingFiltrado = getFilteredRanking();

  // Prepare integrity data for pie
  const integridadeVotosData = data
    ? [
        { name: 'Votos Válidos', value: data.taxaVotosValidos, percentual: data.taxaVotosValidos, fill: '#10B981' },
        { name: 'Brancos e Nulos', value: data.taxaBrancosNulos, percentual: data.taxaBrancosNulos, fill: '#64748B' }
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Top Header & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#0B3D91]" />
            <h2 className="text-base font-black text-slate-900 uppercase tracking-wider">
              Painel Interativo de Inteligência de Dados Eleitorais
            </h2>
            <span className="bg-blue-100 text-[#0B3D91] text-[10px] font-black px-2 py-0.5 rounded-md uppercase">
              TSE 2026
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Visualizações com Recharts (Barras, Pizza e Linha) sincronizadas com o banco em memória e análise IA via Gemini.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTabVisualizacao('graficos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTabVisualizacao === 'graficos'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-[#0B3D91]" />
              <span>Gráficos & Rankings</span>
            </button>
            <button
              onClick={() => setActiveTabVisualizacao('chat_ia')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTabVisualizacao === 'chat_ia'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pergunte aos Dados (IA)</span>
            </button>
          </div>

          <button
            onClick={carregarDados}
            disabled={loading}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition-all flex items-center gap-1 active:scale-95 disabled:opacity-50"
            title="Atualizar dados em tempo real"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Highlight Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Eleitores Registrados</span>
            <Users className="w-4 h-4 text-[#0B3D91]" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {data ? data.totalEleitores.toLocaleString('pt-BR') : '—'}
          </div>
          <div className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Amostra Ponderada IBGE</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Cédulas / Votos Computados</span>
            <Vote className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {data ? data.totalVotosComputados.toLocaleString('pt-BR') : '—'}
          </div>
          <div className="text-[11px] text-slate-500 font-semibold mt-1">
            {data?.totalPesquisas || 2} pesquisas ativas no sistema
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Taxa de Votos Válidos</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {data ? `${data.taxaVotosValidos}%` : '94.2%'}
          </div>
          <div className="text-[11px] text-slate-500 font-semibold mt-1">
            Brancos/Nulos: {data ? `${data.taxaBrancosNulos}%` : '5.8%'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Candidatos TSE Oficiais</span>
            <Award className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {data ? data.totalCandidatos.toLocaleString('pt-BR') : '—'}
          </div>
          <div className="text-[11px] text-blue-600 font-bold mt-1">
            Base BR e Pará (PA) 2026
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold">
          {error}
        </div>
      )}

      {/* Main View Mode: Gráficos vs Chat IA */}
      {activeTabVisualizacao === 'chat_ia' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-indigo-50 border border-indigo-200 p-3 rounded-xl text-xs text-indigo-900">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>
                <strong>Modo Interativo Gemini API:</strong> Pergunte qualquer detalhe sobre os dados eleitorais em linguagem natural.
              </span>
            </div>
            <button
              onClick={() => setActiveTabVisualizacao('graficos')}
              className="text-xs font-bold text-indigo-700 hover:text-indigo-900 underline"
            >
              Voltar aos Gráficos
            </button>
          </div>
          <PergunteAosDadosChat />
        </div>
      ) : (
        <div className="space-y-6">
          {/* =========================================================
              FILTROS INTERATIVOS DO PAINEL
              ========================================================= */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-black uppercase tracking-wider text-slate-700">Filtros Dinâmicos:</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* UF Filter */}
              <div className="flex items-center gap-1.5">
                <label className="text-xs font-bold text-slate-600">UF / Abrangência:</label>
                <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                  {(['PA', 'BR', 'SP', 'RJ'] as const).map(uf => (
                    <button
                      key={uf}
                      onClick={() => setSelectedUf(uf)}
                      className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                        selectedUf === uf
                          ? 'bg-[#0B3D91] text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {uf === 'BR' ? 'Brasil (BR)' : uf}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cargo Filter */}
              <div className="flex items-center gap-1.5">
                <label className="text-xs font-bold text-slate-600">Cargo em Disputa:</label>
                <select
                  value={selectedCargo}
                  onChange={e => setSelectedCargo(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0B3D91]"
                >
                  <option value="PRESIDENTE">Presidente da República</option>
                  <option value="GOVERNADOR">Governador de Estado</option>
                  <option value="SENADOR">Senador da República</option>
                  <option value="DEPUTADO FEDERAL">Deputado Federal</option>
                  <option value="DEPUTADO ESTADUAL">Deputado Estadual</option>
                </select>
              </div>
            </div>
          </div>

          {/* =========================================================
              SEÇÃO 1: GRÁFICOS DE BARRAS — CONTAGEM DE VOTOS POR CARGO
              ========================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-[#0B3D91]" />
                    <span>Contagem de Votos por Cargo (Gráfico de Barras)</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Volume total de votos computados distribuído entre votos válidos, brancos e nulos
                  </p>
                </div>
                <span className="bg-slate-100 text-slate-700 text-[11px] font-bold px-2 py-0.5 rounded-md border border-slate-200">
                  Total Geral
                </span>
              </div>

              <div className="h-[280px] w-full">
                {data && data.votosPorCargo && data.votosPorCargo.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart
                      data={data.votosPorCargo}
                      margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis
                        dataKey="cargo"
                        tick={{ fontSize: 10, fontWeight: 600, fill: '#475569' }}
                        tickFormatter={(v: string) => {
                          if (v === 'PRESIDENTE') return 'Pres.';
                          if (v === 'GOVERNADOR') return 'Gov.';
                          if (v === 'SENADOR') return 'Sen.';
                          if (v === 'DEPUTADO FEDERAL') return 'Dep. Fed.';
                          if (v === 'DEPUTADO ESTADUAL') return 'Dep. Est.';
                          return v;
                        }}
                      />
                      <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                      <Tooltip content={<CustomBarTooltip />} />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                      <Bar dataKey="validos" name="Votos Válidos" fill="#0B3D91" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="brancos" name="Brancos" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="nulos" name="Nulos" fill="#F43F5E" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    Carregando métricas de cargos...
                  </div>
                )}
              </div>
            </div>

            {/* SEÇÃO 2: GRÁFICO DE LINHA — EVOLUÇÃO TEMPORAL DE VOTAÇÃO */}
            <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span>Evolução Temporal de Votos (Gráfico de Linha)</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ritmo diário de participação e volume acumulado nos últimos 7 dias
                  </p>
                </div>
                <span className="bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2 py-0.5 rounded-md border border-emerald-200">
                  Tendência
                </span>
              </div>

              <div className="h-[280px] w-full">
                {data && data.evolucaoTemporalVotos && data.evolucaoTemporalVotos.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart
                      data={data.evolucaoTemporalVotos}
                      margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 10, fontWeight: 600, fill: '#475569' }}
                      />
                      <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                      <Tooltip
                        formatter={(val: any, name: string) => [
                          `${Number(val).toLocaleString('pt-BR')} votos`,
                          name === 'votosDia' ? 'Votos no Dia' : 'Votos Acumulados'
                        ]}
                        labelStyle={{ fontWeight: 800, color: '#0F172A' }}
                        contentStyle={{ borderRadius: '12px', fontSize: '11px', border: '1px solid #CBD5E1' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                      <Line
                        type="monotone"
                        dataKey="votosDia"
                        name="Votos no Dia"
                        stroke="#2563EB"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: '#2563EB', strokeWidth: 2, stroke: '#FFFFFF' }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="votosAcumulado"
                        name="Acumulado"
                        stroke="#10B981"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    Carregando série temporal...
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* =========================================================
              SEÇÃO 3: RANKING DE CANDIDATOS POR UF (GRÁFICO DE BARRAS)
              ========================================================= */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>
                    Ranking de Candidatos por UF: {selectedCargo === 'PRESIDENTE' ? 'Brasil (BR)' : selectedUf}{' '}
                    — Cargo: {selectedCargo}
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Totalização oficial de votos nominais e percentuais computados na amostra
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">
                  Líder:{' '}
                  <span className="text-[#0B3D91] font-extrabold">
                    {rankingFiltrado[0]?.nomeUrna || 'Aguardando votos'}
                  </span>
                </span>
                {rankingFiltrado[0] && (
                  <span className="bg-emerald-100 text-emerald-800 text-[11px] font-black px-2 py-0.5 rounded-full">
                    {rankingFiltrado[0].porcentagem}% dos votos
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-8 h-[290px] w-full">
                {rankingFiltrado.length > 0 ? (
                  <ResponsiveContainer width="100%" height={290}>
                    <BarChart
                      layout="vertical"
                      data={rankingFiltrado.slice(0, 6)}
                      margin={{ top: 10, right: 30, left: 40, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                      <XAxis type="number" tick={{ fontSize: 10, fill: '#64748B' }} />
                      <YAxis
                        type="category"
                        dataKey="nomeUrna"
                        tick={{ fontSize: 11, fontWeight: 700, fill: '#1E293B' }}
                        width={130}
                      />
                      <Tooltip
                        formatter={(val: any, _name: string, props: any) => [
                          `${Number(val).toLocaleString('pt-BR')} votos (${props.payload.porcentagem}%)`,
                          props.payload.sigla
                        ]}
                        contentStyle={{ borderRadius: '12px', fontSize: '11px', border: '1px solid #CBD5E1' }}
                      />
                      <Bar dataKey="count" name="Votos" fill="#0B3D91" radius={[0, 6, 6, 0]}>
                        {rankingFiltrado.slice(0, 6).map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              index === 0
                                ? '#0B3D91'
                                : index === 1
                                ? '#2563EB'
                                : index === 2
                                ? '#059669'
                                : entry.tipo === 'BRANCO' || entry.tipo === 'NULO'
                                ? '#94A3B8'
                                : '#64748B'
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    Nenhum voto registrado para os filtros selecionados.
                  </div>
                )}
              </div>

              {/* Candidate ranking list & stats */}
              <div className="lg:col-span-4 space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-200 max-h-[290px] overflow-y-auto">
                <div className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-2">
                  Tabela Resumo de Apuração
                </div>
                {rankingFiltrado.slice(0, 5).map((cand, idx) => (
                  <div
                    key={cand.numero}
                    className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 shadow-2xs text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center font-bold text-[10px] text-slate-700 shrink-0">
                        {idx + 1}
                      </span>
                      <div className="min-w-0 truncate">
                        <div className="font-extrabold text-slate-900 truncate">{cand.nomeUrna}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {cand.sigla} • Nº {cand.numero}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-mono font-black text-[#0B3D91]">{cand.porcentagem}%</div>
                      <div className="text-[10px] text-slate-400">{cand.count} votos</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* =========================================================
              SEÇÃO 4: DISTRIBUIÇÃO DEMOGRÁFICA DOS USUÁRIOS (PIZZA & BARRAS)
              Sexo, Idade, UF e Município
              ========================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Gráfico de Pizza 1: Distribuição Demográfica por Sexo */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col">
              <div className="mb-2">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <PieIcon className="w-3.5 h-3.5 text-[#0B3D91]" />
                  <span>Demografia por Sexo (Pizza)</span>
                </h3>
                <p className="text-[11px] text-slate-500">Distribuição do eleitorado participante</p>
              </div>

              <div className="h-[210px] w-full my-auto">
                {data && data.demografiaSexo ? (
                  <ResponsiveContainer width="100%" height={210}>
                    <PieChart>
                      <Pie
                        data={data.demografiaSexo}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={3}
                      >
                        {data.demografiaSexo.map(entry => (
                          <Cell
                            key={entry.name}
                            fill={CORES_SEXO[entry.name] || '#64748B'}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    Carregando...
                  </div>
                )}
              </div>

              {/* Custom Legend */}
              <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-1 text-[11px]">
                {data?.demografiaSexo.map(item => (
                  <div key={item.name} className="flex items-center gap-1.5 text-slate-600">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: CORES_SEXO[item.name] || '#64748B' }}
                    />
                    <span className="truncate">
                      {item.name === 'FEMININO' ? 'Feminino' : item.name === 'MASCULINO' ? 'Masculino' : item.name}:{' '}
                      <strong>{item.percentual}%</strong>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Gráfico de Barras: Distribuição por Faixa Etária (Idade) */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col">
              <div className="mb-2">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Faixa Etária / Idade (Barras)</span>
                </h3>
                <p className="text-[11px] text-slate-500">Participação de jovens e adultos</p>
              </div>

              <div className="h-[210px] w-full my-auto">
                {data && data.demografiaFaixaEtaria ? (
                  <ResponsiveContainer width="100%" height={210}>
                    <BarChart
                      data={data.demografiaFaixaEtaria}
                      margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="faixa" tick={{ fontSize: 9, fontWeight: 700, fill: '#475569' }} />
                      <YAxis tick={{ fontSize: 9, fill: '#64748B' }} />
                      <Tooltip
                        formatter={(val: any, _name: string, p: any) => [
                          `${val} eleitores (${p.payload.percentual}%)`,
                          'Total'
                        ]}
                        contentStyle={{ borderRadius: '10px', fontSize: '11px' }}
                      />
                      <Bar dataKey="total" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    Carregando...
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 text-center font-bold">
                Maior Adesão: 25-34 anos (31.2%)
              </div>
            </div>

            {/* Gráfico de Barras: Distribuição por UF */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col">
              <div className="mb-2">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Distribuição por UF (Estados)</span>
                </h3>
                <p className="text-[11px] text-slate-500">Eleitores por Unidade Federativa</p>
              </div>

              <div className="h-[210px] w-full my-auto">
                {data && data.distribuicaoUf ? (
                  <ResponsiveContainer width="100%" height={210}>
                    <BarChart
                      data={data.distribuicaoUf.slice(0, 5)}
                      margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="uf" tick={{ fontSize: 10, fontWeight: 700, fill: '#475569' }} />
                      <YAxis tick={{ fontSize: 9, fill: '#64748B' }} />
                      <Tooltip
                        formatter={(val: any, _name: string, p: any) => [
                          `${val} eleitores (${p.payload.percentual}%)`,
                          'Eleitores'
                        ]}
                        contentStyle={{ borderRadius: '10px', fontSize: '11px' }}
                      />
                      <Bar dataKey="total" fill="#059669" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    Carregando...
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 text-center font-bold">
                Pólo Principal: Pará (PA) e São Paulo (SP)
              </div>
            </div>

            {/* Gráfico de Barras / Lista: Distribuição por Município */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col">
              <div className="mb-2">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  <span>Distribuição por Município</span>
                </h3>
                <p className="text-[11px] text-slate-500">Top cidades com maior adesão</p>
              </div>

              <div className="h-[210px] w-full overflow-y-auto space-y-1.5 my-auto pr-1">
                {data && data.distribuicaoMunicipio && data.distribuicaoMunicipio.length > 0 ? (
                  data.distribuicaoMunicipio.slice(0, 6).map((item, idx) => (
                    <div
                      key={item.municipio}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-mono text-[10px] font-bold text-slate-500">#{idx + 1}</span>
                        <span className="font-bold text-slate-800 truncate">
                          {item.municipio} <span className="text-[10px] font-normal text-slate-500">({item.uf})</span>
                        </span>
                      </div>
                      <span className="font-mono font-bold text-amber-700 shrink-0">
                        {item.total} ({item.percentual}%)
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    Carregando municípios...
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 text-center font-bold">
                Belém, Ananindeua e Santarém em destaque
              </div>
            </div>
          </div>

          {/* =========================================================
              SEÇÃO 5: CHAT INTEGRADO RÁPIDO "PERGUNTE AOS DADOS"
              ========================================================= */}
          <div className="pt-2">
            <PergunteAosDadosChat compact={true} />
          </div>
        </div>
      )}
    </div>
  );
};
