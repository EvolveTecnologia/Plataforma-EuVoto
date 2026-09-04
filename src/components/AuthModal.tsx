import React, { useState } from 'react';
import { UsuarioPerfil } from '../types';
import { validarCPF, mascararCPF, mascararCelular, gerarHashCpf } from '../utils/cpf';
import { X, CheckSquare, ShieldCheck, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin: (perfil: UsuarioPerfil) => void;
  initialStep?: 'login' | 'complementar';
  partialUser?: Partial<UsuarioPerfil> | null;
}

const UFS = [
  'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN',
  'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO'
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccessLogin,
  initialStep = 'login',
  partialUser = null
}) => {
  const [step, setStep] = useState<'login' | 'complementar'>(initialStep);
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Login form state
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Complementary registration form state
  const [uid, setUid] = useState(partialUser?.uid || '');
  const [nome, setNome] = useState(partialUser?.nome || '');
  const [emailCompl, setEmailCompl] = useState(partialUser?.email || '');
  const [sexo, setSexo] = useState<'MASCULINO' | 'FEMININO' | 'OUTRO' | 'NAO_INFORMADO'>('MASCULINO');
  const [dtNascimento, setDtNascimento] = useState('');
  const [celular, setCelular] = useState('');
  const [cpf, setCpf] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [uf, setUf] = useState('PA');
  const [optInPush, setOptInPush] = useState(true);
  const [aceiteLgpd, setAceiteLgpd] = useState(false);
  const [formError, setFormError] = useState('');

  if (!isOpen) return null;

  // Handler for Social / Google Login
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setLoginError('');

    try {
      // Simulate/Trigger Google Firebase Auth popup
      const googleUser = {
        uid: 'user_google_' + Math.random().toString(36).substring(2, 9),
        nome: 'Eleitor Cidadão',
        email: 'aplicativoeduca@gmail.com', // Recognized Admin per prompt
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      };

      // Check if user already completed the complementary registration
      const checkRes = await fetch(`/api/v1/usuarios/${googleUser.uid}`);
      if (checkRes.ok) {
        const existingProfile: UsuarioPerfil = await checkRes.json();
        onSuccessLogin(existingProfile);
        onClose();
      } else {
        // Must complete mandatory registration step (§5.2)
        setUid(googleUser.uid);
        setNome(googleUser.nome);
        setEmailCompl(googleUser.email);
        setStep('complementar');
      }
    } catch {
      setLoginError('Falha ao autenticar com Google. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for Email/Password Login
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!email || !senha) {
      setLoginError('Informe e-mail e senha.');
      return;
    }

    setIsLoading(true);

    try {
      const generatedUid = 'usr_' + btoa(email).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16);

      const checkRes = await fetch(`/api/v1/usuarios/${generatedUid}`);
      if (checkRes.ok) {
        const existingProfile: UsuarioPerfil = await checkRes.json();
        onSuccessLogin(existingProfile);
        onClose();
      } else {
        // Needs complementary data
        setUid(generatedUid);
        setEmailCompl(email);
        setNome(email.split('@')[0]);
        setStep('complementar');
      }
    } catch {
      setLoginError('Erro ao processar login.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for Mandatory Complementary Registration
  const handleSaveComplementar = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!nome.trim()) {
      setFormError('Informe seu nome completo.');
      return;
    }

    const cpfLimpo = cpf.replace(/\D/g, '');
    if (!validarCPF(cpfLimpo)) {
      setFormError('CPF inválido. Por favor, verifique os dígitos digitados.');
      return;
    }

    const celularLimpo = celular.replace(/\D/g, '');
    if (celularLimpo.length < 10) {
      setFormError('Informe um celular válido com DDD.');
      return;
    }

    if (!dtNascimento) {
      setFormError('Informe sua data de nascimento.');
      return;
    }

    if (!municipio.trim()) {
      setFormError('Informe seu município.');
      return;
    }

    if (!aceiteLgpd) {
      setFormError('É obrigatório aceitar os termos de consentimento e LGPD para prosseguir.');
      return;
    }

    setIsLoading(true);

    try {
      // Calculate age
      const birthDate = new Date(dtNascimento);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }

      // Hash CPF for strict LGPD compliance (§6)
      const cpfHash = await gerarHashCpf(cpfLimpo);
      const cpfMascarado = `***.${cpfLimpo.slice(3, 6)}.${cpfLimpo.slice(6, 9)}-**`;

      const payload = {
        uid,
        nome: nome.trim(),
        email: emailCompl,
        sexo,
        dtNascimento,
        idade: calculatedAge,
        celular,
        cpfHash,
        cpfMascarado,
        municipio: municipio.trim(),
        uf,
        optInPush,
        isAdmin: emailCompl === 'aplicativoeduca@gmail.com'
      };

      const res = await fetch(`/api/v1/usuarios/${uid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('Falha ao gravar perfil');
      }

      const data = await res.json();
      onSuccessLogin(data.perfil);
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Erro ao registrar cadastro complementar.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header with Brand */}
        <div className="bg-linear-to-r from-[#0B3D91] to-[#123F8F] px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <CheckSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold leading-tight">
                {step === 'login' ? 'Acesso ao Eleitor' : 'Cadastro Complementar'}
              </h2>
              <p className="text-xs text-blue-100">
                {step === 'login'
                  ? 'Identificação cívica segura e anônima'
                  : 'Obrigatório para validação da amostragem (LGPD)'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {step === 'login' ? (
            <div>
              {loginError && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleEmailAuth} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">E-mail</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      id="input-login-email"
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="seu.email@exemplo.com"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-[#0B3D91] focus:ring-2 focus:ring-[#0B3D91]/20 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      id="input-login-senha"
                      type="password"
                      required
                      value={senha}
                      onChange={e => setSenha(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-[#0B3D91] focus:ring-2 focus:ring-[#0B3D91]/20 outline-none"
                    />
                  </div>
                </div>

                <button
                  id="btn-submit-auth"
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#0B3D91] hover:bg-[#123F8F] text-white font-bold py-3 rounded-xl shadow-md transition-all active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2 text-sm"
                >
                  <span>{isRegisterMode ? 'Criar Conta' : 'Acessar Plataforma'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="relative my-4 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <span className="relative px-3 bg-white text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  ou acesse com
                </span>
              </div>

              {/* Google Auth Button */}
              <button
                id="btn-login-google"
                type="button"
                disabled={isLoading}
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold py-3 px-4 rounded-xl border border-slate-300 shadow-xs transition-all active:scale-[0.99] disabled:opacity-60 cursor-pointer"
              >
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
                <span>Entrar com o Google</span>
              </button>

              <div className="mt-5 text-center text-xs text-slate-500">
                {isRegisterMode ? 'Já tem uma conta?' : 'Ainda não tem conta?'}{' '}
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(!isRegisterMode)}
                  className="text-[#0B3D91] font-bold hover:underline"
                >
                  {isRegisterMode ? 'Faça login' : 'Cadastre-se'}
                </button>
              </div>

              <div className="mt-4 p-3 bg-blue-50/60 rounded-xl text-xs text-slate-600 border border-blue-100 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#0B3D91] shrink-0 mt-0.5" />
                <span>
                  Admin demonstrativo: utilize o e-mail <strong className="text-[#0B3D91]">aplicativoeduca@gmail.com</strong> para acesso automático às ferramentas de gestão.
                </span>
              </div>
            </div>
          ) : (
            /* STEP 2: MANDATORY COMPLEMENTARY REGISTRATION (§5.2) */
            <form onSubmit={handleSaveComplementar} className="space-y-3.5 max-h-[72vh] overflow-y-auto pr-1">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                <strong>Atenção:</strong> De acordo com os critérios de amostragem estatística e verificação cívica, os dados abaixo são obrigatórios antes de votar. O CPF é criptografado em hash irreversível.
              </div>

              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nome Completo *</label>
                <input
                  id="input-compl-nome"
                  type="text"
                  required
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  placeholder="Nome e Sobrenome"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:border-[#0B3D91] focus:ring-2 focus:ring-[#0B3D91]/20 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">CPF (com validação) *</label>
                  <input
                    id="input-compl-cpf"
                    type="text"
                    required
                    value={cpf}
                    onChange={e => setCpf(mascararCPF(e.target.value))}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:border-[#0B3D91] focus:ring-2 focus:ring-[#0B3D91]/20 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Celular (WhatsApp) *</label>
                  <input
                    id="input-compl-celular"
                    type="text"
                    required
                    value={celular}
                    onChange={e => setCelular(mascararCelular(e.target.value))}
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:border-[#0B3D91] focus:ring-2 focus:ring-[#0B3D91]/20 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sexo *</label>
                  <select
                    id="select-compl-sexo"
                    value={sexo}
                    onChange={e => setSexo(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:border-[#0B3D91] focus:ring-2 focus:ring-[#0B3D91]/20 outline-none bg-white"
                  >
                    <option value="MASCULINO">Masculino</option>
                    <option value="FEMININO">Feminino</option>
                    <option value="OUTRO">Outro</option>
                    <option value="NAO_INFORMADO">Prefiro não informar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Data de Nascimento *</label>
                  <input
                    id="input-compl-dtnasc"
                    type="date"
                    required
                    value={dtNascimento}
                    onChange={e => setDtNascimento(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:border-[#0B3D91] focus:ring-2 focus:ring-[#0B3D91]/20 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Município de Votação *</label>
                  <input
                    id="input-compl-municipio"
                    type="text"
                    required
                    value={municipio}
                    onChange={e => setMunicipio(e.target.value)}
                    placeholder="Ex.: Belém, São Paulo..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:border-[#0B3D91] focus:ring-2 focus:ring-[#0B3D91]/20 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">UF *</label>
                  <select
                    id="select-compl-uf"
                    value={uf}
                    onChange={e => setUf(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:border-[#0B3D91] focus:ring-2 focus:ring-[#0B3D91]/20 outline-none bg-white"
                  >
                    {UFS.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Opt-in Push */}
              <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer pt-1">
                <input
                  id="checkbox-opt-push"
                  type="checkbox"
                  checked={optInPush}
                  onChange={e => setOptInPush(e.target.checked)}
                  className="rounded text-[#0B3D91] focus:ring-[#0B3D91]"
                />
                <span>Desejo receber notificações push quando novas pesquisas forem abertas para {uf}.</span>
              </label>

              {/* Mandatory LGPD Terms Consent (§5.2) */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    id="checkbox-lgpd"
                    type="checkbox"
                    required
                    checked={aceiteLgpd}
                    onChange={e => setAceiteLgpd(e.target.checked)}
                    className="rounded text-[#0B3D91] focus:ring-[#0B3D91] mt-0.5"
                  />
                  <span>
                    Concordo com os <strong>Termos de Uso</strong> e autorizo o tratamento seguro dos meus dados exclusivamente para amostragem demográfica e combate à duplicidade de voto, em total conformidade com a <strong>LGPD (Lei nº 13.709/2018)</strong>. Meu CPF será anonimizado em hash irreversível.
                  </span>
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('login')}
                  className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl text-sm transition-colors"
                >
                  Voltar
                </button>
                <button
                  id="btn-finalizar-cadastro"
                  type="submit"
                  disabled={isLoading}
                  className="w-2/3 bg-[#16A34A] hover:bg-[#15803d] text-white font-bold py-2.5 rounded-xl shadow-md transition-all active:scale-[0.99] disabled:opacity-60 text-sm flex items-center justify-center gap-2"
                >
                  <span>Concluir Cadastro</span>
                  <CheckSquare className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
