import React from 'react';
import { Pesquisa, ConfigLanding } from '../types';
import {
  Vote,
  BarChart3,
  CheckSquare,
  Shield,
  Users,
  ArrowRight,
  BookOpen,
  AlertOctagon,
  Check,
  Sparkles,
  ShieldCheck,
  Volume2,
  Lock,
  Layers
} from 'lucide-react';
import { QuemSomos } from './QuemSomos';
import { FaqSection } from './FaqSection';
import { CandidatosShowcase } from './CandidatosShowcase';

interface LandingViewProps {
  pesquisas: Pesquisa[];
  configLanding: ConfigLanding;
  selectedUf: string;
  onSelectUf: (uf: string) => void;
  onVotar: (pesquisa: Pesquisa) => void;
  onVerResultados: () => void;
  onOpenAuth: () => void;
  onIrParaLogin: () => void;
  onAcessarEleitorDemo: () => void;
  onAcessarAdminDemo: () => void;
  isLoggedIn: boolean;
}

export const LandingView: React.FC<LandingViewProps> = ({
  pesquisas,
  configLanding,
  selectedUf,
  onSelectUf,
  onVotar,
  onVerResultados,
  onOpenAuth,
  onIrParaLogin,
  onAcessarEleitorDemo,
  onAcessarAdminDemo,
  isLoggedIn
}) => {
  // Filter surveys by selected UF or national
  const pesquisasFiltradas = pesquisas.filter(
    p => selectedUf === 'BR' || p.ufs.includes('BR') || p.ufs.includes(selectedUf)
  );

  return (
    <div className="w-full pb-16">
      
      {/* =======================================================
          BANNER HERO DE LARGURA E ALTURA TOTAL — ELEIÇÕES 2026
          ======================================================= */}
      <section className="relative w-full min-h-[calc(100vh-4.25rem)] lg:min-h-screen flex flex-col justify-between overflow-hidden bg-[#07152B]">
        
        {/* Background Official Image from Jornal União with Fallback & ReferrerPolicy */}
        <img
          src="https://jornaluniao.com.br/media/uploads/2026/08/pauta_26833.webp"
          alt="Eleições Gerais 2026 no Brasil • Plataforma Eu Voto"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover object-center scale-105 transform hover:scale-100 transition-transform duration-1000 opacity-55 mix-blend-luminosity"
          onError={(e: any) => {
            // Defensive graceful fallback to generated high-res Brazil 2026 election asset
            e.currentTarget.src = '/src/assets/images/eleicoes_2026_banner_1788411115538.jpg';
          }}
        />

        {/* Cinematic Multi-Layer Gradient Overlays for Supreme Readability */}
        <div className="absolute inset-0 bg-linear-to-r from-[#07152B] via-[#07152B]/85 to-[#07152B]/40 z-10" />
        <div className="absolute inset-0 bg-linear-to-t from-[#07152B] via-transparent to-[#07152B]/75 z-10" />
        
        {/* Brazilian Democratic Glows */}
        <div className="absolute -top-32 -left-32 w-[34rem] h-[34rem] bg-[#0B3D91]/40 rounded-full blur-3xl z-10" />
        <div className="absolute -bottom-32 right-10 w-[34rem] h-[34rem] bg-[#16A34A]/25 rounded-full blur-3xl z-10" />

        {/* Foreground Hero Content Centered in High-Contrast Grid */}
        <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 my-auto space-y-7 text-white">
          
          {/* Civic Badge Pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-white text-xs font-black shadow-md">
            <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] ring-2 ring-white/50 animate-pulse"></span>
            <span className="tracking-wide uppercase">Eleições Gerais 2026 • Brasil</span>
          </div>

          {/* Main Headline */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black tracking-tight text-white leading-tight">
              Plataforma <span className="text-white">Eu</span> <span className="text-[#16A34A]">Voto</span>
            </h1>
            <p className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-blue-200 tracking-tight">
              “Seu Voto, Sua Voz”
            </p>
          </div>

          <p className="text-sm sm:text-base lg:text-lg text-slate-200 font-normal leading-relaxed max-w-2xl">
            Participe de pesquisas estatísticas auditadas, experimente a simulação oficial da urna eletrônica brasileira e acompanhe tendências eleitorais com total sigilo garantido por criptografia e conformidade legal.
          </p>

          {/* CTAs Responsivos */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <button
              id="btn-hero-votar-urna"
              onClick={() => {
                if (pesquisas[0]) onVotar(pesquisas[0]);
              }}
              className="flex items-center justify-center gap-2 bg-[#16A34A] hover:bg-[#15803d] text-white font-black px-7 py-3.5 rounded-xl shadow-lg transition-all active:scale-95 text-xs sm:text-sm cursor-pointer"
            >
              <Vote className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Votar na Urna 2026</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="btn-hero-ver-apuracao"
              onClick={onVerResultados}
              className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3.5 rounded-xl border border-white/30 backdrop-blur-md transition-all active:scale-95 text-xs sm:text-sm cursor-pointer"
            >
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
              <span>Ver Resultados ao Vivo</span>
            </button>

            <button
              id="btn-hero-login-oficial"
              onClick={onIrParaLogin}
              className="flex items-center justify-center gap-2 bg-[#0B3D91] hover:bg-[#123F8F] text-white font-bold px-6 py-3.5 rounded-xl border border-blue-400/30 transition-all active:scale-95 text-xs sm:text-sm cursor-pointer"
            >
              <span>Acessar Plataforma</span>
            </button>
          </div>

          {/* Trust highlights inline */}
          <div className="pt-4 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
              <span>Sigilo Criptográfico SHA-256</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-amber-400" />
              <span>Áudio Oficial da Urna</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Base TSE 2026 Integrada (26 Imagens)</span>
            </div>
          </div>

        </div>

        {/* Bottom Feature Strip pinned to hero base */}
        <div className="relative z-20 w-full bg-[#0B3D91]/95 backdrop-blur-md border-t border-blue-800/60 text-white px-4 sm:px-6 lg:px-8 py-4">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-center sm:text-left">
            <div className="border-r border-blue-800/60 last:border-0 pr-2">
              <span className="text-[10px] uppercase font-bold text-blue-300 block">Ordem Oficial</span>
              <span className="text-xs sm:text-sm font-extrabold text-white">6 Cargos Eletivos</span>
            </div>
            <div className="border-r border-blue-800/60 last:border-0 pr-2">
              <span className="text-[10px] uppercase font-bold text-blue-300 block">Privacidade</span>
              <span className="text-xs sm:text-sm font-extrabold text-white">Voto 100% Anônimo</span>
            </div>
            <div className="border-r border-blue-800/60 last:border-0 pr-2">
              <span className="text-[10px] uppercase font-bold text-blue-300 block">Amostragem</span>
              <span className="text-xs sm:text-sm font-extrabold text-white">Estratificação IBGE</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-blue-300 block">Conformidade</span>
              <span className="text-xs sm:text-sm font-extrabold text-white">Lei nº 9.504/1997</span>
            </div>
          </div>
        </div>

      </section>

      {/* =======================================================
          MAIN PAGE CONTENT (CONTAINED & CENTERED)
          ======================================================= */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 py-12">

        {/* =======================================================
            QUEM SOMOS: MANIFESTO, METODOLOGIA E ISENÇÃO POLÍTICA
            ======================================================= */}
        <QuemSomos />

        {/* =======================================================
            CATÁLOGO OFICIAL TSE: CANDIDATOS À PRESIDÊNCIA 2026
            ======================================================= */}
        <CandidatosShowcase
          pesquisas={pesquisas}
          onVotarCandidato={(numero) => {
            if (pesquisas[0]) onVotar(pesquisas[0]);
          }}
        />

      {/* =======================================================
          PESQUISAS LIBERADAS POR ESTADO (§5.1)
          ======================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#0B3D91] uppercase tracking-wider mb-1">
              <Vote className="w-4 h-4" />
              <span>Sondagens Eleitorais em Andamento</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Pesquisas Liberadas para Votação
            </h2>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
            <span>Filtrando por:</span>
            <span className="px-3 py-1 bg-[#0B3D91] text-white font-extrabold rounded-lg">
              {selectedUf === 'BR' ? 'Todas as UFs (Nacional)' : `Estado: ${selectedUf}`}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pesquisasFiltradas.map(pesquisa => (
            <div
              key={pesquisa.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-extrabold text-xs rounded-lg border border-emerald-200 uppercase tracking-wide">
                    {pesquisa.status === 'publicada' ? 'Em Andamento' : 'Ativa'}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    {pesquisa.ufs.includes('BR') ? 'Nacional' : `UFs: ${pesquisa.ufs.join(', ')}`}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                  {pesquisa.titulo}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                  {pesquisa.descricao}
                </p>

                <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-500">
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Período de Coleta:</span>
                    <span className="font-semibold text-slate-700">
                      {new Date(pesquisa.inicio).toLocaleDateString('pt-BR')} até {new Date(pesquisa.fim).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Total Computado:</span>
                    <span className="font-semibold text-slate-700">
                      {pesquisa.totalVotos.toLocaleString('pt-BR')} votos
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 border-t border-slate-100">
                <button
                  id={`btn-card-votar-${pesquisa.id}`}
                  onClick={() => onVotar(pesquisa)}
                  className="flex-1 bg-[#16A34A] hover:bg-[#15803d] text-white font-extrabold py-3 px-4 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Vote className="w-4 h-4" />
                  <span>Votar</span>
                </button>

                <button
                  onClick={onVerResultados}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Ver Resultados
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =======================================================
          PERGUNTAS FREQUENTES (FAQ)
          ======================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FaqSection />
      </div>

      {/* =======================================================
          SEÇÕES INFORMATIVAS EDITÁVEIS PELO CMS (§5.1 e §5.5)
          ======================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Sobre a Plataforma */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#0B3D91] flex items-center justify-center mb-4 border border-blue-100">
              <CheckSquare className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-3">
              {configLanding.sobreTitulo}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {configLanding.sobreTexto}
            </p>
          </div>

          {/* Metodologia e Rigor Científico */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-[#16A34A] flex items-center justify-center mb-4 border border-emerald-100">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-3">
              {configLanding.metodologiaTitulo}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {configLanding.metodologiaTexto}
            </p>
          </div>

        </div>
      </section>

      {/* =======================================================
          AVISO LEGAL TSE / PESQELE OBRIGATÓRIO (§5.1)
          ======================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-7 rounded-3xl bg-amber-50/90 border-2 border-amber-300 text-amber-950 flex flex-col sm:flex-row items-start gap-4 shadow-xs">
          <div className="w-11 h-11 rounded-2xl bg-amber-200 flex items-center justify-center shrink-0 text-amber-900">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h4 className="text-sm sm:text-base font-black uppercase tracking-wider text-amber-900">
              Aviso Legal Conforme Legislação Eleitoral (TSE)
            </h4>
            <p className="text-xs leading-relaxed text-amber-900">
              {configLanding.avisoLegalTSE}
            </p>
            <div className="text-[11px] font-semibold text-amber-800 pt-1">
              Contato com a Coordenação Científica: {configLanding.contatoEmail} • {configLanding.contatoTelefone}
            </div>
          </div>
        </div>
      </section>

      </div>
    </div>
  );
};
