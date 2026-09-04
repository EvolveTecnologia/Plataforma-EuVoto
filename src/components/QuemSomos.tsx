import React from 'react';
import {
  ShieldCheck,
  Scale,
  Cpu,
  Eye,
  Users,
  CheckCircle,
  Award,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';

export const QuemSomos: React.FC = () => {
  const pilares = [
    {
      icon: Scale,
      titulo: 'Independência e Neutralidade',
      desc: 'Sem viés político, financeiro ou partidário. Atuamos com imparcialidade científica absoluta para retratar a vontade soberana do eleitor brasileiro.'
    },
    {
      icon: Cpu,
      titulo: 'Tecnologia Cívica Aberta',
      desc: 'Algoritmos criptográficos auditáveis, validação contra registros oficiais do TSE e eliminação total de duplicidades com anonimato garantido.'
    },
    {
      icon: Users,
      titulo: 'Amostragem Ampla e Precisa',
      desc: 'Metodologia probabilística com cobertura demográfica real em todas as 27 Unidades da Federação e estratificação por sexo, faixa etária e município.'
    },
    {
      icon: Eye,
      titulo: 'Transparência em Tempo Real',
      desc: 'Dados consolidados com metodologia aberta e rastreabilidade cívica, combatendo distorções e permitindo verificação pública.'
    }
  ];

  return (
    <section id="quem-somos" className="w-full">
      <div className="bg-linear-to-br from-slate-900 via-[#0B2553] to-[#081735] text-white rounded-3xl p-6 sm:p-10 lg:p-12 shadow-2xl border border-white/10 relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* =======================================================
              COLUNA ESQUERDA: IMAGEM DA POPULAÇÃO CAMINHANDO COM BADGES
              ======================================================= */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5 flex flex-col items-center"
          >
            <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl border-2 border-white/15 group">
              {/* Population Walking Image */}
              <img
                src="/assets/populacao_caminhando.jpg"
                alt="População brasileira caminhando unida no processo democrático"
                className="w-full h-80 sm:h-96 lg:h-[480px] object-cover object-center group-hover:scale-105 transition-transform duration-700"
                onError={(e: any) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?auto=format&fit=crop&w=1200&q=80';
                }}
              />

              {/* Gradient Overlay for Text Legibility */}
              <div className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-950/25 to-transparent pointer-events-none" />

              {/* Top Pill: Democracia Participativa */}
              <div className="absolute top-4 left-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/20 text-white text-xs font-black shadow-lg">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>Voz do Povo Brasileiro</span>
              </div>

              {/* Bottom Card Inside Image */}
              <div className="absolute bottom-4 inset-x-4 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-left">
                <div className="flex items-center gap-2 text-emerald-300 text-[11px] font-black uppercase tracking-wider mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Metodologia Científica & Inclusiva</span>
                </div>
                <p className="text-xs text-white/90 font-medium leading-snug">
                  Ouvindo cidadãos de todas as faixas etárias, gêneros e regiões do Brasil com rigor estatístico e anonimato garantido.
                </p>
              </div>
            </div>
          </motion.div>

          {/* =======================================================
              COLUNA DIREITA: ORGANIZAÇÃO DOS CARDS E TEXTOS
              ======================================================= */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-7 space-y-6"
          >
            {/* Header Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-emerald-300 text-xs font-extrabold uppercase tracking-wider backdrop-blur-md">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Quem Somos • Manifesto Institucional</span>
            </div>

            {/* Title */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-snug">
              A Voz do Eleitor com Precisão Tecnológica, Isenção e Transparência
            </h2>

            {/* User's Exact Institutional Statement Quote */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-white/20 text-left shadow-lg">
              <p className="text-sm sm:text-base text-blue-50 font-medium leading-relaxed">
                &ldquo;<strong className="text-white font-extrabold">Somos uma empresa de tecnologia que buscamos realizar uma pesquisa sem viés ou interesse financeiro ou partidário</strong>, que através da tecnologia buscamos de forma democrática ouvir a voz do eleitor através de uma <strong className="text-emerald-300 font-bold">metodologia de amostragem muito maior, precisa e transparente</strong>.&rdquo;
              </p>
            </div>

            {/* 4 Pillars in a 2x2 Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left pt-2">
              {pilares.map((pilar, idx) => {
                const Icon = pilar.icon;
                return (
                  <motion.div
                    key={pilar.titulo}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: 0.08 * idx }}
                    className="bg-white/5 hover:bg-white/10 transition-all rounded-2xl p-4 border border-white/10 backdrop-blur-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-300 flex items-center justify-center mb-2.5">
                        <Icon className="w-4.5 h-4.5 text-blue-300" />
                      </div>
                      <h3 className="text-xs sm:text-sm font-extrabold text-white mb-1.5">{pilar.titulo}</h3>
                      <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed">{pilar.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Certifications strip */}
            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Resolução TSE nº 23.600</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Anonimização Total LGPD</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Código Aberto & Auditável</span>
              </div>
            </div>

          </motion.div>

        </div>
      </div>
    </section>
  );
};
