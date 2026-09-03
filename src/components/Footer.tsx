import React from 'react';
import {
  ShieldCheck,
  Scale,
  Phone,
  Mail,
  MapPin,
  Lock,
  ArrowUpRight
} from 'lucide-react';

interface FooterProps {
  onNavigate: (view: 'landing' | 'user' | 'urna' | 'admin' | 'resultados' | 'login' | 'termos' | 'privacidade') => void;
  onOpenAuth: () => void;
  onAcessarEleitorDemo?: () => void;
  onAcessarAdminDemo?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate
}) => {
  return (
    <footer className="hidden lg:block bg-slate-900 text-slate-300 border-t border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        
        {/* Top Grid: 3 Clean Columns (Brand, Navigation, Jurídico & Suporte) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 pb-12 border-b border-slate-800">
          
          {/* Col 1: Brand & About (6 cols on lg) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center">
              <img
                src="/logo-footer.svg"
                alt="Plataforma Eu Voto — Seu Voto, Sua Voz"
                className="h-10 sm:h-12 w-auto object-contain"
                onError={(e: any) => {
                  e.currentTarget.src = '/logo01.png';
                }}
              />
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              Plataforma cívica e estatística de alta precisão para as Eleições Gerais de 2026. Amostragem probabilística ampla, consulta ao banco de dados oficial do TSE, simulador de urna e sigilo inviolável garantido por criptografia.
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800/80 text-[11px] font-semibold text-emerald-400 border border-slate-700">
                <ShieldCheck className="w-3.5 h-3.5" /> LGPD Compliant
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800/80 text-[11px] font-semibold text-blue-400 border border-slate-700">
                <Lock className="w-3.5 h-3.5" /> Hash SHA-256
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800/80 text-[11px] font-semibold text-amber-300 border border-slate-700">
                <Scale className="w-3.5 h-3.5" /> Resoluções TSE
              </span>
            </div>
          </div>

          {/* Col 2: Navegação (3 cols on lg) */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-white mb-4">
              Navegação
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('landing')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Início / Pesquisas
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('urna')}
                  className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Simulador Urna 2026</span>
                  <span className="px-1.5 py-0.5 bg-emerald-950 text-emerald-400 text-[9px] rounded font-extrabold">TSE</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('resultados')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Resultados ao Vivo
                </button>
              </li>
              <li>
                <a
                  href="#faq-section"
                  onClick={() => onNavigate('landing')}
                  className="hover:text-white transition-colors cursor-pointer block"
                >
                  Perguntas Frequentes (FAQ)
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Contato e Suporte (4 cols on lg) */}
          <div className="lg:col-span-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-white mb-4">
              Contato e Suporte
            </h4>
            <ul className="space-y-3 text-xs">
              {/* Email */}
              <li className="pt-0.5">
                <a
                  href="mailto:contato@euvoto.com"
                  className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors group"
                >
                  <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Email: <strong className="text-white group-hover:text-blue-300">contato@euvoto.com</strong></span>
                </a>
              </li>

              {/* Fone / WhatsApp */}
              <li>
                <a
                  href="https://wa.me/5591996156672?text=Ol%C3%A1!%20Gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20a%20Plataforma%20Eu%20Voto."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#22C55E] hover:text-emerald-400 font-bold transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 shrink-0" />
                  <span>Fone/whatsapp (91)996156672</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </li>

              {/* Endereço */}
              <li className="pt-1">
                <div className="flex items-start gap-2 text-slate-300 text-[11px] leading-relaxed">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    Endereço: Parque Office - 5ºandar, sala 502 sul,<br />
                    Av. Augusto Montenegro, 4300 - Parque Verde, Belém - PA,
                  </span>
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Legal Disclaimer Box */}
        <div className="py-6 border-b border-slate-800 text-[11px] text-slate-400 leading-relaxed">
          <p>
            <strong>Aviso Legal TSE:</strong> As pesquisas de opinião pública realizadas pela Plataforma Eu Voto observam estritamente o disposto na Lei nº 9.504/1997 e nas resoluções vigentes do Tribunal Superior Eleitoral. As informações coletadas destinam-se a fins estatísticos e cívicos. Esta plataforma e seu simulador não possuem vínculo partidário e operam com independência metodológica.
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © 2026 Plataforma Eu Voto — Seu Voto, Sua Voz. Todos os direitos reservados.
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <button onClick={() => onNavigate('termos')} className="hover:text-slate-300">
              Termos de Uso
            </button>
            <span>•</span>
            <button onClick={() => onNavigate('privacidade')} className="hover:text-slate-300">
              Privacidade LGPD
            </button>
            <span>•</span>
            <span>Versão Oficial 2026</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
