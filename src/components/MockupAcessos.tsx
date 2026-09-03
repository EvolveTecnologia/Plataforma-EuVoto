import React from 'react';
import {
  User,
  Shield,
  CheckCircle2,
  Lock,
  BarChart3,
  Vote,
  Database,
  ArrowRight,
  Sparkles,
  Fingerprint,
  Send,
  Eye,
  KeyRound
} from 'lucide-react';
import { UsuarioPerfil } from '../types';

interface MockupAcessosProps {
  onAcessarEleitorDemo: () => void;
  onAcessarAdminDemo: () => void;
  onIrParaLogin: () => void;
}

export const MockupAcessos: React.FC<MockupAcessosProps> = ({
  onAcessarEleitorDemo,
  onAcessarAdminDemo,
  onIrParaLogin
}) => {
  return (
    <section id="mockup-acessos" className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-100/70 text-[#0B3D91] text-xs font-bold mb-3 border border-blue-200">
            <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
            <span>Navegação & Ambientes da Plataforma</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            Ambientes de Acesso: Eleitor & Administração
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600">
            Conheça as duas interfaces especializadas desenvolvidas para a democracia digital nas Eleições 2026. Experimente os acessos em modo demonstração com um único clique.
          </p>
        </div>

        {/* Side-by-Side Responsive Mockup Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* MOCKUP 1: ÁREA DO USUÁRIO (ELEITOR CIDADÃO) */}
          <div className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden shadow-lg hover:shadow-xl transition-all flex flex-col justify-between">
            <div>
              {/* Card Header */}
              <div className="p-6 bg-linear-to-r from-blue-900 to-[#0B3D91] text-white">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-3 py-1 rounded-full bg-white/20 text-white font-black text-[11px] uppercase tracking-wider backdrop-blur-xs border border-white/20">
                    Área do Usuário
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-blue-100 font-medium">
                    <Fingerprint className="w-4 h-4 text-emerald-300" />
                    <span>Perfil Cidadão</span>
                  </div>
                </div>

                <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                  Espaço Cívico do Eleitor
                </h3>
                <p className="text-xs sm:text-sm text-blue-100/90 mt-1">
                  Interface amigável para participação em pesquisas, acompanhamento de cédulas e histórico de votos protegidos.
                </p>
              </div>

              {/* Visual Mockup Interface Preview */}
              <div className="p-6 bg-[#F8FAFC] border-b border-slate-200 space-y-4">
                
                {/* Mockup User Profile Card */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0B3D91] flex items-center justify-center font-black text-lg border border-blue-200">
                      EC
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-slate-900">Eleitor Cidadão</h4>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                          Auditado
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">PA • Eleitorado Oficial 2026</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">CPF Seguro</span>
                    <span className="text-xs font-mono font-bold text-slate-700">***.456.789-**</span>
                  </div>
                </div>

                {/* Mockup Features Highlight Box */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Status do Título</span>
                    <span className="text-emerald-700 font-extrabold flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Apto a Votar
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Pesquisas Disponíveis</span>
                    <span className="text-[#0B3D91] font-extrabold flex items-center gap-1 mt-0.5">
                      <Vote className="w-3.5 h-3.5" /> 2 Ativas no Pará
                    </span>
                  </div>
                </div>

                {/* Mockup Participation Item */}
                <div className="bg-white p-3.5 rounded-xl border border-dashed border-slate-300 text-xs text-slate-600 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Vote className="w-4 h-4 text-[#16A34A]" />
                    <span className="font-semibold text-slate-800">Simulação Urna Eletrônica 2026</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                    Concluído (FIM)
                  </span>
                </div>

              </div>

              {/* Functional Highlights */}
              <div className="p-6 space-y-2.5 text-xs text-slate-600">
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Voto protegido e desassociado de dados pessoais (LGPD).</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Comprovante de participação digital com autenticação.</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Acesso direto ao simulador oficial da urna com sons do TSE.</span>
                </div>
              </div>
            </div>

            {/* Card Action CTAs */}
            <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row gap-3">
              <button
                id="btn-mockup-eleitor-demo"
                onClick={onAcessarEleitorDemo}
                className="flex-1 bg-[#0B3D91] hover:bg-[#123F8F] text-white font-extrabold py-3 px-4 rounded-xl text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4" />
                <span>Testar Área do Eleitor (Demo)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onIrParaLogin}
                className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold py-3 px-4 rounded-xl text-xs transition-colors"
              >
                Login Normal
              </button>
            </div>
          </div>

          {/* MOCKUP 2: ÁREA ADMINISTRATIVA (GESTÃO & AUDITORIA) */}
          <div className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden shadow-lg hover:shadow-xl transition-all flex flex-col justify-between">
            <div>
              {/* Card Header */}
              <div className="p-6 bg-linear-to-r from-slate-900 via-amber-950 to-amber-900 text-white">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-[11px] uppercase tracking-wider">
                    Área Administrativa
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-amber-200 font-medium">
                    <Shield className="w-4 h-4 text-amber-400" />
                    <span>admin: true</span>
                  </div>
                </div>

                <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                  Painel de Governança e Auditoria
                </h3>
                <p className="text-xs sm:text-sm text-amber-100/90 mt-1">
                  Ambiente restrito a gestores e estatísticos para controle de ETL, amostragem protegida, IA e auditoria.
                </p>
              </div>

              {/* Visual Mockup Interface Preview */}
              <div className="p-6 bg-[#F8FAFC] border-b border-slate-200 space-y-4">
                
                {/* Mockup Admin Stat Grid */}
                <div className="grid grid-cols-3 gap-2.5 text-center">
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Eleitores</span>
                    <span className="text-base font-black text-slate-900 block mt-0.5">14.820</span>
                    <span className="text-[9px] text-emerald-600 font-bold">100% Hash SHA</span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Cédulas Voto</span>
                    <span className="text-base font-black text-[#0B3D91] block mt-0.5">8.942</span>
                    <span className="text-[9px] text-slate-500 font-bold">Sem duplicidade</span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Candidatos TSE</span>
                    <span className="text-base font-black text-[#16A34A] block mt-0.5">1.240</span>
                    <span className="text-[9px] text-slate-500 font-bold">ETL Ativo</span>
                  </div>
                </div>

                {/* Mockup Admin Tools Row */}
                <div className="space-y-2">
                  <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-bold text-slate-800">
                      <Database className="w-4 h-4 text-blue-600" />
                      <span>Esteira ETL TSE (consulta_cand_2026_PA.csv)</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-extrabold text-[10px]">
                      Sincronizado
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-bold text-slate-800">
                      <BarChart3 className="w-4 h-4 text-amber-600" />
                      <span>Amostragem Demográfica (Sexo & Faixa Etária)</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-extrabold text-[10px]">
                      Protegido (§5.5)
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-bold text-slate-800">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      <span>Relatório Executivo Gemini AI & Testes T1-T7</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 font-extrabold text-[10px]">
                      Pronto
                    </span>
                  </div>
                </div>

              </div>

              {/* Functional Highlights */}
              <div className="p-6 space-y-2.5 text-xs text-slate-600">
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Upload e parser de CSVs oficiais do TSE com resolução de chapas.</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Transmissão de notificações Push FCM segmentadas por estado (UF).</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Suíte automatizada de integridade e auditoria (Testes T1 a T7).</span>
                </div>
              </div>
            </div>

            {/* Card Action CTAs */}
            <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row gap-3">
              <button
                id="btn-mockup-admin-demo"
                onClick={onAcessarAdminDemo}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-amber-400 font-extrabold py-3 px-4 rounded-xl text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 border border-amber-500/30"
              >
                <Shield className="w-4 h-4 text-amber-400" />
                <span>Testar Área do Administrador (Demo)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onIrParaLogin}
                className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold py-3 px-4 rounded-xl text-xs transition-colors"
              >
                Login Credenciais
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
