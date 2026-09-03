import React, { useState, useEffect } from 'react';
import { UsuarioPerfil, Pesquisa, NotificacaoPush } from '../types';
import {
  Vote,
  CheckCircle2,
  Bell,
  Shield,
  Award,
  User,
  MapPin,
  Calendar,
  Smartphone,
  Home,
  BarChart3,
  Settings,
  Edit3,
  Trash2,
  Send,
  Check,
  AlertCircle,
  ExternalLink,
  Lock,
  FileText,
  Mail,
  RefreshCw,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ResultadosView } from './ResultadosView';
import { mascararCelular } from '../utils/cpf';

interface MensagemItem {
  id: string;
  uid: string;
  nome: string;
  email: string;
  assunto: string;
  mensagem: string;
  status: 'enviada' | 'respondida';
  resposta?: string;
  enviadoEm: string;
}

interface UserAreaViewProps {
  user: UsuarioPerfil;
  pesquisas: Pesquisa[];
  onIniciarVotacao: (pesquisa: Pesquisa) => void;
  notificacoes: NotificacaoPush[];
  initialTab?: UserTab;
  onUpdateUser?: (updated: UsuarioPerfil) => void;
  onLogout?: () => void;
  onVerResultados?: () => void;
  selectedUf?: string;
  onSelectUf?: (uf: string) => void;
  onNavigateSite?: (view: 'landing' | 'resultados' | 'urna' | 'admin' | 'termos' | 'privacidade') => void;
}

export type UserTab = 'home' | 'pesquisas' | 'resultados' | 'notificacoes' | 'configuracoes';

const UFS = [
  'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN',
  'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO'
];

