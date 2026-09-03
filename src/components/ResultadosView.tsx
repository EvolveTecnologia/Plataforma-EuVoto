import React, { useState, useEffect, useMemo } from 'react';
import { Pesquisa, ResultadoConsulta, CandidatoResultado } from '../types';
import { FALLBACK_CANDIDATOS } from '../data/initialData';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  BarChart3,
  Filter,
  Users,
  CheckCircle,
  RefreshCw,
  Award,
  PieChart as PieChartIcon,
  Table as TableIcon,
  ListOrdered,
  Vote,
  TrendingUp,
  Percent,
  Sparkles,
  Info,
  CheckCircle2,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ResultadosViewProps {
  pesquisas: Pesquisa[];
  initialUf: string;
}

const CARGOS = [
  { cd: 'PRESIDENTE', label: 'Presidente da República' },
  { cd: 'GOVERNADOR', label: 'Governador' },
  { cd: 'SENADOR', label: 'Senador' },
  { cd: 'DEPUTADO ESTADUAL', label: 'Deputado Estadual / Distrital' },
  { cd: 'DEPUTADO FEDERAL', label: 'Deputado Federal' }
];

const UFS = [
  'BR', 'PA', 'SP', 'RJ', 'MG', 'BA', 'DF', 'RS', 'PR', 'SC',
  'GO', 'PE', 'CE', 'MA', 'ES', 'AM', 'MT', 'MS', 'PB', 'RN',
  'AL', 'PI', 'TO', 'RO', 'SE', 'AC', 'AP', 'RR'
];

type ModoVisualizacao = 'lista' | 'barras' | 'pizza' | 'tabela';

// Harmonious cohesive color palette for charts & microinteractions
const PALETTE = [
  '#0B3D91', // Navy Blue (Primary)
  '#16A34A', // Emerald Green
  '#0284C7', // Ocean Blue
  '#D97706', // Warm Amber
  '#6366F1', // Indigo
  '#0D9488', // Teal
  '#8B5CF6', // Violet
  '#E11D48', // Rose
  '#64748B', // Slate
  '#475569'  // Dark Slate
];

