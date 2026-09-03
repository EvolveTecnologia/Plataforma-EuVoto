import React, { useState, useEffect } from 'react';
import { UsuarioPerfil, Pesquisa, ConfigLanding, NotificacaoPush } from './types';
import { DEFAULT_PESQUISAS } from './data/initialData';
import { Navbar } from './components/Navbar';
import { LandingView } from './components/LandingView';
import { UserAreaView } from './components/UserAreaView';
import { UrnaVotacao } from './components/UrnaVotacao';
import { ResultadosView } from './components/ResultadosView';
import { AdminView } from './components/AdminView';
import { LoginScreen } from './components/LoginScreen';
import { TermosDeUso } from './components/TermosDeUso';
import { PoliticaPrivacidade } from './components/PoliticaPrivacidade';
import { Footer } from './components/Footer';
import { Chatbot } from './components/Chatbot';

type AppView = 'landing' | 'user' | 'urna' | 'admin' | 'resultados' | 'login' | 'termos' | 'privacidade';
type UserTabType = 'home' | 'pesquisas' | 'resultados' | 'notificacoes' | 'ouvidoria' | 'configuracoes';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UsuarioPerfil | null>(() => {
    try {
      const saved = localStorage.getItem('euvoto_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [userAreaTab, setUserAreaTab] = useState<UserTabType>('home');
  const [origemVotacao, setOrigemVotacao] = useState<'user' | 'landing'>('landing');
  const [selectedUf, setSelectedUf] = useState<string>(() => currentUser?.uf || 'PA');
  const [pesquisas, setPesquisas] = useState<Pesquisa[]>(DEFAULT_PESQUISAS);
  const [activePesquisaUrna, setActivePesquisaUrna] = useState<Pesquisa | null>(DEFAULT_PESQUISAS[0] || null);
  const [notificacoes, setNotificacoes] = useState<NotificacaoPush[]>([]);
  const [configLanding, setConfigLanding] = useState<ConfigLanding>({
    sobreTitulo: 'Democracia Digital Segura e Confiável',
    sobreTexto: 'A Plataforma Eu Voto é uma iniciativa cívica de ponta com padrão de segurança eleitoral, permitindo a participação popular informada em pesquisas de intenção de voto com dados 100% integrados às bases oficiais do Tribunal Superior Eleitoral (TSE).',
    metodologiaTitulo: 'Metodologia e Rigor Científico',
    metodologiaTexto: 'Todas as pesquisas utilizam amostragem probabilística estratificada com ponderação por sexo, faixa etária, escolaridade e nível socioeconômico segundo o Censo do IBGE e estatísticas oficiais do eleitorado brasileiro.',
    avisoLegalTSE: 'AVISO LEGAL: Conforme a legislação eleitoral brasileira (Lei nº 9.504/1997 e Resoluções do TSE), pesquisas eleitorais de opinião pública destinadas a divulgação ampla durante o período eleitoral requerem registro prévio perante a Justiça Eleitoral no sistema PesqEle com antecedência mínima legal.',
    contatoEmail: 'contato@plataformaeuvoto.org.br',
    contatoTelefone: '(91) 99615-6672',
    atualizadoEm: new Date().toISOString()
  });

  // Global scroll-to-top on any view transition
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [currentView]);

  // Load surveys, CMS, and notifications
  useEffect(() => {
    carregarPesquisas();
    carregarConfigLanding();
    carregarNotificacoes();
  }, [selectedUf]);

  const carregarPesquisas = async () => {
    try {
      const res = await fetch(`/api/v1/pesquisas?uf=${selectedUf}`);
      if (res.ok) {
        const data = await res.json();
        setPesquisas(data);
        if (!activePesquisaUrna && data.length > 0) {
          setActivePesquisaUrna(data[0]);
        }
      }
    } catch {}
  };

  const carregarConfigLanding = async () => {
    try {
      const res = await fetch('/api/v1/config_landing');
      if (res.ok) {
        const data = await res.json();
        setConfigLanding(data);
      }
    } catch {}
  };

  const carregarNotificacoes = async () => {
    try {
      const res = await fetch(`/api/v1/notificacoes?uf=${selectedUf}`);
      if (res.ok) {
        const data = await res.json();
        setNotificacoes(data);
      }
    } catch {}
  };

  const handleSuccessLogin = (perfil: UsuarioPerfil) => {
    setCurrentUser(perfil);
    setSelectedUf(perfil.uf);
    try {
      localStorage.setItem('euvoto_user', JSON.stringify(perfil));
    } catch {}

    // Navigate to appropriate area
    if (perfil.isAdmin) {
      setCurrentView('admin');
    } else {
      setCurrentView('user');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('euvoto_user');
      sessionStorage.clear();
    } catch {}
    setUserAreaTab('home');
    setCurrentView('landing');
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  const handleIniciarVotacao = (pesquisa: Pesquisa, origem: 'user' | 'landing' = 'landing') => {
    setOrigemVotacao(origem);
    setActivePesquisaUrna(pesquisa);
    setCurrentView('urna');
  };

  // Demo direct logins for instant review
  const handleAcessarEleitorDemo = () => {
    const demoEleitor: UsuarioPerfil = {
      uid: 'usr_demo_eleitor_pa',
      nome: 'Eleitor Cidadão do Pará',
      email: 'eleitor.cidadao@euvoto.org.br',
      sexo: 'MASCULINO',
      dtNascimento: '1995-04-12',
      idade: 31,
      celular: '(91) 99615-6672',
      cpfHash: 'sha256_hash_eleitor_demo_2026',
      cpfMascarado: '***.456.789-**',
      municipio: 'Belém',
      uf: 'PA',
      optInPush: true,
      isAdmin: false,
      createdAt: new Date().toISOString()
    };
    handleSuccessLogin(demoEleitor);
  };

  const handleAcessarAdminDemo = () => {
    const demoAdmin: UsuarioPerfil = {
      uid: 'adm_master_2026',
      nome: 'Coordenador Geral de Pesquisas',
      email: 'aplicativoeduca@gmail.com',
      sexo: 'MASCULINO',
      dtNascimento: '1985-05-15',
      idade: 41,
      celular: '(91) 99615-6672',
      cpfHash: 'sha256_adm_hash_master_2026',
      cpfMascarado: '***.789.123-**',
      municipio: 'Belém',
      uf: 'PA',
      optInPush: true,
      isAdmin: true,
      createdAt: new Date().toISOString()
    };
    handleSuccessLogin(demoAdmin);
  };

  const handleNavigation = (view: AppView) => {
    if (view === 'admin' && !currentUser?.isAdmin) {
      setCurrentView('login');
      return;
    }
    if (view === 'user' && !currentUser) {
      setCurrentView('login');
      return;
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Full-screen Login view matching user request (not a modal, inspired by image.png)
  if (currentView === 'login') {
    return (
      <LoginScreen
        onSuccessLogin={handleSuccessLogin}
        onVoltarParaSite={() => setCurrentView('landing')}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FB] text-[#0F172A] font-sans selection:bg-[#0B3D91] selection:text-white">
      
      {/* Top Navigation Bar: rendered on all views EXCEPT 'user', which has its own single unified header */}
      {currentView !== 'user' && (
        <Navbar
          user={currentUser}
          onOpenAuth={() => setCurrentView('login')}
          onLogout={handleLogout}
          onNavigate={handleNavigation}
          currentView={currentView}
          selectedUf={selectedUf}
          onSelectUf={setSelectedUf}
          notificacoes={notificacoes}
        />
      )}

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingView
            pesquisas={pesquisas}
            configLanding={configLanding}
            selectedUf={selectedUf}
            onSelectUf={setSelectedUf}
            onVotar={(p) => handleIniciarVotacao(p, 'landing')}
            onVerResultados={() => setCurrentView('resultados')}
            onOpenAuth={() => setCurrentView('login')}
            onIrParaLogin={() => setCurrentView('login')}
            onAcessarEleitorDemo={handleAcessarEleitorDemo}
            onAcessarAdminDemo={handleAcessarAdminDemo}
            isLoggedIn={!!currentUser}
          />
        )}

        {currentView === 'user' && currentUser && (
          <UserAreaView
            user={currentUser}
            pesquisas={pesquisas}
            initialTab={userAreaTab}
            onIniciarVotacao={(p) => handleIniciarVotacao(p, 'user')}
            notificacoes={notificacoes}
            selectedUf={selectedUf}
            onSelectUf={setSelectedUf}
            onNavigateSite={(view) => setCurrentView(view as any)}
            onUpdateUser={(updated) => {
              setCurrentUser(updated);
              try {
                localStorage.setItem('euvoto_user', JSON.stringify(updated));
              } catch {}
            }}
            onLogout={handleLogout}
            onVerResultados={() => setCurrentView('resultados')}
          />
        )}

        {currentView === 'urna' && activePesquisaUrna && (
          <UrnaVotacao
            pesquisa={activePesquisaUrna}
            user={currentUser}
            ufEleitor={selectedUf}
            onVotoConcluido={() => {
              carregarPesquisas();
              if (origemVotacao === 'user' && currentUser) {
                setUserAreaTab('resultados');
                setCurrentView('user');
              } else {
                setCurrentView('resultados');
              }
            }}
            onCancelar={() => {
              if (origemVotacao === 'user' && currentUser) {
                setUserAreaTab('pesquisas');
                setCurrentView('user');
              } else {
                setCurrentView('landing');
              }
            }}
            onOpenAuth={() => setCurrentView('login')}
          />
        )}

        {currentView === 'resultados' && (
          <ResultadosView
            pesquisas={pesquisas}
            initialUf={selectedUf}
          />
        )}

        {currentView === 'admin' && currentUser?.isAdmin && (
          <AdminView
            pesquisas={pesquisas}
            configLanding={configLanding}
            onRefreshPesquisas={carregarPesquisas}
          />
        )}

        {currentView === 'termos' && (
          <TermosDeUso onVoltar={() => setCurrentView('landing')} />
        )}

        {currentView === 'privacidade' && (
          <PoliticaPrivacidade onVoltar={() => setCurrentView('landing')} />
        )}
      </main>

      {/* Global Site Footer (Oculto na Urna, Área do Usuário e Área do Administrador) */}
      {currentView !== 'urna' && currentView !== 'user' && currentView !== 'admin' && (
        <Footer
          onNavigate={handleNavigation}
          onOpenAuth={() => setCurrentView('login')}
          onAcessarEleitorDemo={handleAcessarEleitorDemo}
          onAcessarAdminDemo={handleAcessarAdminDemo}
        />
      )}

      {/* Chatbot cívico: carregado nas páginas públicas do site e landing page */}
      {currentView !== 'user' && currentView !== 'urna' && currentView !== 'admin' && (
        <Chatbot />
      )}

    </div>
  );
}
