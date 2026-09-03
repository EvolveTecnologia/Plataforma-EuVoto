import React, { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, Vote, Award, Search, Users, CheckCircle2, Filter, RotateCcw } from 'lucide-react';
import { Candidato, Pesquisa } from '../types';

interface CandidatosShowcaseProps {
  onVotarCandidato?: (numero: string) => void;
  pesquisas: Pesquisa[];
}

const CARGOS = [
  { cd: 1, label: 'Presidente da República' },
  { cd: 3, label: 'Governador' },
  { cd: 5, label: 'Senador' },
  { cd: 6, label: 'Deputado Federal' },
  { cd: 7, label: 'Deputado Estadual' },
];

const UFS = [
  'BR', 'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR', 'RJ',
  'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO'
];

export const CandidatosShowcase: React.FC<CandidatosShowcaseProps> = ({
  onVotarCandidato
}) => {
  // Filters: By default, starts loaded with Presidents
  const [cargoSelecionado, setCargoSelecionado] = useState<number | 'todos'>(1);
  const [ufSelecionada, setUfSelecionada] = useState<string>('BR');
  const [partidoSelecionado, setPartidoSelecionado] = useState<string>('todos');
  const [busca, setBusca] = useState<string>('');

  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [partidosDisponiveis, setPartidosDisponiveis] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch candidates from dynamic API based on filters
  const carregarCandidatos = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('ano', '2026');

      if (cargoSelecionado !== 'todos') {
        params.set('cargo', cargoSelecionado.toString());
      }
      if (ufSelecionada && ufSelecionada !== 'todos') {
        params.set('uf', ufSelecionada);
      }
      if (partidoSelecionado && partidoSelecionado !== 'todos') {
        params.set('partido', partidoSelecionado);
      }
      if (busca.trim()) {
        params.set('busca', busca.trim());
      }

      const res = await fetch(`/api/v1/candidatos/list?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        const lista: Candidato[] = data.candidatos || [];
        setCandidatos(lista);

        // Populate party options
        const uniquePartidos = Array.from(new Set(lista.map(c => c.sigla).filter(Boolean))).sort();
        setPartidosDisponiveis(uniquePartidos);
      }
    } catch (err) {
      console.error('Erro ao buscar candidatos filtrados:', err);
    } finally {
      setLoading(false);
    }
  }, [cargoSelecionado, ufSelecionada, partidoSelecionado, busca]);

  useEffect(() => {
    carregarCandidatos();
  }, [carregarCandidatos]);

  // Reset filters to default (Presidentes)
  const handleResetFiltros = () => {
    setCargoSelecionado(1);
    setUfSelecionada('BR');
    setPartidoSelecionado('todos');
    setBusca('');
  };

  const getCargoNome = (cd: number) => {
    const found = CARGOS.find(c => c.cd === cd);
    return found ? found.label : 'Candidato Oficial';
  };

  return (
    <section id="secao-candidatos-2026" className="space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-black text-[#0B3D91] uppercase tracking-wider mb-2">
            <Award className="w-4 h-4 text-[#16A34A]" />
            <span>Banco de Dados Oficial TSE • Eleições Gerais 2026</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {cargoSelecionado === 1
              ? 'Candidatos a Presidente da República'
              : cargoSelecionado === 'todos'
              ? 'Todos os Candidatos Oficiais Registrados'
              : `Candidatos a ${getCargoNome(Number(cargoSelecionado))}`}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
            Catálogo dinâmico integrado via API cívica pública aos dados abertos do repositório DivulgaCandContas do Tribunal Superior Eleitoral. Selecione o cargo, estado, partido ou busque por nome e número.
          </p>
        </div>

        {/* Totalizer Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-200 text-[#0B3D91] text-xs font-black shadow-2xs">
            <Users className="w-4 h-4 text-[#0B3D91]" />
            <span>{candidatos.length} Candidatos Carregados</span>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
            <span>100% Deferidos TSE</span>
          </div>
        </div>
      </div>

      {/* Dynamic Filter and Search Control Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-xs font-black text-slate-800 uppercase tracking-wider">
            <Filter className="w-4 h-4 text-[#0B3D91]" />
            <span>Filtros Dinâmicos de Consulta</span>
          </div>

          {(cargoSelecionado !== 1 || ufSelecionada !== 'BR' || partidoSelecionado !== 'todos' || busca !== '') && (
            <button
              onClick={handleResetFiltros}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-slate-600 hover:text-[#0B3D91] hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpar Filtros (Padrão: Presidentes)</span>
            </button>
          )}
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Cargo */}
          <div>
            <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
              Cargo Eleitoral:
            </label>
            <select
              value={cargoSelecionado}
              onChange={e => {
                const val = e.target.value;
                setCargoSelecionado(val === 'todos' ? 'todos' : parseInt(val, 10));
                // If president selected, auto-switch UF to BR
                if (val === '1') {
                  setUfSelecionada('BR');
                }
              }}
              className="w-full px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D91] cursor-pointer"
            >
              <option value={1}>Presidente (Padrão Oficial)</option>
              <option value={3}>Governador</option>
              <option value={5}>Senador</option>
              <option value={6}>Deputado Federal</option>
              <option value={7}>Deputado Estadual</option>
              <option value="todos">Todos os Cargos</option>
            </select>
          </div>

          {/* Estado / UF */}
          <div>
            <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
              Estado / Região (UF):
            </label>
            <select
              value={ufSelecionada}
              onChange={e => setUfSelecionada(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D91] cursor-pointer"
            >
              <option value="BR">Brasil (Nacional / Federal)</option>
              <option value="todos">Todos os Estados</option>
              {UFS.filter(u => u !== 'BR').map(uf => (
                <option key={uf} value={uf}>{uf}</option>
              ))}
            </select>
          </div>

          {/* Partido */}
          <div>
            <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
              Partido Político:
            </label>
            <select
              value={partidoSelecionado}
              onChange={e => setPartidoSelecionado(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D91] cursor-pointer"
            >
              <option value="todos">Todos os Partidos</option>
              {partidosDisponiveis.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Busca por Nome ou Número */}
          <div>
            <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
              Nome ou Número da Urna:
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Ex: 22, 13, Bolsonaro, Lula..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
              />
            </div>
          </div>

        </div>

        {/* Counter strip */}
        <div className="text-xs font-bold text-slate-500 pt-1 flex items-center justify-between">
          <span>
            Mostrando <strong className="text-[#0B3D91] font-black">{candidatos.length}</strong> candidato(s) no banco oficial
          </span>
          {cargoSelecionado === 1 && (
            <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md font-semibold text-[11px]">
              Chapas Presidenciais com Titular e Vice
            </span>
          )}
        </div>
      </div>

      {/* Grid of Candidate Cards */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 text-xs font-semibold bg-white rounded-3xl border border-slate-200">
          <div className="w-8 h-8 border-3 border-[#0B3D91] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span>Filtrando candidatos oficiais no banco de dados TSE...</span>
        </div>
      ) : candidatos.length === 0 ? (
        <div className="py-16 text-center text-slate-500 text-xs font-medium bg-white rounded-3xl border border-dashed border-slate-200 p-8 space-y-3">
          <p className="text-sm font-bold text-slate-700">Nenhum candidato encontrado com os filtros selecionados.</p>
          <p className="text-slate-500">Tente alterar o estado, partido ou limpar o termo de busca.</p>
          <button
            onClick={handleResetFiltros}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0B3D91] text-white rounded-xl font-bold text-xs shadow-xs hover:bg-[#123F8F] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Voltar aos Presidentes da República</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidatos.map(cand => (
            <div
              key={`${cand.cargoCd}_${cand.numero}_${cand.sequencial}`}
              className="bg-white rounded-3xl border border-slate-200 hover:border-blue-300 shadow-xs hover:shadow-xl transition-all flex flex-col justify-between overflow-hidden group"
            >
              
              {/* Card Top: Photo & Number */}
              <div className="p-5 pb-4 bg-linear-to-b from-slate-50 to-white border-b border-slate-100">
                <div className="flex items-center justify-between gap-2 mb-4">
                  {/* Number Badge */}
                  <div className="flex items-center gap-2">
                    <span className="w-11 h-11 rounded-2xl bg-[#0B3D91] text-white flex items-center justify-center font-black text-lg shadow-md group-hover:bg-[#16A34A] transition-colors">
                      {cand.numero}
                    </span>
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">PARTIDO</span>
                      <span className="text-sm font-black text-slate-800">{cand.sigla}</span>
                    </div>
                  </div>

                  {/* Cargo & Deferido Pills */}
                  <div className="flex flex-col items-end gap-1">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      DEFERIDO
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                      {cand.cargo} • {cand.uf}
                    </span>
                  </div>
                </div>

                {/* Candidate Photo(s) */}
                <div className="flex items-end justify-center gap-3 py-2">
                  {/* Titular */}
                  <div className="flex flex-col items-center">
                    <div className="relative w-28 h-36 rounded-2xl overflow-hidden border-2 border-slate-300 shadow-md bg-slate-100">
                      <img
                        src={cand.fotoUrl}
                        alt={cand.nomeUrna}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                        onError={(e: any) => {
                          e.currentTarget.src = '/fotos/default-avatar.svg';
                        }}
                      />
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-black/75 text-white text-[9px] font-black uppercase tracking-wider backdrop-blur-xs">
                        {cand.cargoCd === 1 ? 'PRES.' : cand.cargoCd === 3 ? 'GOV.' : 'TITULAR'}
                      </span>
                    </div>
                    <span className="text-xs font-black text-slate-900 mt-2 text-center line-clamp-1">
                      {cand.nomeUrna}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-tight">
                      Candidato
                    </span>
                  </div>

                  {/* Vice Candidate if present (Presidents / Governors) */}
                  {cand.vice && (
                    <div className="flex flex-col items-center">
                      <div className="relative w-20 h-28 rounded-xl overflow-hidden border-2 border-slate-300 shadow-sm bg-slate-100">
                        <img
                          src={cand.vice.fotoUrl}
                          alt={cand.vice.nomeUrna}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                          onError={(e: any) => {
                            e.currentTarget.src = '/fotos/default-avatar.svg';
                          }}
                        />
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-black/75 text-white text-[8px] font-black uppercase tracking-wider backdrop-blur-xs">
                          VICE
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-slate-800 mt-2 text-center line-clamp-1">
                        {cand.vice.nomeUrna}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-tight">
                        Vice ({cand.vice.sigla})
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Body: Information */}
              <div className="p-5 pt-4 space-y-3">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Nome Completo Oficial:</span>
                  <div className="text-xs font-bold text-slate-800 line-clamp-1">
                    {cand.nome}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Registro TSE (SQ):</span>
                    <span className="font-mono font-bold text-blue-950">{cand.sequencial}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Coligação / Partido:</span>
                    <span className="font-semibold text-slate-700 line-clamp-1">{cand.coligacao || cand.partido}</span>
                  </div>
                </div>

                {/* Vote in Urna CTA button */}
                <div className="pt-2">
                  <button
                    onClick={() => {
                      if (onVotarCandidato) {
                        onVotarCandidato(cand.numero);
                      }
                    }}
                    className="w-full bg-slate-900 hover:bg-[#16A34A] text-white font-extrabold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-95 group/btn"
                  >
                    <Vote className="w-4 h-4 text-emerald-400 group-hover/btn:text-white transition-colors" />
                    <span>Digitar {cand.numero} na Urna</span>
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </section>
  );
};