export const UserAreaView: React.FC<UserAreaViewProps> = ({
  user,
  pesquisas,
  onIniciarVotacao,
  notificacoes,
  initialTab = 'home',
  onUpdateUser,
  onLogout,
  onVerResultados,
  selectedUf = 'PA',
  onSelectUf,
  onNavigateSite
}) => {
  const [currentTab, setCurrentTab] = useState<UserTab>(initialTab);
  const [statusVotos, setStatusVotos] = useState<Record<string, boolean>>({});
  const [loadingVotos, setLoadingVotos] = useState(true);

  // Sync initialTab when changed from parent (e.g. returning from Urna)
  useEffect(() => {
    if (initialTab) {
      setCurrentTab(initialTab);
    }
  }, [initialTab]);

  // Scroll to top on every tab switch
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [currentTab]);

  // Sidebar expand / collapse states
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Sub-aba em Configurações
  const [configSubTab, setConfigSubTab] = useState<'perfil' | 'seguranca' | 'ouvidoria' | 'lgpd'>('perfil');

  // Filtro de status em Notificações
  const [filtroStatusNotif, setFiltroStatusNotif] = useState<'todas' | 'nao_lidas' | 'lidas'>('todas');

  // Mensagens / Ouvidoria (CRUD)
  const [mensagens, setMensagens] = useState<MensagemItem[]>([]);
  const [novoAssunto, setNovoAssunto] = useState('');
  const [novoTextoMsg, setNovoTextoMsg] = useState('');
  const [isSendingMsg, setIsSendingMsg] = useState(false);
  const [msgSucessoEnvio, setMsgSucessoEnvio] = useState('');

  // Notificações locais com suporte a exclusão (CRUD)
  const [notifs, setNotifs] = useState<NotificacaoPush[]>(notificacoes);

  // Profile Edit State (CRUD)
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editNome, setEditNome] = useState(user.nome);
  const [editCelular, setEditCelular] = useState(user.celular || '');
  const [editMunicipio, setEditMunicipio] = useState(user.municipio || '');
  const [editUf, setEditUf] = useState(user.uf || 'PA');
  const [editSexo, setEditSexo] = useState(user.sexo || 'OUTRO');
  const [editDtNascimento, setEditDtNascimento] = useState(user.dtNascimento || '');
  const [pushAtivo, setPushAtivo] = useState(user.optInPush ?? true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileErrorMsg, setProfileErrorMsg] = useState('');

  // Modal de Exclusão de Conta (LGPD)
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Modal de Confirmação de Logout
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Sincroniza notificações recebidas
  useEffect(() => {
    setNotifs(notificacoes);
  }, [notificacoes]);

  // Consulta status de votos do usuário para cada pesquisa (Regra 1 voto por CPF)
  useEffect(() => {
    const checarVotos = async () => {
      setLoadingVotos(true);
      const statuses: Record<string, boolean> = {};

      for (const p of pesquisas) {
        try {
          const res = await fetch(`/api/v1/pesquisas/${p.id}/status-voto/${user.uid}`);
          if (res.ok) {
            const data = await res.json();
            statuses[p.id] = data.jaVotou;
          }
        } catch {
          statuses[p.id] = false;
        }
      }

      setStatusVotos(statuses);
      setLoadingVotos(false);
    };

    checarVotos();
  }, [pesquisas, user.uid]);

  // Carrega histórico de mensagens da ouvidoria
  useEffect(() => {
    const carregarMensagens = async () => {
      try {
        const res = await fetch(`/api/v1/ouvidoria/mensagens/${user.uid}`);
        if (res.ok) {
          const data = await res.json();
          setMensagens(data);
        } else {
          setMensagens([
            {
              id: 'msg_bemvindo_1',
              uid: user.uid,
              nome: user.nome,
              email: user.email,
              assunto: 'Boas-vindas ao Eu Voto 2026',
              mensagem: 'Olá! Seu cadastro cívico foi ativado com sucesso. Você já pode participar das pesquisas oficiais e auditar os resultados em tempo real.',
              status: 'respondida',
              resposta: 'Agradecemos sua participação ativa pela integridade do processo democrático.',
              enviadoEm: new Date(Date.now() - 3600000).toISOString()
            }
          ]);
        }
      } catch {
        setMensagens([]);
      }
    };

    carregarMensagens();
  }, [user.uid, user.nome, user.email]);

  // Marcar notificação como lida (CRUD)
  const handleMarcarComoLida = async (notifId: string) => {
    try {
      await fetch(`/api/v1/notificacoes/${notifId}/ler`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.uid })
      });
      setNotifs(prev =>
        prev.map(n => (n.id === notifId ? { ...n, lidoPor: Array.from(new Set([...(n.lidoPor || []), user.uid])) } : n))
      );
    } catch {
      setNotifs(prev =>
        prev.map(n => (n.id === notifId ? { ...n, lidoPor: Array.from(new Set([...(n.lidoPor || []), user.uid])) } : n))
      );
    }
  };

  const handleAlternarLida = async (notifId: string, jaLida: boolean) => {
    if (!jaLida) {
      handleMarcarComoLida(notifId);
    } else {
      setNotifs(prev =>
        prev.map(n =>
          n.id === notifId ? { ...n, lidoPor: (n.lidoPor || []).filter(u => u !== user.uid) } : n
        )
      );
    }
  };

  const handleMarcarTodasLidas = () => {
    setNotifs(prev =>
      prev.map(n => ({
        ...n,
        lidoPor: Array.from(new Set([...(n.lidoPor || []), user.uid]))
      }))
    );
  };

  // Excluir notificação (CRUD)
  const handleExcluirNotificacao = (notifId: string) => {
    setNotifs(prev => prev.filter(n => n.id !== notifId));
  };

  // Enviar nova mensagem para a Ouvidoria (CRUD)
  const handleEnviarMensagem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoAssunto.trim() || !novoTextoMsg.trim()) return;

    setIsSendingMsg(true);
    setMsgSucessoEnvio('');

    try {
      const res = await fetch('/api/v1/ouvidoria/mensagens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          nome: user.nome,
          email: user.email,
          assunto: novoAssunto.trim(),
          mensagem: novoTextoMsg.trim()
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMensagens(prev => [data.mensagem, ...prev]);
        setNovoAssunto('');
        setNovoTextoMsg('');
        setMsgSucessoEnvio('Sua mensagem foi enviada com sucesso para a Ouvidoria!');
        setTimeout(() => setMsgSucessoEnvio(''), 5000);
      }
    } catch {
      const fallbackMsg: MensagemItem = {
        id: 'msg_' + Date.now(),
        uid: user.uid,
        nome: user.nome,
        email: user.email,
        assunto: novoAssunto.trim(),
        mensagem: novoTextoMsg.trim(),
        status: 'enviada',
        enviadoEm: new Date().toISOString()
      };
      setMensagens(prev => [fallbackMsg, ...prev]);
      setNovoAssunto('');
      setNovoTextoMsg('');
      setMsgSucessoEnvio('Sua mensagem foi registrada localmente no canal de ouvidoria!');
      setTimeout(() => setMsgSucessoEnvio(''), 5000);
    } finally {
      setIsSendingMsg(false);
    }
  };

  // Salvar edições do perfil (CRUD)
  const handleSalvarPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileErrorMsg('');
    setProfileSuccessMsg('');

    if (!editNome.trim()) {
      setProfileErrorMsg('Nome é obrigatório.');
      return;
    }

    setIsSavingProfile(true);

    try {
      const res = await fetch(`/api/v1/usuarios/${user.uid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: editNome.trim(),
          celular: editCelular,
          municipio: editMunicipio.trim(),
          uf: editUf,
          sexo: editSexo,
          dtNascimento: editDtNascimento,
          optInPush: pushAtivo
        })
      });

      if (!res.ok) {
        throw new Error('Falha ao atualizar perfil');
      }

      const data = await res.json();
      if (data.perfil) {
        if (onUpdateUser) onUpdateUser(data.perfil);
        setProfileSuccessMsg('Dados cadastrais atualizados com sucesso!');
        setIsEditingProfile(false);
        setTimeout(() => setProfileSuccessMsg(''), 4000);
      }
    } catch (err: any) {
      setProfileErrorMsg(err.message || 'Erro ao atualizar dados.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Excluir conta (LGPD Direito ao Esquecimento)
  const handleExcluirConta = async () => {
    setIsDeletingAccount(true);
    try {
      const res = await fetch(`/api/v1/usuarios/${user.uid}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        alert('Sua conta e dados pessoais foram excluídos com sucesso em conformidade com a LGPD.');
        if (onLogout) onLogout();
      }
    } catch {
      alert('Erro ao excluir conta.');
    } finally {
      setIsDeletingAccount(false);
      setShowDeleteModal(false);
    }
  };

  const pesquisasDisponiveis = pesquisas.filter(
    p => p.status === 'publicada' || p.status === 'ativa'
  );

  const totalVotadas = Object.values(statusVotos).filter(Boolean).length;
  const notifsNaoLidas = notifs.filter(n => !n.lidoPor?.includes(user.uid)).length;

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'pesquisas', label: 'Pesquisas', icon: Vote, badge: pesquisasDisponiveis.length },
    { id: 'resultados', label: 'Resultados', icon: BarChart3 },
    { id: 'notificacoes', label: 'Notificações', icon: Bell, badge: notifsNaoLidas > 0 ? notifsNaoLidas : undefined, isBadgeAlert: notifsNaoLidas > 0 },
    { id: 'configuracoes', label: 'Configurações', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row overflow-x-hidden">
      
      {/* =======================================================
          SIDEBAR NAVIGATION (LEFT LATERAL - DESKTOP & TABLET)
          - Expandir e Colapsar
          - Módulos: Home, Pesquisas, Resultados, Notificações, Configurações
          - Dentro de Configurações: Perfil com ajustes e botão de sair
          ======================================================= */}
      <aside
        className={`hidden lg:flex flex-col bg-[#081325] text-white border-r border-slate-800 transition-all duration-300 z-30 shrink-0 select-none ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Top Header of Sidebar with Proportional Logo */}
        <div className="h-20 flex items-center px-4 border-b border-slate-800/80">
          {!isSidebarCollapsed ? (
            <div className="flex items-center gap-3 overflow-hidden select-none w-full">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#123F8F] to-[#0B3D91] flex items-center justify-center shadow-md shrink-0 border border-white/20">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <span className="text-white font-black text-base tracking-tight">Plataforma</span>
                  <span className="text-emerald-400 font-black text-base tracking-tight">Eu Voto</span>
                </div>
                <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase truncate">
                  Seu Voto, Sua Voz
                </span>
              </div>
            </div>
          ) : (
            <div className="mx-auto select-none" title="Plataforma Eu Voto • Seu Voto, Sua Voz">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#123F8F] to-[#0B3D91] flex items-center justify-center shadow-md border border-white/20">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* User Mini Profile in Sidebar */}
        {!isSidebarCollapsed ? (
          <div className="p-3.5 mx-3 my-3 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0B3D91] text-white flex items-center justify-center font-black text-sm shrink-0">
              {user.nome.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-black truncate text-white">{user.nome}</div>
              <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Eleitor {user.uf || selectedUf}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="my-3 flex justify-center">
            <div
              className="w-10 h-10 rounded-xl bg-[#0B3D91] text-white flex items-center justify-center font-black text-sm cursor-pointer"
              title={`${user.nome} (Eleitor ${user.uf})`}
              onClick={() => setCurrentTab('configuracoes')}
            >
              {user.nome.charAt(0)}
            </div>
          </div>
        )}

        {/* Navigation Menu Links */}
        <nav className="flex-1 px-3 py-2 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id as UserTab)}
                className={`w-full flex items-center rounded-xl transition-all cursor-pointer font-bold text-xs ${
                  isSidebarCollapsed
                    ? 'justify-center p-3'
                    : 'justify-between px-3.5 py-3'
                } ${
                  isActive
                    ? 'bg-[#0B3D91] text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
                title={isSidebarCollapsed ? item.label : undefined}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  {!isSidebarCollapsed && <span>{item.label}</span>}
                </div>

                {!isSidebarCollapsed && item.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      item.isBadgeAlert
                        ? 'bg-rose-500 text-white animate-pulse'
                        : isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {isSidebarCollapsed && item.badge !== undefined && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 absolute top-2 right-2" />
                )}
              </button>
            );
          })}

          {/* Toggle Expand/Collapse Button — Positioned Below the Menu/Configurações Item */}
          <div className="pt-2">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className={`w-full flex items-center rounded-xl transition-all cursor-pointer font-bold text-xs border border-slate-700/60 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 ${
                isSidebarCollapsed
                  ? 'justify-center p-3'
                  : 'justify-between px-3.5 py-2.5'
              }`}
              title={isSidebarCollapsed ? 'Expandir menu lateral' : 'Colapsar menu lateral'}
            >
              <div className="flex items-center gap-3">
                {isSidebarCollapsed ? (
                  <PanelLeftOpen className="w-5 h-5 text-slate-300 shrink-0" />
                ) : (
                  <>
                    <PanelLeftClose className="w-5 h-5 text-slate-300 shrink-0" />
                    <span>Recolher Menu</span>
                  </>
                )}
              </div>
            </button>
          </div>
        </nav>

        {/* Bottom of Sidebar: Logout & Info */}
        <div className="p-3 border-t border-slate-800/80">
          <button
            onClick={() => setShowLogoutModal(true)}
            className={`w-full flex items-center rounded-xl text-xs font-bold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer ${
              isSidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-3.5 py-2.5'
            }`}
            title="Encerrar sessão com segurança"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isSidebarCollapsed && <span>Sair da Conta</span>}
          </button>
        </div>
      </aside>

      {/* =======================================================
          MOBILE DRAWER SIDEBAR (< 1024px)
          ======================================================= */}
      <AnimatePresence>
        {isMobileDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileDrawerOpen(false)}
              className="lg:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed inset-y-0 left-0 w-72 bg-[#081325] text-white z-50 flex flex-col shadow-2xl"
            >
              <div className="h-20 flex items-center justify-between px-4 border-b border-slate-800">
                <div className="flex items-center gap-3 overflow-hidden select-none">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#123F8F] to-[#0B3D91] flex items-center justify-center shadow-md shrink-0 border border-white/20">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div className="flex flex-col leading-none">
                    <div className="flex items-center gap-1.5">
                      <span className="text-white font-black text-base tracking-tight">Plataforma</span>
                      <span className="text-emerald-400 font-black text-base tracking-tight">Eu Voto</span>
                    </div>
                    <span className="text-[9px] text-white/75 font-bold tracking-wider uppercase mt-0.5">
                      Seu Voto, Sua Voz
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 mx-3 my-3 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0B3D91] text-white flex items-center justify-center font-black text-sm">
                  {user.nome.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-black truncate text-white">{user.nome}</div>
                  <div className="text-[11px] text-emerald-400 font-semibold">Eleitor Ativo</div>
                </div>
              </div>

              <nav className="flex-1 px-3 py-2 space-y-1.5">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentTab(item.id as UserTab);
                        setIsMobileDrawerOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all cursor-pointer font-bold text-xs ${
                        isActive
                          ? 'bg-[#0B3D91] text-white shadow-md'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-slate-300" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              <div className="p-3 border-t border-slate-800">
                <button
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    setShowLogoutModal(true);
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sair da Conta</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* =======================================================
          MAIN CONTENT WRAPPER
          ======================================================= */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-8">
        
        {/* =======================================================
            TOP HEADER (CONFORME SOLICITADO):
            - Apenas: Filtro de UF, Notificações, Botão Eleitor
            - SEM SIMULADOR NO TOPO
            - Botão Eleitor permite voltar à Landing Page
            ======================================================= */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs h-16 flex items-center px-4 sm:px-6 lg:px-8 justify-between gap-3">
          
          {/* Left: Brand Logo / Icon on Mobile & Tablet, and Breadcrumb */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setCurrentTab('home')}
              className="flex items-center gap-2 focus:outline-none cursor-pointer group text-left"
              title="Ir para a página inicial da Área do Eleitor"
            >
              {/* Full logo for tablet / larger screens (sm to lg) */}
              <img
                src="/logo01.png"
                alt="Plataforma Eu Voto"
                className="h-8 sm:h-9 w-auto object-contain hidden sm:block transition-transform group-hover:scale-102"
                onError={(e: any) => {
                  e.currentTarget.src = '/logo-icon.svg';
                }}
              />

              {/* Compact Logo Icon on mobile (< 640px) */}
              <div className="sm:hidden flex items-center gap-1.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#123F8F] to-[#0B3D91] flex items-center justify-center shadow-xs border border-white/20 shrink-0">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div className="hidden min-[400px]:flex flex-col leading-none">
                  <span className="text-[#0B3D91] font-black text-xs tracking-tight">Eu Voto</span>
                  <span className="text-[8px] text-slate-400 font-bold">2026</span>
                </div>
              </div>
            </button>

            <div className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-500 ml-1 border-l border-slate-200 pl-3">
              <span>Área do Eleitor</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-900 capitalize font-extrabold">{currentTab}</span>
            </div>
          </div>

          {/* Right Controls: Filtro de UF, Notificações, Botão Eleitor */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* 1. Filtro de UF */}
            {onSelectUf && (
              <div className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs transition-colors">
                <MapPin className="w-3.5 h-3.5 text-[#0B3D91]" />
                <span className="text-[11px] font-bold text-slate-500">UF:</span>
                <select
                  value={selectedUf}
                  onChange={(e) => onSelectUf(e.target.value)}
                  className="bg-transparent font-black text-[#0B3D91] text-xs focus:outline-none cursor-pointer"
                >
                  {UFS.map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            )}

            {/* 2. Notificações */}
            <button
              onClick={() => setCurrentTab('notificacoes')}
              className="relative p-2 rounded-xl text-slate-600 hover:text-[#0B3D91] hover:bg-slate-100 transition-colors cursor-pointer"
              title="Ver notificações"
            >
              <Bell className="w-4 h-4" />
              {notifsNaoLidas > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              )}
              {notifsNaoLidas > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
              )}
            </button>

            {/* 3. Botão Eleitor (Navegação entre Landing Page e Área do Usuário) */}
            <button
              id="btn-nav-eleitor"
              onClick={() => onNavigateSite && onNavigateSite('landing')}
              className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[#0B3D91] px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-2xs"
              title="Voltar ao portal público / Landing page"
            >
              <User className="w-3.5 h-3.5 text-[#0B3D91]" />
              <span>Eleitor</span>
              <ExternalLink className="w-3 h-3 text-[#0B3D91] opacity-70" />
            </button>

          </div>
        </header>

        {/* =======================================================
            MAIN BODY VIEWS
            ======================================================= */}
        <main className="w-full max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16 transition-all duration-300">

          {/* ----------------------------------------------------
              MÓDULO 1: HOME
              ---------------------------------------------------- */}
          {currentTab === 'home' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Welcome Card */}
              <div className="bg-gradient-to-r from-[#081325] via-[#0B3D91] to-[#16A34A] rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                <div>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-300 uppercase tracking-wider mb-2">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <span>Eleitor Verificado • Eleições 2026</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black">
                    Olá, {user.nome.split(' ')[0]}!
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-xl leading-relaxed">
                    Seu voto é único, inviolável e protegido pela tecnologia de amostragem cívica. Participe das pesquisas eleitorais ativas do seu estado ({selectedUf}).
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl text-center shrink-0 w-full md:w-auto">
                  <div className="text-2xl font-black text-emerald-400">{totalVotadas} / {pesquisasDisponiveis.length}</div>
                  <div className="text-[11px] text-slate-200 font-bold uppercase mt-0.5">Pesquisas Participadas</div>
                </div>
              </div>

              {/* Status & Quick Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div
                  onClick={() => setCurrentTab('pesquisas')}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-[#0B3D91] cursor-pointer transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0B3D91] flex items-center justify-center mb-3">
                    <Vote className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-black text-slate-900">Pesquisas Disponíveis</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {pesquisasDisponiveis.length} pesquisas abertas para votação.
                  </p>
                </div>

                <div
                  onClick={() => setCurrentTab('resultados')}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-[#16A34A] cursor-pointer transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#16A34A] flex items-center justify-center mb-3">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-black text-slate-900">Apuração & Resultados</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Visualize gráficos em barras, pizzas ou tabelas.
                  </p>
                </div>

                <div
                  onClick={() => setCurrentTab('configuracoes')}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-400 cursor-pointer transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mb-3">
                    <Shield className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-black text-slate-900">Segurança & 1 Voto por CPF</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Auditoria criptográfica com hash SHA-256 inviolável.
                  </p>
                </div>
              </div>

              {/* Destaque: Pesquisa Principal para Votar */}
              {pesquisasDisponiveis.length > 0 && (
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-4">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        Pesquisa em Destaque
                      </span>
                      <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1.5">
                        {pesquisasDisponiveis[0].titulo}
                      </h3>
                    </div>

                    {/* Botão com texto "Votar" atualizado e regra de 1 voto por CPF */}
                    {statusVotos[pesquisasDisponiveis[0].id] ? (
                      <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-xl text-xs font-bold shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Voto Registrado (1 por CPF)</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => onIniciarVotacao(pesquisasDisponiveis[0])}
                        className="bg-[#16A34A] hover:bg-[#15803d] text-white font-black px-5 py-2.5 rounded-xl text-xs shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer shrink-0"
                      >
                        <Vote className="w-4 h-4" />
                        <span>Votar</span>
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {pesquisasDisponiveis[0].descricao}
                  </p>
                </div>
              )}

            </div>
          )}

          {/* ----------------------------------------------------
              MÓDULO 2: PESQUISAS
              ---------------------------------------------------- */}
          {currentTab === 'pesquisas' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">Pesquisas Eleitorais</h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Participe votando na cabine da urna eletrônica. Cada eleitor tem direito a exatamente 1 voto por CPF em cada pesquisa.
                </p>
              </div>

              {pesquisas.length === 0 ? (
                <div className="bg-white rounded-3xl p-10 text-center border border-slate-200">
                  <Vote className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-800">Nenhuma pesquisa disponível</h3>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {pesquisas.map((pesquisa) => {
                    const jaVotou = statusVotos[pesquisa.id];
                    return (
                      <div
                        key={pesquisa.id}
                        className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0B3D91] border border-blue-200">
                              {pesquisa.tipo === 'oficial' ? 'Pesquisa Oficial' : 'Sondagem Aberta'}
                            </span>
                            {jaVotou ? (
                              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Voto Registrado (1 por CPF)</span>
                              </span>
                            ) : (
                              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                Pendente de Votação
                              </span>
                            )}
                          </div>

                          <h3 className="text-base font-black text-slate-900 leading-snug mb-1">
                            {pesquisa.titulo}
                          </h3>
                          <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                            {pesquisa.descricao}
                          </p>

                          <div className="flex items-center gap-4 text-xs text-slate-500 mb-4 pb-3 border-b border-slate-100">
                            <div>
                              <span className="font-semibold text-slate-700">Total de Votos: </span>
                              <strong className="text-slate-900">{pesquisa.totalVotos || 0}</strong>
                            </div>
                            <div>
                              <span className="font-semibold text-slate-700">Status: </span>
                              <span className="text-emerald-600 font-bold capitalize">{pesquisa.status}</span>
                            </div>
                          </div>
                        </div>

                        {/* Botão atualizado com texto "Votar" e regra 1 voto por CPF */}
                        <div className="flex items-center gap-2 pt-1">
                          {jaVotou ? (
                            <button
                              disabled
                              className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold bg-slate-100 text-slate-500 flex items-center justify-center gap-2 cursor-not-allowed border border-slate-200"
                              title="Você já votou nesta pesquisa com seu CPF"
                            >
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>Voto Registrado</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => onIniciarVotacao(pesquisa)}
                              className="flex-1 py-2.5 px-3 rounded-xl text-xs font-black bg-[#16A34A] hover:bg-[#15803d] text-white shadow-xs transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <Vote className="w-4 h-4" />
                              <span>Votar</span>
                            </button>
                          )}

                          <button
                            onClick={() => setCurrentTab('resultados')}
                            className="py-2.5 px-3 rounded-xl text-xs font-bold border border-slate-200 hover:bg-slate-50 text-slate-700 cursor-pointer"
                            title="Ver Resultados"
                          >
                            <BarChart3 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ----------------------------------------------------
              MÓDULO 3: RESULTADOS
              ---------------------------------------------------- */}
          {currentTab === 'resultados' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <ResultadosView
                pesquisas={pesquisas}
                initialUf={selectedUf}
              />
            </div>
          )}

          {/* ----------------------------------------------------
              MÓDULO 4: NOTIFICAÇÕES (COM EXIBIÇÃO CLARA DE STATUS)
              ---------------------------------------------------- */}
          {currentTab === 'notificacoes' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">Notificações & Comunicados</h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Acompanhe os comunicados oficiais, status de leitura e atualizações do calendário eleitoral.
                  </p>
                </div>

                {notifsNaoLidas > 0 && (
                  <button
                    onClick={handleMarcarTodasLidas}
                    className="self-start sm:self-auto text-xs font-bold text-[#0B3D91] hover:text-[#123F8F] bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Marcar todas como lidas</span>
                  </button>
                )}
              </div>

              {/* Filtro por Status: Todas / Não Lidas / Lidas */}
              <div className="flex items-center gap-2 bg-slate-100/80 p-1.5 rounded-2xl w-fit border border-slate-200">
                <button
                  onClick={() => setFiltroStatusNotif('todas')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    filtroStatusNotif === 'todas'
                      ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Todas ({notifs.length})
                </button>
                <button
                  onClick={() => setFiltroStatusNotif('nao_lidas')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    filtroStatusNotif === 'nao_lidas'
                      ? 'bg-white text-[#0B3D91] shadow-2xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  <span>Não Lidas ({notifs.filter(n => !n.lidoPor?.includes(user.uid)).length})</span>
                </button>
                <button
                  onClick={() => setFiltroStatusNotif('lidas')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    filtroStatusNotif === 'lidas'
                      ? 'bg-white text-emerald-700 shadow-2xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Lidas ({notifs.filter(n => n.lidoPor?.includes(user.uid)).length})</span>
                </button>
              </div>

              {/* Lista de Notificações com Status Explícito */}
              <div className="space-y-3.5">
                {(() => {
                  const filtradas = notifs.filter(n => {
                    const isLido = n.lidoPor?.includes(user.uid);
                    if (filtroStatusNotif === 'nao_lidas') return !isLido;
                    if (filtroStatusNotif === 'lidas') return isLido;
                    return true;
                  });

                  if (filtradas.length === 0) {
                    return (
                      <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
                        Nenhuma notificação encontrada para este filtro.
                      </div>
                    );
                  }

                  return filtradas.map(n => {
                    const isLido = n.lidoPor?.includes(user.uid);
                    return (
                      <div
                        key={n.id}
                        className={`p-5 rounded-2xl border transition-all ${
                          isLido
                            ? 'bg-white border-slate-200 hover:border-slate-300'
                            : 'bg-blue-50/70 border-blue-300 shadow-xs'
                        }`}
                      >
                        {/* Header da Notificação com Status em Destaque */}
                        <div className="flex flex-wrap items-center justify-between gap-2.5 mb-2 pb-2 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            {/* Status Badge */}
                            {isLido ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Status: Lida</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-blue-100 text-[#0B3D91] border border-blue-300">
                                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                                <span>Status: Não Lida</span>
                              </span>
                            )}

                            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider hidden sm:inline">
                              • Canal Oficial Cívico
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {/* Alternar Status (Marcar como lida / não lida) */}
                            <button
                              onClick={() => handleAlternarLida(n.id, !!isLido)}
                              className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                                isLido
                                  ? 'border-slate-200 text-slate-600 hover:bg-slate-100'
                                  : 'border-blue-200 text-[#0B3D91] hover:bg-blue-100'
                              }`}
                            >
                              {isLido ? 'Marcar como não lida' : 'Marcar como lida'}
                            </button>

                            {/* Excluir Notificação */}
                            <button
                              onClick={() => handleExcluirNotificacao(n.id)}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Excluir notificação"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Corpo da Notificação */}
                        <h4 className="text-sm sm:text-base font-black text-slate-900 mb-1">
                          {n.titulo}
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-3">
                          {n.mensagem}
                        </p>

                        {/* Rodapé da Notificação */}
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100/80">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>Recebida em: {new Date(n.criadoEm).toLocaleString('pt-BR')}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">ID: {n.id.substring(0, 8)}</span>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}

          {/* ----------------------------------------------------
              MÓDULO 5: CONFIGURAÇÕES
              - Contém: Perfil com os ajustes e o botão de sair
              ---------------------------------------------------- */}
          {currentTab === 'configuracoes' && (
            <div className="space-y-6 animate-in fade-in duration-200 max-w-4xl mx-auto">
              
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">Configurações</h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Gerencie seu perfil de eleitor, dados cadastrais, segurança, ouvidoria e encerramento de sessão.
                </p>
              </div>

              {/* Sub-menu interno de Configurações */}
              <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
                <button
                  onClick={() => setConfigSubTab('perfil')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    configSubTab === 'perfil'
                      ? 'bg-[#0B3D91] text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  Perfil & Ajustes
                </button>
                <button
                  onClick={() => setConfigSubTab('seguranca')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    configSubTab === 'seguranca'
                      ? 'bg-[#0B3D91] text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  Segurança & 1 Voto por CPF
                </button>
                <button
                  onClick={() => setConfigSubTab('ouvidoria')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    configSubTab === 'ouvidoria'
                      ? 'bg-[#0B3D91] text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  Canal de Ouvidoria
                </button>
                <button
                  onClick={() => setConfigSubTab('lgpd')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    configSubTab === 'lgpd'
                      ? 'bg-[#0B3D91] text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  Privacidade (LGPD)
                </button>
              </div>

              {profileSuccessMsg && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{profileSuccessMsg}</span>
                </div>
              )}

              {profileErrorMsg && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{profileErrorMsg}</span>
                </div>
              )}

              {/* Sub-Aba 1: Perfil & Ajustes */}
              {configSubTab === 'perfil' && (
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0B3D91] flex items-center justify-center font-black text-lg">
                        {user.nome.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-base font-black text-slate-900">{user.nome}</h3>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(!isEditingProfile)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{isEditingProfile ? 'Cancelar' : 'Editar Dados'}</span>
                    </button>
                  </div>

                  {isEditingProfile ? (
                    <form onSubmit={handleSalvarPerfil} className="space-y-4 pt-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Nome Completo *</label>
                          <input
                            type="text"
                            required
                            value={editNome}
                            onChange={e => setEditNome(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0B3D91]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Celular / WhatsApp</label>
                          <input
                            type="text"
                            value={editCelular}
                            onChange={e => setEditCelular(mascararCelular(e.target.value))}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0B3D91]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2">
                          <label className="block text-xs font-bold text-slate-700 mb-1">Município de Votação</label>
                          <input
                            type="text"
                            value={editMunicipio}
                            onChange={e => setEditMunicipio(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0B3D91]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Estado (UF)</label>
                          <select
                            value={editUf}
                            onChange={e => setEditUf(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                          >
                            {UFS.map(u => (
                              <option key={u} value={u}>{u}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="checkbox"
                          id="check-push"
                          checked={pushAtivo}
                          onChange={e => setPushAtivo(e.target.checked)}
                          className="rounded text-[#0B3D91] focus:ring-0 cursor-pointer"
                        />
                        <label htmlFor="check-push" className="text-xs text-slate-700 font-semibold cursor-pointer">
                          Desejo receber notificações e alertas de novas pesquisas por push/e-mail
                        </label>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsEditingProfile(false)}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={isSavingProfile}
                          className="flex-1 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0B3D91] hover:bg-[#123F8F] shadow-xs cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          <span>{isSavingProfile ? 'Salvando...' : 'Salvar Alterações'}</span>
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <span className="text-slate-500 font-bold block text-[10px] uppercase">Município</span>
                        <strong className="text-slate-900">{user.municipio || 'Não informado'}</strong>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <span className="text-slate-500 font-bold block text-[10px] uppercase">UF Eleitoral</span>
                        <strong className="text-[#0B3D91]">{user.uf}</strong>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <span className="text-slate-500 font-bold block text-[10px] uppercase">Celular</span>
                        <strong className="text-slate-900">{user.celular || 'Não cadastrado'}</strong>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Sub-Aba 2: Segurança & 1 Voto por CPF */}
              {configSubTab === 'seguranca' && (
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 text-sm font-black text-slate-900">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    <span>Integridade Democrática e Regra de 1 Voto por CPF</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    A plataforma Eu Voto implementa o princípio democrático oficial: cada eleitor possui direito a um único voto por CPF em cada pesquisa ativa. Para proteger a sua privacidade, seu CPF nunca é exibido publicamente nem associado diretamente ao voto na cédula.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <div className="text-[10px] font-bold text-slate-500 uppercase">CPF Mascarado (LGPD)</div>
                      <div className="text-sm font-mono font-black text-slate-900 mt-1">
                        {user.cpfMascarado || '***.***.***-**'}
                      </div>
                      <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Auditado e protegido</div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <div className="text-[10px] font-bold text-slate-500 uppercase">Hash SHA-256 (TSE)</div>
                      <div className="text-xs font-mono text-slate-700 truncate mt-1">
                        {user.cpfHash || 'sha256_euvoto_hash_anonimizado'}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Impede votos duplicados mantendo o sigilo do voto</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-Aba 3: Canal de Ouvidoria */}
              {configSubTab === 'ouvidoria' && (
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 text-sm font-black text-slate-900">
                    <Send className="w-4 h-4 text-[#0B3D91]" />
                    <span>Fale com a Ouvidoria e Integridade Cívica</span>
                  </div>

                  {msgSucessoEnvio && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{msgSucessoEnvio}</span>
                    </div>
                  )}

                  <form onSubmit={handleEnviarMensagem} className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Assunto *</label>
                      <input
                        type="text"
                        required
                        value={novoAssunto}
                        onChange={e => setNovoAssunto(e.target.value)}
                        placeholder="Ex: Dúvida sobre pesquisa eleitoral"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0B3D91]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Mensagem *</label>
                      <textarea
                        required
                        rows={3}
                        value={novoTextoMsg}
                        onChange={e => setNovoTextoMsg(e.target.value)}
                        placeholder="Descreva sua solicitação com clareza..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0B3D91]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSendingMsg || !novoAssunto.trim() || !novoTextoMsg.trim()}
                      className="bg-[#0B3D91] hover:bg-[#123F8F] disabled:bg-slate-300 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-xs transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSendingMsg ? 'Enviando...' : 'Enviar para Ouvidoria'}</span>
                    </button>
                  </form>

                  {mensagens.length > 0 && (
                    <div className="pt-4 border-t border-slate-100 space-y-2.5">
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                        Histórico de Mensagens ({mensagens.length})
                      </h4>
                      {mensagens.map(m => (
                        <div key={m.id} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
                          <div className="flex items-center justify-between">
                            <strong className="text-slate-900 font-bold">{m.assunto}</strong>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                              {m.status === 'respondida' ? 'Respondida' : 'Em Análise'}
                            </span>
                          </div>
                          <p className="text-slate-600">{m.mensagem}</p>
                          {m.resposta && (
                            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-900 text-[11px] mt-1 border border-emerald-200">
                              <strong>Resposta Oficial:</strong> {m.resposta}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Sub-Aba 4: LGPD */}
              {configSubTab === 'lgpd' && (
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 text-sm font-black text-slate-900">
                    <FileText className="w-4 h-4 text-[#0B3D91]" />
                    <span>Privacidade & Lei Geral de Proteção de Dados (LGPD)</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Você tem total controle sobre seus dados cadastrais. Caso deseje encerrar definitivamente seu cadastro na plataforma, utilize o botão abaixo para invocar seu Direito ao Esquecimento.
                  </p>

                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-black text-rose-900">Exclusão Definitiva de Conta</div>
                      <div className="text-[11px] text-rose-700">Seus dados serão permanentemente apagados dos registros.</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowDeleteModal(true)}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-xs cursor-pointer shrink-0"
                    >
                      Excluir Minha Conta
                    </button>
                  </div>
                </div>
              )}

              {/* BOTÃO DE SAIR DENTRO DE CONFIGURAÇÕES (SOLICITADO EXPLICITAMENTE) */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-black text-slate-900">Encerrar Sessão</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Desconecte com segurança da Área do Eleitor neste navegador.
                  </p>
                </div>

                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 shadow-2xs"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sair da Conta</span>
                </button>
              </div>

            </div>
          )}

        </main>
      </div>

      {/* =======================================================
          MOBILE BOTTOM BAR (< 1024px)
          - Home, Pesquisas, Resultados, Notificações, Configurações
          ======================================================= */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 flex items-center justify-around shadow-lg">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id as UserTab)}
              className={`flex flex-col items-center justify-center min-w-[50px] min-h-[46px] rounded-xl transition-all cursor-pointer relative ${
                isActive ? 'text-[#0B3D91] font-black' : 'text-slate-500 font-semibold'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">{item.label}</span>
              {item.badge !== undefined && (
                <span className="absolute top-1 right-2.5 w-2 h-2 rounded-full bg-rose-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* =======================================================
          MODAL DE CONFIRMAÇÃO DE LOGOUT
          ======================================================= */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-slate-900 space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-black text-slate-900">Deseja realmente sair?</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Sua sessão será finalizada com segurança. Você poderá entrar novamente a qualquer momento com seu CPF e senha.
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setShowLogoutModal(false);
                  if (onLogout) onLogout();
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md cursor-pointer"
              >
                Confirmar Saída
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================
          MODAL DE CONFIRMAÇÃO DE EXCLUSÃO DE CONTA (LGPD)
          ======================================================= */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-slate-900 space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-black text-slate-900">Excluir Conta e Dados Pessoais?</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Esta ação é definitiva. Conforme a Lei Geral de Proteção de Dados (LGPD), todos os seus registros de cadastro serão permanentemente apagados dos nossos servidores.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleExcluirConta}
                disabled={isDeletingAccount}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-60"
              >
                {isDeletingAccount ? 'Excluindo...' : 'Confirmar Exclusão'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
