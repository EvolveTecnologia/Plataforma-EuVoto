import React, { useState, useMemo } from 'react';
import { UsuarioPerfil } from '../types';
import { validarCPF, validarEmail, mascararCPF, mascararCelular, gerarHashCpf } from '../utils/cpf';
import {
  Shield,
  Lock,
  ArrowLeft,
  Mail,
  User,
  Eye,
  EyeOff,
  Check,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  KeyRound,
  FileText,
  Scale,
  X
} from 'lucide-react';
import { TermosDeUso } from './TermosDeUso';
import { PoliticaPrivacidade } from './PoliticaPrivacidade';

interface LoginScreenProps {
  onSuccessLogin: (perfil: UsuarioPerfil) => void;
  onVoltarParaSite: () => void;
  initialMode?: 'login' | 'registro';
}

const UFS = [
  'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN',
  'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO'
];

type AuthMode = 'login' | 'registro' | 'recuperar' | 'conclusao_cadastro';

interface GoogleUser {
  uid: string;
  nome: string;
  email: string;
  photoUrl?: string;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onSuccessLogin,
  onVoltarParaSite,
  initialMode = 'login'
}) => {
  const [authMode, setAuthMode] = useState<AuthMode>(initialMode === 'registro' ? 'registro' : 'login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Login form state
  const [loginInput, setLoginInput] = useState('');
  const [senha, setSenha] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Google Auth Simulation / Modal state
  const [isGoogleAuthModalOpen, setIsGoogleAuthModalOpen] = useState(false);
  const [googleUserData, setGoogleUserData] = useState<GoogleUser | null>(null);

  // Password Recovery state ("Esqueceu a senha?")
  const [recoveryStep, setRecoveryStep] = useState<1 | 2 | 3 | 4>(1); // 1: input id, 2: verify code, 3: new password, 4: success
  const [recoveryIdentificador, setRecoveryIdentificador] = useState('');
  const [recoveryToken, setRecoveryToken] = useState('');
  const [recoveryCodeInput, setRecoveryCodeInput] = useState('');
  const [recoveryCodeSimulado, setRecoveryCodeSimulado] = useState('');
  const [recoveryNovaSenha, setRecoveryNovaSenha] = useState('');
  const [recoveryConfirmaSenha, setRecoveryConfirmaSenha] = useState('');
  const [recoveryError, setRecoveryError] = useState('');

  // Registration & Completion state
  const [nome, setNome] = useState('');
  const [emailReg, setEmailReg] = useState('');
  const [sexo, setSexo] = useState<'MASCULINO' | 'FEMININO' | 'OUTRO' | 'NAO_INFORMADO'>('MASCULINO');
  const [dtNascimento, setDtNascimento] = useState('');
  const [celular, setCelular] = useState('');
  const [cpf, setCpf] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [uf, setUf] = useState('PA');
  const [optInPush, setOptInPush] = useState(true);
  const [aceiteLgpd, setAceiteLgpd] = useState(false);
  const [regError, setRegError] = useState('');

  // Modals for Terms of Use & Privacy Policy
  const [activeLegalModal, setActiveLegalModal] = useState<'termos' | 'privacidade' | null>(null);

  // =========================================================================
  // REAL-TIME VALIDATIONS
  // =========================================================================

  const getAnalysisForIdentificador = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) {
      return { type: 'empty', isValid: false, message: 'Digite seu E-mail ou CPF cadastrado', isCpf: false };
    }

    const hasAt = trimmed.includes('@');
    const digitsOnly = trimmed.replace(/\D/g, '');

    if (hasAt) {
      const isEmailValid = validarEmail(trimmed);
      return {
        type: 'email',
        isValid: isEmailValid,
        message: isEmailValid ? 'E-mail com formato válido' : 'Formato de e-mail incompleto ou inválido',
        isCpf: false
      };
    }

    if (digitsOnly.length > 0) {
      if (digitsOnly.length < 11) {
        return {
          type: 'cpf',
          isValid: false,
          message: `Preenchendo CPF (${digitsOnly.length}/11 dígitos)...`,
          isCpf: true
        };
      }
      const isCpfValid = validarCPF(digitsOnly);
      return {
        type: 'cpf',
        isValid: isCpfValid,
        message: isCpfValid
          ? 'CPF válido (dígitos verificadores da Receita Federal confirmados)'
          : 'CPF inválido! Verifique os números digitados',
        isCpf: true
      };
    }

    return { type: 'unknown', isValid: false, message: 'Informe um E-mail ou CPF válido', isCpf: false };
  };

  const loginInputAnalysis = useMemo(() => {
    return getAnalysisForIdentificador(loginInput);
  }, [loginInput]);

  const recoveryInputAnalysis = useMemo(() => {
    return getAnalysisForIdentificador(recoveryIdentificador);
  }, [recoveryIdentificador]);

  // Handle smart input formatting
  const handleLoginInputChange = (val: string) => {
    if (!val.includes('@') && /^\d+$/.test(val.replace(/\D/g, '')) && val.replace(/\D/g, '').length <= 11) {
      setLoginInput(mascararCPF(val));
    } else {
      setLoginInput(val);
    }
  };

  const handleRecoveryInputChange = (val: string) => {
    if (!val.includes('@') && /^\d+$/.test(val.replace(/\D/g, '')) && val.replace(/\D/g, '').length <= 11) {
      setRecoveryIdentificador(mascararCPF(val));
    } else {
      setRecoveryIdentificador(val);
    }
  };

  const emailRegAnalysis = useMemo(() => {
    const trimmed = emailReg.trim();
    if (!trimmed) {
      return { isValid: false, message: 'E-mail obrigatório para identificação' };
    }
    const valid = validarEmail(trimmed);
    return {
      isValid: valid,
      message: valid ? 'E-mail com formato válido' : 'Digite um e-mail válido (ex: seu.nome@provedor.com)'
    };
  }, [emailReg]);

  const cpfAnalysis = useMemo(() => {
    const digits = cpf.replace(/\D/g, '');
    if (!digits) {
      return { isValid: false, message: 'Informe os 11 dígitos do CPF para validação no TSE' };
    }
    if (digits.length < 11) {
      return { isValid: false, message: `Preenchendo CPF (${digits.length}/11 dígitos)...` };
    }
    const valid = validarCPF(digits);
    return {
      isValid: valid,
      message: valid
        ? 'CPF válido conforme Receita Federal (armazenado via hash anônimo SHA-256)'
        : 'CPF inválido! Dígitos verificadores incorretos'
    };
  }, [cpf]);

  const idadeCalculada = useMemo(() => {
    if (!dtNascimento) return null;
    const birth = new Date(dtNascimento);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }, [dtNascimento]);

  const isRegisterFormValid = useMemo(() => {
    return (
      nome.trim().length >= 3 &&
      emailRegAnalysis.isValid &&
      cpfAnalysis.isValid &&
      dtNascimento &&
      (idadeCalculada !== null && idadeCalculada >= 16) &&
      municipio.trim().length >= 2 &&
      aceiteLgpd
    );
  }, [nome, emailRegAnalysis.isValid, cpfAnalysis.isValid, dtNascimento, idadeCalculada, municipio, aceiteLgpd]);

  // =========================================================================
  // GOOGLE INTEGRATION & AUTHENTICATION FLOW
  // =========================================================================

  const handleOpenGoogleModal = () => {
    setLoginError('');
    setIsGoogleAuthModalOpen(true);
  };

  const handleConfirmGoogleAuth = async (userEmail: string, userName: string) => {
    setIsGoogleAuthModalOpen(false);
    setIsLoading(true);
    setLoginError('');

    try {
      const generatedUid = 'usr_google_' + btoa(userEmail.toLowerCase().trim()).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16);
      const isMasterAdmin = userEmail.toLowerCase().trim() === 'aplicativoeduca@gmail.com';

      // Store Google state
      const gUser: GoogleUser = {
        uid: generatedUid,
        nome: userName,
        email: userEmail,
        photoUrl: 'https://lh3.googleusercontent.com/a/default-user=s96-c'
      };
      setGoogleUserData(gUser);

      // Check if user already exists in DB with complete profile
      const checkRes = await fetch(`/api/v1/usuarios/${generatedUid}`);
      if (checkRes.ok) {
        const existingProfile: UsuarioPerfil = await checkRes.json();
        if (existingProfile.cpfMascarado && existingProfile.municipio && existingProfile.dtNascimento) {
          // Profile is complete! Direct to User Area
          onSuccessLogin(existingProfile);
          return;
        }
      }

      // Profile is incomplete -> Go to "Tela de Conclusão de Cadastro"
      setNome(userName);
      setEmailReg(userEmail);
      setAuthMode('conclusao_cadastro');
      setRegError('');
    } catch {
      setLoginError('Falha ao autenticar com Conta Google.');
    } finally {
      setIsLoading(false);
    }
  };

  // =========================================================================
  // ACTIONS: LOGIN & DEMO
  // =========================================================================

  const handleQuickLogin = async (tipo: 'eleitor' | 'admin') => {
    setIsLoading(true);
    setLoginError('');

    try {
      if (tipo === 'admin') {
        const adminProfile: UsuarioPerfil = {
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
        onSuccessLogin(adminProfile);
      } else {
        const eleitorProfile: UsuarioPerfil = {
          uid: 'usr_eleitor_demo',
          nome: 'Eleitor Cidadão do Pará',
          email: 'eleitor.cidadao@euvoto.org.br',
          sexo: 'FEMININO',
          dtNascimento: '1996-08-20',
          idade: 30,
          celular: '(91) 98877-6655',
          cpfHash: 'sha256_eleitor_demo_hash_2026',
          cpfMascarado: '***.456.789-**',
          municipio: 'Ananindeua',
          uf: 'PA',
          optInPush: true,
          isAdmin: false,
          createdAt: new Date().toISOString()
        };
        onSuccessLogin(eleitorProfile);
      }
    } catch {
      setLoginError('Erro no acesso rápido demo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginInput.trim()) {
      setLoginError('Por favor, informe seu E-mail ou CPF.');
      return;
    }

    if (!loginInputAnalysis.isValid) {
      setLoginError(loginInputAnalysis.message);
      return;
    }

    if (!senha) {
      setLoginError('Por favor, digite sua senha de acesso.');
      return;
    }

    setIsLoading(true);

    try {
      const isEmail = loginInput.includes('@');
      const isAdmin = isEmail && loginInput.toLowerCase().trim() === 'aplicativoeduca@gmail.com';
      const cleanLogin = loginInput.trim();
      const generatedUid = 'usr_' + btoa(cleanLogin).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16);

      const checkRes = await fetch(`/api/v1/usuarios/${generatedUid}`);
      if (checkRes.ok) {
        const existingProfile = await checkRes.json();
        if (existingProfile.cpfMascarado && existingProfile.municipio && existingProfile.dtNascimento) {
          onSuccessLogin(existingProfile);
          return;
        }
      }

      // If user is new or incomplete, send to Completion of Registration Screen
      if (isEmail) setEmailReg(cleanLogin);
      setNome(isAdmin ? 'Gestor Administrativo' : isEmail ? cleanLogin.split('@')[0] : 'Eleitor Cidadão');
      setAuthMode('conclusao_cadastro');
    } catch {
      setLoginError('Credenciais inválidas ou erro no servidor de autenticação.');
    } finally {
      setIsLoading(false);
    }
  };

  // =========================================================================
  // ACTIONS: ESQUECEU A SENHA
  // =========================================================================

  const handleSolicitarCodigoRecuperacao = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError('');

    if (!recoveryIdentificador.trim()) {
      setRecoveryError('Por favor, informe seu E-mail ou CPF cadastrado.');
      return;
    }

    if (!recoveryInputAnalysis.isValid) {
      setRecoveryError(recoveryInputAnalysis.message);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/v1/usuarios/solicitar-recuperacao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identificador: recoveryIdentificador.trim() })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Falha ao solicitar código.');
      }

      const data = await res.json();
      setRecoveryToken(data.token);
      setRecoveryCodeSimulado(data.codigoSimulado);
      setRecoveryCodeInput(data.codigoSimulado);
      setRecoveryStep(2);
    } catch (err: any) {
      setRecoveryError(err.message || 'Erro ao conectar ao serviço de autenticação.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidarCodigo = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError('');

    if (!recoveryCodeInput.trim()) {
      setRecoveryError('Digite o código de 6 dígitos recebido.');
      return;
    }

    if (recoveryCodeInput.trim() !== recoveryCodeSimulado) {
      setRecoveryError('Código incorreto! Verifique o código exibido.');
      return;
    }

    setRecoveryStep(3);
  };

  const handleRedefinirSenhaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError('');

    if (recoveryNovaSenha.length < 6) {
      setRecoveryError('A nova senha deve possuir pelo menos 6 caracteres.');
      return;
    }

    if (recoveryNovaSenha !== recoveryConfirmaSenha) {
      setRecoveryError('A confirmação não coincide com a nova senha digitada.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/v1/usuarios/redefinir-senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: recoveryToken,
          codigo: recoveryCodeInput.trim(),
          novaSenha: recoveryNovaSenha
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Falha ao redefinir senha.');
      }

      setRecoveryStep(4);
    } catch (err: any) {
      setRecoveryError(err.message || 'Erro ao salvar nova senha.');
    } finally {
      setIsLoading(false);
    }
  };

  // =========================================================================
  // ACTIONS: REGISTRATION & COMPLETION SUBMIT
  // =========================================================================

  const handleCadastroCompleto = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!nome.trim()) {
      setRegError('Nome completo é obrigatório.');
      return;
    }

    if (!emailRegAnalysis.isValid) {
      setRegError('E-mail informado é inválido.');
      return;
    }

    if (!cpfAnalysis.isValid) {
      setRegError('CPF inválido! Os dígitos verificadores não conferem com a Receita Federal.');
      return;
    }

    if (!dtNascimento || (idadeCalculada !== null && idadeCalculada < 16)) {
      setRegError('A idade mínima para participar das pesquisas e simulação é de 16 anos completos.');
      return;
    }

    if (!municipio.trim()) {
      setRegError('Município é obrigatório para amostragem geográfica.');
      return;
    }

    if (!aceiteLgpd) {
      setRegError('É obrigatório confirmar a leitura e concordância com os Termos de Uso e Política de Privacidade.');
      return;
    }

    setIsLoading(true);

    try {
      const generatedUid = googleUserData?.uid || ('usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7));
      const cpfHash = await gerarHashCpf(cpf);
      const cpfMasc = mascararCPF(cpf);
      const isAdmin = emailReg.toLowerCase().trim() === 'aplicativoeduca@gmail.com';

      const payload: UsuarioPerfil = {
        uid: generatedUid,
        nome: nome.trim(),
        email: emailReg.trim(),
        sexo,
        dtNascimento,
        idade: idadeCalculada || 18,
        celular: celular ? mascararCelular(celular) : '(91) 99615-6672',
        cpfHash,
        cpfMascarado: cpfMasc,
        municipio: municipio.trim(),
        uf,
        optInPush,
        isAdmin,
        createdAt: new Date().toISOString()
      };

      const res = await fetch(`/api/v1/usuarios/${generatedUid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Falha ao salvar cadastro.');
      }

      const resData = await res.json();
      onSuccessLogin(resData.perfil || payload);
    } catch (err: any) {
      setRegError(err.message || 'Erro ao processar cadastro cívico.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#081325] text-slate-100 selection:bg-[#0B3D91] selection:text-white relative overflow-x-hidden">
      
      {/* =======================================================
          COLUNA ESQUERDA: HERO / BANNER POLÍTICA EM PAUTA
          OCULTA EM MOBILE E TABLET (hidden lg:flex)
          EXIBIDA APENAS EM DESKTOP (lg:flex lg:w-7/12)
          ======================================================= */}
      <div className="hidden lg:flex relative lg:w-7/12 min-h-screen flex-col justify-between p-10 lg:p-14 overflow-hidden z-10 shrink-0">
        
        {/* Background Image */}
        <img
          src="https://lagosul.com.br/wp-content/uploads/2026/01/capa-politica-em-pauta-01-1.jpg"
          alt="Política em Pauta • Eleições 2026 Plataforma Eu Voto"
          referrerPolicy="no-referrer"
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover object-center scale-105 opacity-40 mix-blend-luminosity pointer-events-none transition-transform duration-1000"
          onError={(e: any) => {
            e.currentTarget.src = '/assets/populacao_caminhando.jpg';
          }}
        />

        {/* Ambient Gradient Overlays */}
        <div className="absolute inset-0 bg-linear-to-b from-[#081325]/85 via-[#081325]/90 to-[#081325] pointer-events-none" />
        <div className="absolute -left-20 -top-20 w-96 h-96 bg-[#0B3D91]/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-10 w-80 h-80 bg-[#16A34A]/25 rounded-full blur-3xl pointer-events-none" />

        {/* Top Bar: Botão Voltar para o Site */}
        <div className="relative z-20">
          <button
            onClick={onVoltarParaSite}
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2.5 rounded-full border border-white/20 backdrop-blur-md transition-all active:scale-95 shadow-md cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para o site</span>
          </button>
        </div>

        {/* Center Content: Headline */}
        <div className="relative z-20 my-auto py-8 max-w-xl">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-black tracking-widest uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Tecnologia Cívica & Pesquisas Eleitorais 2026</span>
            </div>
          </div>

          <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
            Política em Pauta: a voz do eleitor ouvida com precisão, ética e transparência.
          </h1>

          <p className="mt-4 text-sm text-slate-300 font-normal leading-relaxed">
            Plataforma independente de tecnologia cívica. Pesquisas sem viés político ou financeiro, com amostragem probabilística ampla e verificação rigorosa de dados.
          </p>

          {/* Quick Demo Launchers Pill Bar */}
          <div className="mt-8 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Acesso Rápido para Avaliação (Modo Demonstração):</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/40 border border-amber-400/40 text-amber-300 text-xs font-bold transition-all cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Entrar como Administrador Demo</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Trust Badges */}
        <div className="relative z-20 flex flex-wrap items-center gap-3 pt-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-semibold backdrop-blur-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Ambiente Seguro</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-semibold backdrop-blur-xs">
            <Lock className="w-4 h-4 text-blue-400" />
            <span>Validação de CPF & LGPD</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-semibold backdrop-blur-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Resoluções TSE</span>
          </div>
        </div>

      </div>

      {/* =======================================================
          ÁREA DO FORMULÁRIO DE ACESSO À CONTA (MOBILE, TABLET & DESKTOP)
          Em mobile e tablet (< lg), esta é a ÚNICA área exibida!
          ======================================================= */}
      <div className="w-full lg:w-5/12 min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 relative z-20 mx-auto">
        
        {/* Top Mobile/Tablet Back Navigation Header */}
        <div className="lg:hidden w-full max-w-sm sm:max-w-md mb-4 flex items-center justify-between">
          <button
            onClick={onVoltarParaSite}
            className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3.5 py-2 rounded-full border border-white/20 backdrop-blur-md transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao site</span>
          </button>

          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            Eleições 2026
          </span>
        </div>

        {/* Floating White Card */}
        <div className="w-full max-w-sm sm:max-w-md bg-white text-slate-900 rounded-3xl p-5 sm:p-8 shadow-2xl border border-slate-200 relative my-auto">
          
          {/* Brand Logo Header (Aumentado em 30%) */}
          <div className="text-center mb-5">
            <div className="flex justify-center mb-3">
              <img
                src="/logo01.png"
                alt="Plataforma Eu Voto"
                className="h-13 sm:h-14 lg:h-[58px] w-auto object-contain transition-all"
                onError={(e: any) => {
                  e.currentTarget.src = '/logo-icon.svg';
                }}
              />
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {authMode === 'login' && 'Acesse sua Conta'}
              {authMode === 'registro' && 'Cadastro do Eleitor'}
              {authMode === 'recuperar' && 'Recuperação de Senha'}
              {authMode === 'conclusao_cadastro' && 'Conclusão de Cadastro'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {authMode === 'login' && 'Entre com seu CPF ou E-mail e senha de eleitor'}
              {authMode === 'registro' && 'Validação de CPF e amostragem oficial conforme normas do TSE'}
              {authMode === 'recuperar' && 'Redefina seu acesso de forma rápida e segura'}
              {authMode === 'conclusao_cadastro' && 'Preencha seus dados para liberar acesso à Área do Usuário'}
            </p>
          </div>

          {/* Navigation Toggle Tabs (only on login / registro) */}
          {(authMode === 'login' || authMode === 'registro') && (
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl mb-5 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setLoginError('');
                  setRegError('');
                }}
                className={`py-2 rounded-xl transition-all ${
                  authMode === 'login' ? 'bg-white text-[#0B3D91] shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Já sou Cadastrado
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('registro');
                  setLoginError('');
                  setRegError('');
                }}
                className={`py-2 rounded-xl transition-all ${
                  authMode === 'registro' ? 'bg-white text-[#0B3D91] shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Criar Nova Conta
              </button>
            </div>
          )}

          {authMode === 'recuperar' && (
            <div className="mb-5">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setRecoveryStep(1);
                  setRecoveryError('');
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B3D91] hover:underline cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar para a tela de Login</span>
              </button>
            </div>
          )}

          {/* ===================================================
              MODO 1: LOGIN + BOTÃO GOOGLE DIRETA ABAIXO DE ENTRAR
              =================================================== */}
          {authMode === 'login' && (
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              
              {loginError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Input: E-mail ou CPF */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  E-mail ou CPF do Eleitor *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    {loginInputAnalysis.isCpf ? (
                      <CreditCard className="w-4 h-4" />
                    ) : (
                      <Mail className="w-4 h-4" />
                    )}
                  </div>
                  
                  <input
                    id="input-login-identificador"
                    type="text"
                    required
                    value={loginInput}
                    onChange={e => handleLoginInputChange(e.target.value)}
                    placeholder="Digite seu e-mail ou CPF (000.000.000-00)"
                    className={`w-full pl-10 pr-10 py-3 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white transition-colors ${
                      loginInput.trim() === ''
                        ? 'border-slate-200 focus:border-[#0B3D91]'
                        : loginInputAnalysis.isValid
                        ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20'
                        : 'border-amber-400 ring-2 ring-amber-400/20 bg-amber-50/20'
                    }`}
                  />

                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                    {loginInput.trim() !== '' && (
                      loginInputAnalysis.isValid ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 animate-in fade-in" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-500 animate-in fade-in" />
                      )
                    )}
                  </div>
                </div>

                {loginInput.trim() !== '' && (
                  <div
                    className={`mt-1.5 text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
                      loginInputAnalysis.isValid ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        loginInputAnalysis.isValid ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                      }`}
                    />
                    <span>{loginInputAnalysis.message}</span>
                  </div>
                )}
              </div>

              {/* Senha */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Senha de Acesso *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('recuperar');
                      setRecoveryStep(1);
                      setRecoveryIdentificador(loginInput);
                      setRecoveryError('');
                    }}
                    className="text-[11px] text-[#0B3D91] hover:underline font-bold cursor-pointer"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="input-login-senha"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={senha}
                    onChange={e => setSenha(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0B3D91] focus:bg-white transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* BOTÃO 1: Entrar na Plataforma */}
              <button
                id="btn-entrar-submit"
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#081325] hover:bg-[#0B3D91] text-white font-extrabold py-3.5 px-4 rounded-xl text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-2"
              >
                <span>{isLoading ? 'Validando Acesso...' : 'Entrar na Plataforma'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Divisor "Ou acesse com" */}
              <div className="relative my-3.5 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <span className="relative px-3 bg-white text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Ou acesse com
                </span>
              </div>

              {/* BOTÃO 2: BOTÃO DO GOOGLE (INSERIDO DIRETAMENTE ABAIXO DE ENTRAR NA PLATAFORMA) */}
              <button
                id="btn-google-auth"
                type="button"
                disabled={isLoading}
                onClick={handleOpenGoogleModal}
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-700 font-bold py-3 px-4 rounded-xl border border-slate-300 shadow-xs hover:border-slate-400 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-60 text-xs sm:text-sm"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Entrar com o Google</span>
              </button>

              {/* BOTÃO 3: ENTRAR COMO ELEITOR DEMO (INSERIDO LOGO ABAIXO DO GOOGLE COM RESPONSIVIDADE) */}
              <button
                id="btn-eleitor-demo-auth"
                type="button"
                disabled={isLoading}
                onClick={() => handleQuickLogin('eleitor')}
                className="w-full flex items-center justify-center gap-2.5 bg-blue-50/80 hover:bg-blue-100 text-[#0B3D91] font-bold py-3 px-4 rounded-xl border border-blue-200/80 shadow-2xs hover:border-blue-300 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-60 text-xs sm:text-sm mt-2.5"
              >
                <User className="w-4 h-4 text-[#0B3D91] shrink-0" />
                <span>Entrar como Eleitor Demo</span>
              </button>
            </form>
          )}

          {/* ===================================================
              MODO 2: CADASTRO INICIAL
              =================================================== */}
          {authMode === 'registro' && (
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!isRegisterFormValid) return;
              setAuthMode('conclusao_cadastro');
            }} className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
              {regError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{regError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  placeholder="Conforme documento de identificação"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0B3D91]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">E-mail Pessoal *</label>
                <input
                  type="email"
                  required
                  value={emailReg}
                  onChange={e => setEmailReg(e.target.value)}
                  placeholder="seu.email@exemplo.com.br"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0B3D91]"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#0B3D91] hover:bg-[#123F8F] text-white font-extrabold py-3 px-4 rounded-xl text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Prosseguir para Conclusão de Cadastro</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* ===================================================
              MODO 3: TELA DE CONCLUSÃO DE CADASTRO
              (APÓS AUTENTICAÇÃO COM GOOGLE OU CADASTRO COMPLEMENTAR)
              =================================================== */}
          {authMode === 'conclusao_cadastro' && (
            <form onSubmit={handleCadastroCompleto} className="space-y-3.5 max-h-[65vh] overflow-y-auto pr-1">
              
              {/* Google Connection Header Badge */}
              {googleUserData && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center border border-blue-200 shrink-0">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#0B3D91]">
                      <span>Autenticado com o Google</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <div className="text-[11px] text-slate-600 truncate font-semibold">
                      {googleUserData.email}
                    </div>
                  </div>
                </div>
              )}

              {regError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{regError}</span>
                </div>
              )}

              {/* 1. Nome Completo */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  id="input-conclusao-nome"
                  type="text"
                  required
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  placeholder="Conforme documento oficial"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0B3D91]"
                />
              </div>

              {/* 2. Data de Nascimento e 3. Sexo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">Data de Nascimento *</label>
                    {idadeCalculada !== null && (
                      <span className={`text-[10px] font-bold ${idadeCalculada >= 16 ? 'text-emerald-700' : 'text-rose-600'}`}>
                        {idadeCalculada} anos {idadeCalculada < 16 && '(Mín. 16)'}
                      </span>
                    )}
                  </div>
                  <input
                    id="input-conclusao-dtnasc"
                    type="date"
                    required
                    value={dtNascimento}
                    onChange={e => setDtNascimento(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0B3D91]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Sexo *</label>
                  <select
                    id="select-conclusao-sexo"
                    value={sexo}
                    onChange={e => setSexo(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0B3D91]"
                  >
                    <option value="MASCULINO">Masculino</option>
                    <option value="FEMININO">Feminino</option>
                    <option value="OUTRO">Outro</option>
                    <option value="NAO_INFORMADO">Prefiro não informar</option>
                  </select>
                </div>
              </div>

              {/* 4. CPF */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  CPF (com Validação Oficial) *
                </label>
                <div className="relative">
                  <input
                    id="input-conclusao-cpf"
                    type="text"
                    required
                    value={cpf}
                    onChange={e => setCpf(mascararCPF(e.target.value))}
                    maxLength={14}
                    placeholder="000.000.000-00"
                    className={`w-full px-3 py-2.5 bg-slate-50 border rounded-xl text-xs font-mono font-semibold focus:outline-none ${
                      cpf.trim() === ''
                        ? 'border-slate-200 focus:border-[#0B3D91]'
                        : cpfAnalysis.isValid
                        ? 'border-emerald-500 bg-emerald-50/20'
                        : 'border-amber-400 bg-amber-50/20'
                    }`}
                  />
                  <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
                    {cpf.trim() !== '' && (
                      cpfAnalysis.isValid ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                      )
                    )}
                  </div>
                </div>
                {cpf.trim() !== '' && (
                  <div className={`mt-1 text-[10px] font-semibold leading-tight flex items-center gap-1 ${
                    cpfAnalysis.isValid ? 'text-emerald-700' : 'text-amber-700'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cpfAnalysis.isValid ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    <span>{cpfAnalysis.message}</span>
                  </div>
                )}
              </div>

              {/* 5. Estado (UF) e 6. Município */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Estado (UF) *</label>
                  <select
                    id="select-conclusao-uf"
                    value={uf}
                    onChange={e => setUf(e.target.value)}
                    className="w-full px-2.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                  >
                    {UFS.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Município de Votação *</label>
                  <input
                    id="input-conclusao-municipio"
                    type="text"
                    required
                    value={municipio}
                    onChange={e => setMunicipio(e.target.value)}
                    placeholder="Ex: Belém"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0B3D91]"
                  />
                </div>
              </div>

              {/* 7. Confirmação de Leitura e Autorização de Termos de Uso e Política de Privacidade */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <label className="flex items-start gap-2.5 text-[11px] text-slate-700 cursor-pointer">
                  <input
                    id="checkbox-conclusao-lgpd"
                    type="checkbox"
                    required
                    checked={aceiteLgpd}
                    onChange={e => setAceiteLgpd(e.target.checked)}
                    className="mt-0.5 rounded text-[#0B3D91] focus:ring-0 cursor-pointer"
                  />
                  <span>
                    Declaro que li, compreendi e autorizo expressamente os{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveLegalModal('termos');
                      }}
                      className="text-[#0B3D91] font-extrabold hover:underline"
                    >
                      Termos de Uso
                    </button>{' '}
                    e a{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveLegalModal('privacidade');
                      }}
                      className="text-[#0B3D91] font-extrabold hover:underline"
                    >
                      Política de Privacidade
                    </button>
                    , concordando com o tratamento seguro dos meus dados para fins cívico-estatísticos e amostragem eleitoral (LGPD & TSE).
                  </span>
                </label>
              </div>

              {/* Botão de Finalização */}
              <button
                id="btn-concluir-cadastro-submit"
                type="submit"
                disabled={isLoading || !isRegisterFormValid}
                className="w-full bg-[#16A34A] hover:bg-[#15803d] disabled:bg-slate-300 text-white font-extrabold py-3.5 px-4 rounded-xl text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-3"
              >
                <span>{isLoading ? 'Salvando Cadastro...' : 'Concluir Cadastro e Acessar Área do Usuário'}</span>
                <CheckCircle2 className="w-4.5 h-4.5" />
              </button>

              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className="w-full text-center text-xs font-bold text-slate-500 hover:text-slate-800 pt-1"
              >
                Cancelar e voltar ao login
              </button>
            </form>
          )}

          {/* MODO 4: ESQUECEU A SENHA */}
          {authMode === 'recuperar' && (
            <div className="space-y-4">
              {recoveryError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{recoveryError}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] font-black uppercase text-slate-400 border-b border-slate-100 pb-2 mb-3">
                <span className={recoveryStep >= 1 ? 'text-[#0B3D91]' : ''}>1. Identificação</span>
                <span>→</span>
                <span className={recoveryStep >= 2 ? 'text-[#0B3D91]' : ''}>2. Código</span>
                <span>→</span>
                <span className={recoveryStep >= 3 ? 'text-[#0B3D91]' : ''}>3. Nova Senha</span>
              </div>

              {recoveryStep === 1 && (
                <form onSubmit={handleSolicitarCodigoRecuperacao} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      E-mail ou CPF cadastrado *
                    </label>
                    <input
                      type="text"
                      required
                      value={recoveryIdentificador}
                      onChange={e => handleRecoveryInputChange(e.target.value)}
                      placeholder="Digite seu e-mail ou CPF"
                      className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0B3D91]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !recoveryInputAnalysis.isValid}
                    className="w-full bg-[#0B3D91] hover:bg-[#123F8F] disabled:bg-slate-300 text-white font-extrabold py-3 px-4 rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>{isLoading ? 'Enviando...' : 'Enviar Código de Recuperação'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {recoveryStep === 2 && (
                <form onSubmit={handleValidarCodigo} className="space-y-4">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
                    <div>Código enviado para <strong>{recoveryIdentificador}</strong>:</div>
                    <div className="mt-1 font-mono font-black text-center text-base tracking-widest text-[#0B3D91]">
                      {recoveryCodeSimulado}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Digite o Código *
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={recoveryCodeInput}
                      onChange={e => setRecoveryCodeInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      className="w-full py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-center text-base font-mono font-black tracking-widest text-slate-900 focus:outline-none focus:border-[#0B3D91]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#0B3D91] hover:bg-[#123F8F] text-white font-extrabold py-3 px-4 rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Validar Código</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </form>
              )}

              {recoveryStep === 3 && (
                <form onSubmit={handleRedefinirSenhaSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nova Senha *
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={recoveryNovaSenha}
                      onChange={e => setRecoveryNovaSenha(e.target.value)}
                      placeholder="Mínimo de 6 caracteres"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0B3D91]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Confirmar Nova Senha *
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={recoveryConfirmaSenha}
                      onChange={e => setRecoveryConfirmaSenha(e.target.value)}
                      placeholder="Repita a nova senha"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0B3D91]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || recoveryNovaSenha.length < 6 || recoveryNovaSenha !== recoveryConfirmaSenha}
                    className="w-full bg-[#16A34A] hover:bg-[#15803d] disabled:bg-slate-300 text-white font-extrabold py-3 px-4 rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Salvar Nova Senha</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </form>
              )}

              {recoveryStep === 4 && (
                <div className="text-center py-4 space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h3 className="text-base font-black text-slate-900">Senha Redefinida!</h3>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setRecoveryStep(1);
                    }}
                    className="w-full bg-[#081325] text-white font-extrabold py-3 rounded-xl text-xs cursor-pointer"
                  >
                    Ir para o Login
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Footer Status */}
          <div className="mt-5 pt-3.5 border-t border-slate-100 text-center">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-emerald-700 font-bold">Ambiente Criptografado & Auditado</span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400">
              © 2026 Plataforma Eu Voto • Em conformidade com a LGPD e Resoluções TSE.
            </p>
          </div>

        </div>

      </div>

      {/* =======================================================
          MODAL DE CONFIRMAÇÃO DO GOOGLE SIGN-IN
          ======================================================= */}
      {isGoogleAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white text-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 relative space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span className="font-bold text-sm text-slate-800">Fazer login com o Google</span>
              </div>
              <button
                onClick={() => setIsGoogleAuthModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Selecione a conta para continuar na <strong>Plataforma Eu Voto</strong>:
            </p>

            <div className="space-y-2">
              {/* Account 1: Admin Gmail */}
              <button
                type="button"
                onClick={() => handleConfirmGoogleAuth('aplicativoeduca@gmail.com', 'Coordenador Geral Educa')}
                className="w-full flex items-center gap-3 p-3 rounded-2xl border border-slate-200 hover:border-[#0B3D91] hover:bg-blue-50/50 transition-all text-left cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-full bg-[#0B3D91] text-white font-extrabold flex items-center justify-center text-sm shrink-0">
                  A
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900 group-hover:text-[#0B3D91] truncate">
                    Coordenador Geral Educa
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    aplicativoeduca@gmail.com
                  </div>
                </div>
                <span className="text-[10px] font-extrabold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md shrink-0">
                  Admin
                </span>
              </button>

              {/* Account 2: Standard Voter Google */}
              <button
                type="button"
                onClick={() => handleConfirmGoogleAuth('eleitor.cidadao@gmail.com', 'Eleitor Cidadão do Pará')}
                className="w-full flex items-center gap-3 p-3 rounded-2xl border border-slate-200 hover:border-[#0B3D91] hover:bg-blue-50/50 transition-all text-left cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-extrabold flex items-center justify-center text-sm shrink-0">
                  E
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900 group-hover:text-[#0B3D91] truncate">
                    Eleitor Cidadão do Pará
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    eleitor.cidadao@gmail.com
                  </div>
                </div>
                <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md shrink-0">
                  Eleitor
                </span>
              </button>
            </div>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setIsGoogleAuthModalOpen(false)}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================
          MODAL INTERATIVO PARA LEITURA DE TERMOS OU PRIVACIDADE
          ======================================================= */}
      {activeLegalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white text-slate-900 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden relative">
            <div className="p-4 sm:p-5 bg-[#081325] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-sm sm:text-base">
                  {activeLegalModal === 'termos' ? 'Termos de Uso da Plataforma' : 'Política de Privacidade & LGPD'}
                </h3>
              </div>
              <button
                onClick={() => setActiveLegalModal(null)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {activeLegalModal === 'termos' ? (
                <TermosDeUso onVoltar={() => setActiveLegalModal(null)} />
              ) : (
                <PoliticaPrivacidade onVoltar={() => setActiveLegalModal(null)} />
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setActiveLegalModal(null)}
                className="bg-[#0B3D91] hover:bg-[#123F8F] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md cursor-pointer"
              >
                Entendido, Fechar Documento
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
