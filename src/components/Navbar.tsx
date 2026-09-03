import React, { useState } from 'react';
import { UsuarioPerfil, NotificacaoPush } from '../types';
import {
  User,
  Shield,
  Bell,
  BarChart3,
  LogOut,
  Menu,
  X,
  Lock,
  MapPin,
  Vote,
  LogIn
} from 'lucide-react';

interface NavbarProps {
  user: UsuarioPerfil | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onNavigate: (view: 'landing' | 'user' | 'urna' | 'admin' | 'resultados' | 'login' | 'termos' | 'privacidade') => void;
  currentView: string;
  selectedUf: string;
  onSelectUf: (uf: string) => void;
  notificacoes: NotificacaoPush[];
}

const UFS = [
  'BR', 'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR', 'RJ',
  'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO'
];

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onOpenAuth,
  onLogout,
  onNavigate,
  currentView,
  selectedUf,
  onSelectUf,
  notificacoes
}) => {
  const [showNotifs, setShowNotifs] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (view: any) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <button
          id="btn-brand-home"
          onClick={() => handleNavClick('landing')}
          className="flex items-center gap-3 text-left group focus:outline-none cursor-pointer"
        >
          <img
            src="/logo01.png"
            alt="Plataforma Eu Voto — Seu Voto, Sua Voz"
            className="h-9 sm:h-11 w-auto object-contain transition-transform group-hover:scale-102"
            onError={(e: any) => {
              e.currentTarget.src = '/logo-icon.svg';
            }}
          />
        </button>

        {/* Center / Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2">
          {/* UF Filter Pill */}
          <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700">
            <MapPin className="w-3.5 h-3.5 text-[#0B3D91]" />
            <span className="text-slate-500 font-bold">UF:</span>
            <select
              id="select-uf-navbar"
              value={selectedUf}
              onChange={(e) => onSelectUf(e.target.value)}
              aria-label="Selecionar Estado"
              className="bg-transparent font-black text-[#0B3D91] focus:outline-none cursor-pointer"
            >
              {UFS.map(uf => (
                <option key={uf} value={uf}>{uf === 'BR' ? 'BR — Nacional' : uf}</option>
              ))}
            </select>
          </div>

          <button
            id="nav-btn-pesquisas"
            onClick={() => handleNavClick('landing')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
              currentView === 'landing'
                ? 'text-[#0B3D91] bg-blue-50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Pesquisas
          </button>

          <button
            id="nav-btn-resultados"
            onClick={() => handleNavClick('resultados')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
              currentView === 'resultados'
                ? 'text-[#0B3D91] bg-blue-50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            <span>Resultados</span>
          </button>
        </div>

        {/* Right: Actions based on session status */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* SE USUÁRIO LOGADO: Exibir Notificações Push, Botão Eleitor e Logout */}
          {user ? (
            <>
              {/* Push Notification bell */}
              <div className="relative">
                <button
                  id="btn-notificacoes-bell"
                  onClick={() => setShowNotifs(!showNotifs)}
                  aria-label="Notificações"
                  className="relative p-2 rounded-xl text-slate-600 hover:text-[#0B3D91] hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <Bell className="w-5 h-5" />
                  {notificacoes.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-600 rounded-full ring-2 ring-white"></span>
                  )}
                </button>

                {showNotifs && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Notificações Push</span>
                      <span className="text-xs text-[#16A34A] font-semibold">{notificacoes.length} ativas</span>
                    </div>
                    {notificacoes.length === 0 ? (
                      <p className="text-xs text-slate-500 py-3 text-center">Nenhuma notificação recente.</p>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {notificacoes.slice(0, 5).map((n) => (
                          <div key={n.id} className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50/50 transition-colors text-xs">
                            <div className="font-semibold text-slate-800">{n.titulo}</div>
                            <div className="text-slate-600 mt-0.5">{n.mensagem}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Botão Eleitor (Navegação para Área do Usuário) */}
              <button
                id="btn-nav-eleitor"
                onClick={() => handleNavClick('user')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer shadow-xs ${
                  currentView === 'user'
                    ? 'bg-[#0B3D91] text-white shadow-md'
                    : 'bg-blue-50 hover:bg-blue-100 text-[#0B3D91] border border-blue-200'
                }`}
                title="Acessar Área do Eleitor"
              >
                <User className="w-4 h-4" />
                <span>Eleitor</span>
              </button>

              {/* Admin link se for admin */}
              {user.isAdmin && (
                <button
                  id="btn-nav-admin"
                  onClick={() => handleNavClick('admin')}
                  className={`hidden sm:flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    currentView === 'admin'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </button>
              )}

              {/* Botão Sair da conta */}
              <button
                id="btn-logout-header"
                onClick={onLogout}
                title="Sair da conta"
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            /* SE NÃO LOGADO: APENAS O BOTÃO ENTRAR */
            <button
              id="btn-nav-entrar-header"
              onClick={onOpenAuth}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#0B3D91] hover:bg-[#082d6c] text-white shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Entrar</span>
            </button>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            id="btn-mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu de Navegação"
            className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-3 duration-200 shadow-xl">
          
          {/* UF Filter Mobile */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-xs font-bold text-slate-700">Filtrar por Estado (UF):</span>
            <select
              value={selectedUf}
              onChange={(e) => onSelectUf(e.target.value)}
              className="bg-white border border-slate-300 font-bold text-[#0B3D91] rounded-lg px-2 py-1 text-xs focus:outline-none"
            >
              {UFS.map(uf => (
                <option key={uf} value={uf}>{uf === 'BR' ? 'BR — Nacional' : uf}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleNavClick('landing')}
              className={`p-3 rounded-xl text-xs font-bold text-left flex items-center gap-2 ${
                currentView === 'landing' ? 'bg-blue-50 text-[#0B3D91]' : 'bg-slate-50 text-slate-700'
              }`}
            >
              <span>🗳️ Pesquisas</span>
            </button>

            <button
              onClick={() => handleNavClick('resultados')}
              className={`p-3 rounded-xl text-xs font-bold text-left flex items-center gap-2 ${
                currentView === 'resultados' ? 'bg-blue-50 text-[#0B3D91]' : 'bg-slate-50 text-slate-700'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <span>Resultados</span>
            </button>

            {user ? (
              <>
                <button
                  onClick={() => handleNavClick('user')}
                  className="p-3 rounded-xl text-xs font-bold text-left flex items-center gap-2 bg-blue-50 text-[#0B3D91] col-span-2"
                >
                  <User className="w-4 h-4" />
                  <span>Área do Eleitor ({user.nome.split(' ')[0]})</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="p-2.5 rounded-xl text-xs font-bold text-center text-rose-600 bg-rose-50 col-span-2"
                >
                  Sair da Conta
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth();
                }}
                className="p-3 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2 bg-[#0B3D91] text-white col-span-2 shadow-sm"
              >
                <LogIn className="w-4 h-4" />
                <span>Entrar na Plataforma</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