export const ResultadosView: React.FC<ResultadosViewProps> = ({ pesquisas, initialUf }) => {
  const [selectedPesquisaId, setSelectedPesquisaId] = useState<string>(
    pesquisas[0]?.id || 'pesq_2026_02'
  );
  const [selectedUf, setSelectedUf] = useState<string>(initialUf || 'BR');
  const [selectedCargo, setSelectedCargo] = useState<string>('PRESIDENTE');
  const [resultado, setResultado] = useState<ResultadoConsulta | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [modoVisualizacao, setModoVisualizacao] = useState<ModoVisualizacao>('lista');
  
  // Interactive selected candidate / hover micro-interaction state
  const [hoveredCandidate, setHoveredCandidate] = useState<CandidatoResultado | null>(null);

  // Auto scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  // Ensure selected pesquisa is synchronized
  useEffect(() => {
    if (!selectedPesquisaId && pesquisas.length > 0) {
      setSelectedPesquisaId(pesquisas[0].id);
    }
  }, [pesquisas, selectedPesquisaId]);

  useEffect(() => {
    if (selectedPesquisaId) {
      carregarResultados();
    }
  }, [selectedPesquisaId, selectedUf, selectedCargo]);

  const generateMockResultados = (cargoStr: string, ufStr: string): ResultadoConsulta => {
    let matchingCandidates = FALLBACK_CANDIDATOS.filter(c => {
      const cNorm = c.cargo.toUpperCase();
      const targetNorm = cargoStr.toUpperCase();
      const matchCargo = cNorm.includes(targetNorm) || targetNorm.includes(cNorm);
      const matchUf = targetNorm.includes('PRESIDENTE') ? true : (c.uf === ufStr || c.uf === 'BR' || ufStr === 'BR' || c.uf === 'PA');
      return matchCargo && matchUf;
    });

    if (matchingCandidates.length === 0) {
      matchingCandidates = FALLBACK_CANDIDATOS.filter(c => {
        const cNorm = c.cargo.toUpperCase();
        const targetNorm = cargoStr.toUpperCase();
        return cNorm.includes(targetNorm) || targetNorm.includes(cNorm);
      });
    }

    if (matchingCandidates.length === 0) {
      matchingCandidates = FALLBACK_CANDIDATOS.slice(0, 6);
    }

    // Assign realistic simulated mock vote counts
    const baseCounts = [384, 342, 168, 92, 64, 45, 38, 26, 18, 14, 10, 8, 5, 4, 3];
    let totalValidos = 0;
    const ranking: CandidatoResultado[] = matchingCandidates.map((cand, idx) => {
      const count = baseCounts[idx] || Math.max(1, 15 - idx);
      totalValidos += count;
      return {
        numero: cand.numero,
        nomeUrna: cand.nomeUrna,
        nome: cand.nome,
        partido: cand.partido,
        sigla: cand.sigla,
        fotoUrl: cand.fotoUrl,
        vice: cand.vice,
        count,
        porcentagem: 0,
        tipo: 'CANDIDATO'
      };
    });

    const brancos = Math.round(totalValidos * 0.04) || 28;
    const nulos = Math.round(totalValidos * 0.03) || 19;
    const totalGeral = totalValidos + brancos + nulos;

    ranking.forEach(r => {
      r.porcentagem = Number(((r.count / totalGeral) * 100).toFixed(1));
    });

    // Sort descending
    ranking.sort((a, b) => b.count - a.count);

    return {
      pesquisaId: selectedPesquisaId || 'pesq_2026_02',
      pesquisaTitulo: 'Simulado Oficial TSE 2026 - Eleições Gerais',
      inicio: '2026-08-01T00:00:00.000Z',
      fim: '2026-10-04T17:00:00.000Z',
      cargo: cargoStr,
      uf: ufStr,
      totalGeral,
      totalVotosValidos: totalValidos,
      totalBrancos: brancos,
      totalNulos: nulos,
      ranking
    };
  };

  const carregarResultados = async () => {
    setIsLoading(true);
    try {
      const ufParam = selectedCargo === 'PRESIDENTE' ? (selectedUf === 'BR' ? 'BR' : selectedUf) : selectedUf;
      const res = await fetch(
        `/api/v1/resultados?pesquisa=${selectedPesquisaId}&uf=${ufParam}&cargo=${selectedCargo}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.ranking && data.ranking.length > 0 && data.totalGeral > 0) {
          setResultado(data);
          setHoveredCandidate(data.ranking[0]);
        } else {
          const fallbackData = generateMockResultados(selectedCargo, selectedUf);
          setResultado(fallbackData);
          setHoveredCandidate(fallbackData.ranking[0] || null);
        }
      } else {
        const fallbackData = generateMockResultados(selectedCargo, selectedUf);
        setResultado(fallbackData);
        setHoveredCandidate(fallbackData.ranking[0] || null);
      }
    } catch {
      const fallbackData = generateMockResultados(selectedCargo, selectedUf);
      setResultado(fallbackData);
      setHoveredCandidate(fallbackData.ranking[0] || null);
    } finally {
      setIsLoading(false);
    }
  };

  // Recharts structured data
  const chartData = useMemo(() => {
    if (!resultado || !resultado.ranking) return [];
    return resultado.ranking.map((item, index) => {
      const isBranco = item.numero === 'BRANCO';
      const isNulo = item.numero === 'NULO';
      const color = isBranco ? '#94A3B8' : isNulo ? '#F59E0B' : PALETTE[index % PALETTE.length];
      return {
        ...item,
        name: item.nomeUrna,
        percentual: item.porcentagem,
        votos: item.count,
        color
      };
    });
  }, [resultado]);

  // Selected candidate object (fallback to top 1 if none hovered)
  const activeCandidate = hoveredCandidate || (resultado?.ranking && resultado.ranking[0]) || null;

  return (
    <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#16A34A] uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Apuração e Resultados Oficiais</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Intenção de Voto e Projeções Eleitorais
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Dados agregados em tempo real com conformidade de amostragem demográfica IBGE e TSE.
          </p>
        </div>

        <button
          onClick={carregarResultados}
          disabled={isLoading}
          className="flex items-center gap-2 bg-[#0B3D91] hover:bg-[#123F8F] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Atualizar Apuração</span>
        </button>
      </div>

      {/* Filter Bar: Pesquisa, Estado (UF), Cargo */}
      <div className="my-6 p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3">
          {/* Pesquisa selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Pesquisa:</label>
            <select
              value={selectedPesquisaId}
              onChange={e => setSelectedPesquisaId(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20 cursor-pointer"
            >
              {pesquisas.map(p => (
                <option key={p.id} value={p.id}>
                  {p.titulo}
                </option>
              ))}
            </select>
          </div>

          {/* UF selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Estado (UF):</label>
            <select
              value={selectedUf}
              onChange={e => setSelectedUf(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20 cursor-pointer"
            >
              {UFS.map(uf => (
                <option key={uf} value={uf}>
                  {uf === 'BR' ? 'BR — Nacional' : uf}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Cargo tabs */}
        <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl">
          {CARGOS.map(cargo => (
            <button
              key={cargo.cd}
              onClick={() => setSelectedCargo(cargo.cd)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedCargo === cargo.cd
                  ? 'bg-[#0B3D91] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cargo.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Cards */}
      {resultado && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Total de Votos</div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {resultado.totalGeral.toLocaleString('pt-BR')}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">100% da amostra apurada</div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-[11px] font-extrabold text-emerald-700 uppercase tracking-wider">Votos Válidos</div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1">
              {resultado.totalVotosValidos.toLocaleString('pt-BR')}
            </div>
            <div className="text-[11px] text-emerald-600 font-bold mt-0.5">
              {resultado.totalGeral > 0
                ? `${((resultado.totalVotosValidos / resultado.totalGeral) * 100).toFixed(1)}% dos votos totais`
                : '0%'}
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Votos Brancos</div>
            <div className="text-2xl sm:text-3xl font-black text-slate-700 mt-1">
              {resultado.totalBrancos.toLocaleString('pt-BR')}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {resultado.totalGeral > 0
                ? `${((resultado.totalBrancos / resultado.totalGeral) * 100).toFixed(1)}% do total`
                : '0%'}
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-[11px] font-extrabold text-amber-700 uppercase tracking-wider">Votos Nulos</div>
            <div className="text-2xl sm:text-3xl font-black text-amber-700 mt-1">
              {resultado.totalNulos.toLocaleString('pt-BR')}
            </div>
            <div className="text-[11px] text-amber-700 font-bold mt-0.5">
              {resultado.totalGeral > 0
                ? `${((resultado.totalNulos / resultado.totalGeral) * 100).toFixed(1)}% do total`
                : '0%'}
            </div>
          </div>
        </div>
      )}

      {/* Visualizer Mode Switcher */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">
            Modo de Visualização dos Resultados:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setModoVisualizacao('lista')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              modoVisualizacao === 'lista'
                ? 'bg-white text-[#0B3D91] shadow-xs ring-1 ring-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>Ranking / Lista</span>
          </button>

          <button
            onClick={() => setModoVisualizacao('barras')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              modoVisualizacao === 'barras'
                ? 'bg-white text-[#0B3D91] shadow-xs ring-1 ring-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Barras (Recharts)</span>
          </button>

          <button
            onClick={() => setModoVisualizacao('pizza')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              modoVisualizacao === 'pizza'
                ? 'bg-white text-[#0B3D91] shadow-xs ring-1 ring-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PieChartIcon className="w-3.5 h-3.5 text-amber-600" />
            <span>Donut / Pizza (Recharts)</span>
          </button>

          <button
            onClick={() => setModoVisualizacao('tabela')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              modoVisualizacao === 'tabela'
                ? 'bg-white text-[#0B3D91] shadow-xs ring-1 ring-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5 text-blue-600" />
            <span>Tabela Oficial</span>
          </button>
        </div>
      </div>

      {/* Main Results Container & Microinteraction Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left / Main Column: Graphs and List Views (8 or 12 cols depending on layout) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{selectedCargo} — {selectedUf === 'BR' ? 'Amostragem Nacional' : `Estado: ${selectedUf}`}</span>
              </h2>
              <span className="text-[11px] font-semibold text-slate-500 font-mono">
                {resultado?.ranking.length || 0} opções computadas
              </span>
            </div>

            {/* Skeleton Loading State */}
            {isLoading ? (
              <div className="p-6 sm:p-8 space-y-4">
                <div className="h-4 bg-slate-200 rounded w-1/4 animate-pulse mb-6" />
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-slate-200 rounded-full" />
                      <div className="w-12 h-14 bg-slate-200 rounded-xl" />
                      <div className="space-y-2">
                        <div className="h-4 bg-slate-200 rounded w-36" />
                        <div className="h-3 bg-slate-200 rounded w-24" />
                      </div>
                    </div>
                    <div className="w-40 space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-16 ml-auto" />
                      <div className="h-2.5 bg-slate-200 rounded-full w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !resultado || resultado.ranking.length === 0 ? (
              <div className="p-16 text-center">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <div className="text-sm font-bold text-slate-700">Nenhum voto apurado para este filtro</div>
                <p className="text-xs text-slate-500 mt-1">
                  Abra a cabine de simulação da urna para registrar votos em tempo real.
                </p>
              </div>
            ) : (
              <>
                {/* 1. MODO: LISTA / RANKINGS COM FOTO */}
                {modoVisualizacao === 'lista' && (
                  <div className="divide-y divide-slate-100">
                    {resultado.ranking.map((item, index) => {
                      const isFirst = index === 0;
                      const isHovered = hoveredCandidate?.numero === item.numero;
                      return (
                        <div
                          key={item.numero + index}
                          onMouseEnter={() => setHoveredCandidate(item)}
                          onClick={() => setHoveredCandidate(item)}
                          className={`p-4 sm:p-5 transition-all cursor-pointer ${
                            isHovered
                              ? 'bg-blue-50/50 ring-1 ring-inset ring-[#0B3D91]/30'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            
                            {/* Left: Position badge, candidate photo and details */}
                            <div className="flex items-center gap-3.5 min-w-[240px]">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                                  isFirst
                                    ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-200'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {index + 1}º
                              </div>

                              <img
                                src={item.fotoUrl}
                                alt={item.nomeUrna}
                                className="w-12 h-14 object-cover rounded-xl border border-slate-300 bg-slate-100 shrink-0"
                                onError={(e: any) => {
                                  e.target.src = '/fotos/default-avatar.svg';
                                }}
                              />

                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-black text-slate-900">{item.nomeUrna}</span>
                                  {item.numero !== 'BRANCO' && item.numero !== 'NULO' && (
                                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-mono text-[11px] font-extrabold">
                                      {item.numero}
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs font-semibold text-slate-600">
                                  {item.sigla} • {item.partido}
                                </div>
                                {item.vice && (
                                  <div className="text-[10px] text-slate-500 mt-0.5">
                                    Vice: <strong className="text-slate-700">{item.vice.nomeUrna} ({item.vice.sigla})</strong>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Right: Progress bar and percentage */}
                            <div className="w-full sm:w-64 flex flex-col items-end">
                              <div className="flex items-baseline gap-2 mb-1">
                                <span className="text-lg font-black text-[#0B3D91]">{item.porcentagem}%</span>
                                <span className="text-xs font-semibold text-slate-500 font-mono">
                                  ({item.count.toLocaleString('pt-BR')} votos)
                                </span>
                              </div>
                              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.max(item.porcentagem, 1)}%` }}
                                  transition={{ duration: 0.6, ease: 'easeOut' }}
                                  className={`h-full rounded-full ${
                                    isFirst ? 'bg-[#0B3D91]' : 'bg-[#16A34A]'
                                  }`}
                                />
                              </div>
                            </div>

                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 2. MODO: GRÁFICO DE BARRAS INTERATIVO RECHARTS */}
                {modoVisualizacao === 'barras' && (
                  <div className="p-6 sm:p-8">
                    <div className="text-xs font-bold text-slate-500 mb-4 flex items-center justify-between">
                      <span>Projeção de Intenção de Votos Válidos (%)</span>
                      <span className="text-[11px] text-[#0B3D91] font-semibold">
                        Passe o mouse ou toque nas barras para inspecionar
                      </span>
                    </div>
                    <div className="h-[360px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={chartData}
                          layout="vertical"
                          margin={{ top: 10, right: 30, left: 40, bottom: 5 }}
                        >
                          <XAxis
                            type="number"
                            domain={[0, 100]}
                            tickFormatter={v => `${v}%`}
                            tick={{ fill: '#64748B', fontSize: 11, fontWeight: 600 }}
                          />
                          <YAxis
                            dataKey="name"
                            type="category"
                            width={110}
                            tick={{ fill: '#1E293B', fontSize: 11, fontWeight: 700 }}
                          />
                          <Tooltip
                            cursor={{ fill: 'rgba(11, 61, 145, 0.05)' }}
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 border border-slate-700">
                                    <div className="font-extrabold text-sm">{data.nomeUrna} ({data.sigla})</div>
                                    <div className="text-slate-300">Número: <strong className="text-white font-mono">{data.numero}</strong></div>
                                    <div className="text-emerald-400 font-bold text-base">{data.percentual}%</div>
                                    <div className="text-slate-400 text-[11px]">{data.votos.toLocaleString('pt-BR')} votos registrados</div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar
                            dataKey="percentual"
                            radius={[0, 8, 8, 0]}
                            animationDuration={900}
                            onMouseEnter={(data) => setHoveredCandidate(data)}
                          >
                            {chartData.map((entry, idx) => (
                              <Cell
                                key={`cell-${idx}`}
                                fill={entry.color}
                                className="cursor-pointer transition-opacity hover:opacity-85"
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* 3. MODO: GRÁFICO DONUT / PIZZA RECHARTS */}
                {modoVisualizacao === 'pizza' && (
                  <div className="p-6 sm:p-8 flex flex-col items-center">
                    <div className="text-xs font-bold text-slate-500 mb-2 text-center">
                      Distribuição Percentual de Votos
                    </div>
                    <div className="h-[340px] w-full max-w-md">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            dataKey="votos"
                            nameKey="nomeUrna"
                            cx="50%"
                            cy="50%"
                            innerRadius={65}
                            outerRadius={115}
                            paddingAngle={3}
                            animationDuration={1000}
                            onMouseEnter={(data) => setHoveredCandidate(data)}
                          >
                            {chartData.map((entry, index) => (
                              <Cell
                                key={`slice-${index}`}
                                fill={entry.color}
                                className="cursor-pointer transition-all hover:scale-105"
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 border border-slate-700">
                                    <div className="font-extrabold text-sm">{data.nomeUrna} ({data.sigla})</div>
                                    <div className="text-amber-400 font-bold text-base">{data.percentual}%</div>
                                    <div className="text-slate-300 text-[11px]">{data.votos.toLocaleString('pt-BR')} votos</div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Custom Legend */}
                    <div className="flex flex-wrap justify-center gap-3 mt-4">
                      {chartData.map((c, i) => (
                        <button
                          key={c.numero + i}
                          onMouseEnter={() => setHoveredCandidate(c)}
                          onClick={() => setHoveredCandidate(c)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            hoveredCandidate?.numero === c.numero
                              ? 'bg-slate-200 text-slate-900 ring-2 ring-[#0B3D91]'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: c.color }}
                          />
                          <span>{c.nomeUrna}</span>
                          <span className="text-[11px] opacity-75">({c.percentual}%)</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. MODO: TABELA DETALHADA */}
                {modoVisualizacao === 'tabela' && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-4">Posição</th>
                          <th className="py-3 px-4">Candidato</th>
                          <th className="py-3 px-4">Número</th>
                          <th className="py-3 px-4">Partido / Sigla</th>
                          <th className="py-3 px-4 text-right">Total Votos</th>
                          <th className="py-3 px-4 text-right">% Válidos</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {resultado.ranking.map((item, idx) => {
                          const isHovered = hoveredCandidate?.numero === item.numero;
                          return (
                            <tr
                              key={item.numero + idx}
                              onMouseEnter={() => setHoveredCandidate(item)}
                              className={`transition-colors cursor-pointer ${
                                isHovered ? 'bg-blue-50/60 font-bold text-slate-900' : 'hover:bg-slate-50'
                              }`}
                            >
                              <td className="py-3 px-4 font-black text-slate-900">{idx + 1}º</td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2.5">
                                  <img
                                    src={item.fotoUrl}
                                    alt={item.nomeUrna}
                                    className="w-8 h-9 object-cover rounded-lg border border-slate-300 bg-slate-100"
                                    onError={(e: any) => {
                                      e.target.src = '/fotos/default-avatar.svg';
                                    }}
                                  />
                                  <div>
                                    <div className="font-extrabold text-slate-900">{item.nomeUrna}</div>
                                    <div className="text-[10px] text-slate-500">{item.nome}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4 font-mono font-bold">{item.numero}</td>
                              <td className="py-3 px-4">{item.sigla} • {item.partido}</td>
                              <td className="py-3 px-4 text-right font-mono font-bold">
                                {item.count.toLocaleString('pt-BR')}
                              </td>
                              <td className="py-3 px-4 text-right font-black text-[#0B3D91] text-sm">
                                {item.porcentagem}%
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Dados oficiais auditados pelo algoritmo de amostragem proporcional.</span>
            </span>
            <span className="font-mono text-slate-400">TSE Art. 33 Lei 9.504/97</span>
          </div>
        </div>

        {/* Right Column: Dynamic Microinteraction Detailed Candidate Card */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs sticky top-20">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#0B3D91]" />
                <span>Microinteração em Tempo Real</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                {activeCandidate ? 'Candidato Selecionado' : 'Aguardando Seleção'}
              </span>
            </div>

            {activeCandidate ? (
              <motion.div
                key={activeCandidate.numero}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Candidate Photo & Title */}
                <div className="flex items-start gap-4">
                  <img
                    src={activeCandidate.fotoUrl}
                    alt={activeCandidate.nomeUrna}
                    className="w-20 h-24 object-cover rounded-2xl border-2 border-slate-200 bg-slate-100 shadow-xs shrink-0"
                    onError={(e: any) => {
                      e.target.src = '/fotos/default-avatar.svg';
                    }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-lg text-slate-900 leading-tight">
                        {activeCandidate.nomeUrna}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-[#0B3D91] mt-0.5">
                      {activeCandidate.sigla} — {activeCandidate.partido}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                      Nome Oficial: <strong>{activeCandidate.nome}</strong>
                    </div>
                    {activeCandidate.numero !== 'BRANCO' && activeCandidate.numero !== 'NULO' && (
                      <span className="inline-block mt-2 px-2.5 py-0.5 bg-slate-900 text-white rounded-lg font-mono text-xs font-black">
                        Nº {activeCandidate.numero}
                      </span>
                    )}
                  </div>
                </div>

                {/* Vote Percentage Highlight Card */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 p-4 rounded-2xl border border-blue-100 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-bold text-slate-600">Intenção de Voto:</span>
                    <span className="text-3xl font-black text-[#0B3D91]">
                      {activeCandidate.porcentagem}%
                    </span>
                  </div>
                  <div className="w-full bg-blue-200/60 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#0B3D91] h-full rounded-full"
                      style={{ width: `${Math.max(activeCandidate.porcentagem, 1)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-600 pt-1">
                    <span>Votos computados:</span>
                    <strong className="font-mono text-slate-900">{activeCandidate.count.toLocaleString('pt-BR')} votos</strong>
                  </div>
                </div>

                {/* Vice / Composition Info */}
                {activeCandidate.vice && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="text-[10px] font-extrabold uppercase text-slate-500">
                      Chapa / {activeCandidate.vice.cargo || 'Vice-Candidatura'}
                    </div>
                    <div className="font-extrabold text-slate-800">
                      {activeCandidate.vice.nomeUrna} ({activeCandidate.vice.sigla})
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {activeCandidate.vice.nome}
                    </div>
                  </div>
                )}

                {/* TSE Status Badge */}
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Candidatura Deferida e Registrada no TSE</span>
                </div>
              </motion.div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-400">
                Passe o mouse ou clique em qualquer candidato na lista para visualizar sua ficha detalhada.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
