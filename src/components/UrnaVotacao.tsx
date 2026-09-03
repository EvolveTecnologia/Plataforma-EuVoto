import React, { useState, useEffect } from 'react';
import { Candidato, Pesquisa, UsuarioPerfil } from '../types';
import { urnaAudio } from '../utils/audio';
import confetti from 'canvas-confetti';
import { Shield, AlertTriangle, CheckCircle2, RotateCcw, Award, RotateCw, Smartphone, Maximize2, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

interface UrnaVotacaoProps {
  pesquisa: Pesquisa;
  user: UsuarioPerfil | null;
  ufEleitor: string;
  onVotoConcluido: () => void;
  onCancelar: () => void;
  onOpenAuth: () => void;
}

interface CargoConfig {
  id: string;
  nome: string;
  cargoCd: number;
  digitos: number;
  tipoVaga?: 'majoritaria' | 'proporcional';
}

export const UrnaVotacao: React.FC<UrnaVotacaoProps> = ({
  pesquisa,
  user,
  ufEleitor,
  onVotoConcluido,
  onCancelar,
  onOpenAuth
}) => {
  // Lista oficial e ordem de cargos do TSE (§5.4)
  const cargosOrdem: CargoConfig[] = [
    { id: 'deputadoFederal', nome: 'DEPUTADO FEDERAL', cargoCd: 6, digitos: 4, tipoVaga: 'proporcional' },
    { id: 'deputadoEstadual', nome: ufEleitor === 'DF' ? 'DEPUTADO DISTRITAL' : 'DEPUTADO ESTADUAL', cargoCd: 7, digitos: 5, tipoVaga: 'proporcional' },
    { id: 'senador1', nome: 'SENADOR — 1ª VAGA', cargoCd: 5, digitos: 3, tipoVaga: 'majoritaria' },
    { id: 'senador2', nome: 'SENADOR — 2ª VAGA', cargoCd: 5, digitos: 3, tipoVaga: 'majoritaria' },
    { id: 'governador', nome: 'GOVERNADOR', cargoCd: 3, digitos: 2, tipoVaga: 'majoritaria' },
    { id: 'presidente', nome: 'PRESIDENTE DA REPÚBLICA', cargoCd: 1, digitos: 2, tipoVaga: 'majoritaria' }
  ];

  const [cargoIndex, setCargoIndex] = useState(0);
  const cargoAtual = cargosOrdem[cargoIndex];

  // Estado da digitação
  const [digitosDigitados, setDigitosDigitados] = useState<string[]>([]);
  const [isBranco, setIsBranco] = useState(false);
  const [candidatoConsultado, setCandidatoConsultado] = useState<Candidato | null>(null);
  const [isNumeroInexistente, setIsNumeroInexistente] = useState(false);
  const [isCarregandoCandidato, setIsCarregandoCandidato] = useState(false);
  const [erroAlerta, setErroAlerta] = useState<string | null>(null);

  // Registro de escolhas por cargo
  const [votosRegistrados, setVotosRegistrados] = useState<Record<string, any>>({});

  // Tela final "FIM"
  const [isFim, setIsFim] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [erroSubmissao, setErroSubmissao] = useState<string | null>(null);
  const [comprovanteCodigo, setComprovanteCodigo] = useState<string | null>(null);

  // Auto-ajuste e rotação para melhor visualização
  const [isGirarModo, setIsGirarModo] = useState(false);

  useEffect(() => {
    // Tenta solicitar orientação horizontal para encaixar o visor e teclado
    const tentarRotacionar = async () => {
      try {
        if ('screen' in window && (screen.orientation as any)?.lock) {
          await (screen.orientation as any).lock('landscape');
        }
      } catch {}
    };

    tentarRotacionar();

    // Em telas mobile ou tablet (<1024px), ativa automaticamente o layout panorâmico horizontal
    if (window.innerWidth < 1024) {
      setIsGirarModo(true);
    }

    // Ao sair da cabine, a orientação volta automaticamente ao normal
    return () => {
      try {
        if ('screen' in window && (screen.orientation as any)?.unlock) {
          (screen.orientation as any).unlock();
        }
      } catch {}
    };
  }, []);

  // Verificação inicial se eleitor já votou nesta pesquisa (Regra 1 voto por CPF)
  useEffect(() => {
    if (user) {
      fetch(`/api/v1/pesquisas/${pesquisa.id}/status-voto/${user.uid}`)
        .then(res => res.json())
        .then(data => {
          if (data.jaVotou) {
            setErroSubmissao('Atenção: Identificamos que seu CPF já registrou um voto nesta pesquisa. Conforme a regra cívica oficial, é permitido apenas 1 voto por CPF.');
          }
        })
        .catch(() => {});
    }
  }, [user, pesquisa.id]);

  const handleSairCabine = () => {
    try {
      if ('screen' in window && (screen.orientation as any)?.unlock) {
        (screen.orientation as any).unlock();
      }
    } catch {}
    onCancelar();
  };

  const handleConcluirVoto = () => {
    try {
      if ('screen' in window && (screen.orientation as any)?.unlock) {
        (screen.orientation as any).unlock();
      }
    } catch {}
    onVotoConcluido();
  };

  const targetUf = cargoAtual.cargoCd === 1 ? 'BR' : ufEleitor;

  // Consulta à API quando os dígitos são completados
  useEffect(() => {
    if (isBranco) {
      setCandidatoConsultado(null);
      setIsNumeroInexistente(false);
      setErroAlerta(null);
      return;
    }

    const numeroCompleto = digitosDigitados.join('');
    if (numeroCompleto.length === cargoAtual.digitos) {
      // Validação especial: Senador 2ª vaga não pode repetir candidato da 1ª vaga! (§5.4)
      if (cargoAtual.id === 'senador2') {
        const voto1 = votosRegistrados.senador1;
        if (voto1 && voto1.tipo === 'CANDIDATO' && voto1.numero === numeroCompleto) {
          urnaAudio.tocarAlertaInexistente();
          setErroAlerta('REPETIÇÃO PROIBIDA: Você não pode votar no mesmo candidato para ambas as vagas do Senado!');
          setIsNumeroInexistente(true);
          setCandidatoConsultado(null);
          return;
        }
      }

      consultarCandidatoNaApi(numeroCompleto);
    } else {
      setCandidatoConsultado(null);
      setIsNumeroInexistente(false);
      setErroAlerta(null);
    }
  }, [digitosDigitados, isBranco, cargoIndex]);

  const consultarCandidatoNaApi = async (numero: string) => {
    setIsCarregandoCandidato(true);
    setErroAlerta(null);

    try {
      const res = await fetch(
        `/api/v1/candidatos?ano=2026&uf=${targetUf}&cargo=${cargoAtual.cargoCd}&numero=${numero}`
      );

      if (res.ok) {
        const data = await res.json();
        setCandidatoConsultado(data);
        setIsNumeroInexistente(false);
      } else {
        // T5: Número inexistente -> voto será nulo
        urnaAudio.tocarAlertaInexistente();
        setCandidatoConsultado(null);
        setIsNumeroInexistente(true);
      }
    } catch {
      setIsNumeroInexistente(true);
    } finally {
      setIsCarregandoCandidato(false);
    }
  };

  // Teclado numérico
  const handlePressionarNumero = (digito: number) => {
    if (isFim || isSubmitting) return;
    urnaAudio.tocarBeepTecla();

    if (isBranco) {
      setIsBranco(false);
      setDigitosDigitados([digito.toString()]);
      return;
    }

    if (digitosDigitados.length < cargoAtual.digitos) {
      setDigitosDigitados(prev => [...prev, digito.toString()]);
    }
  };

  // Tecla BRANCO
  const handleBranco = () => {
    if (isFim || isSubmitting) return;
    urnaAudio.tocarBeepTecla();
    if (digitosDigitados.length === 0) {
      setIsBranco(true);
      setErroAlerta(null);
      setIsNumeroInexistente(false);
    }
  };

  // Tecla CORRIGE
  const handleCorrige = () => {
    if (isFim || isSubmitting) return;
    urnaAudio.tocarBeepTecla();
    setDigitosDigitados([]);
    setIsBranco(false);
    setCandidatoConsultado(null);
    setIsNumeroInexistente(false);
    setErroAlerta(null);
  };

  // Tecla CONFIRMA
  const handleConfirma = async () => {
    if (isFim || isSubmitting) return;
    urnaAudio.tocarBeepTecla();

    // Requer login do eleitor para gravar o voto
    if (!user) {
      onOpenAuth();
      return;
    }

    const numeroCompleto = digitosDigitados.join('');
    const digitosCompletos = numeroCompleto.length === cargoAtual.digitos;

    if (!isBranco && !digitosCompletos) {
      setErroAlerta(`Complete todos os ${cargoAtual.digitos} dígitos do cargo antes de confirmar.`);
      urnaAudio.tocarAlertaInexistente();
      return;
    }

    // Se estiver no senador 2 e tentar confirmar candidato repetido
    if (cargoAtual.id === 'senador2' && erroAlerta?.includes('REPETIÇÃO PROIBIDA')) {
      urnaAudio.tocarAlertaInexistente();
      return;
    }

    // Registrar o voto do cargo atual
    const votoCargo = isBranco
      ? { tipo: 'BRANCO', numero: 'BRANCO', cargo: cargoAtual.nome }
      : isNumeroInexistente
      ? { tipo: 'NULO', numero: 'NULO', cargo: cargoAtual.nome }
      : {
          tipo: 'CANDIDATO',
          numero: numeroCompleto,
          nomeUrna: candidatoConsultado?.nomeUrna || '',
          sigla: candidatoConsultado?.sigla || '',
          cargo: cargoAtual.nome
        };

    const novosVotos = {
      ...votosRegistrados,
      [cargoAtual.id]: votoCargo
    };
    setVotosRegistrados(novosVotos);

    // Se for o último cargo (Presidente) -> Finaliza a cédula oficial
    if (cargoIndex === cargosOrdem.length - 1) {
      await finalizarVotacao(novosVotos);
    } else {
      // Avança para o próximo cargo
      setCargoIndex(prev => prev + 1);
      setDigitosDigitados([]);
      setIsBranco(false);
      setCandidatoConsultado(null);
      setIsNumeroInexistente(false);
      setErroAlerta(null);
    }
  };

  // Grava a cédula completa na API e dispara áudio e confetes
  const finalizarVotacao = async (cedulaFinal: Record<string, any>) => {
    if (!user) return;
    setIsSubmitting(true);
    setErroSubmissao(null);

    try {
      const payload = {
        pesquisaId: pesquisa.id,
        uid: user.uid,
        uf: ufEleitor,
        municipio: user.municipio,
        cargos: cedulaFinal
      };

      const res = await fetch('/api/v1/votos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        // T6: Erro de voto já existente
        setErroSubmissao(errData.mensagem || 'Você já votou nesta pesquisa.');
        urnaAudio.tocarAlertaInexistente();
        setIsSubmitting(false);
        return;
      }

      // Som oficial e inconfundível da Urna Eletrônica!
      urnaAudio.tocarSomConfirmacaoUrna();

      // Dispara chuva de confetes
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });

      setComprovanteCodigo(`EUVOTO-${Math.random().toString(36).substring(2, 10).toUpperCase()}`);
      setIsFim(true);
    } catch {
      setErroSubmissao('Erro de conexão ao enviar o voto. Verifique sua rede e tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      {/* Top Breadcrumb & Information */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#0B3D91] text-white text-xs font-black px-2.5 py-0.5 rounded-sm tracking-wider uppercase">
              Urna Oficial TSE Simulação
            </span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-sm">
              Eleições Gerais 2026
            </span>
          </div>
          <h1 className="text-xl font-black text-slate-900 mt-1">{pesquisa.titulo}</h1>
          <p className="text-xs text-slate-500">
            Eleitor: <strong className="text-slate-800">{user ? user.nome : 'Visitante (Identifique-se ao confirmar)'}</strong> • UF de Votação: <strong className="text-[#0B3D91]">{ufEleitor}</strong>
          </p>
        </div>

        <button
          onClick={handleSairCabine}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
          title="Voltar para a tela anterior de pesquisas"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar à Pesquisa</span>
        </button>
      </div>

      {/* T6 Alert if Double Vote Attempt */}
      {erroSubmissao && (
        <div className="mb-6 p-4 bg-rose-50 border-2 border-rose-300 rounded-xl text-rose-800 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-sm">Bloqueio de Integridade Eleitoral</div>
            <p className="text-xs mt-0.5">{erroSubmissao}</p>
          </div>
        </div>
      )}

      {/* Mobile/Tablet Smart Rotation and Adjustment Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 mb-5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-[#0B3D91]">
        <div className="flex items-center gap-2 font-semibold">
          <Smartphone className="w-4 h-4 text-[#0B3D91]" />
          <span>Ajuste de Tela: A cabine da urna se calibra e gira para a melhor proporção de voto.</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsGirarModo(!isGirarModo)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-blue-100 border border-blue-300 rounded-lg font-extrabold text-xs shadow-2xs transition-all cursor-pointer text-[#0B3D91]"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>{isGirarModo ? 'Modo Vertical' : 'Modo Panorâmico (Girar)'}</span>
          </button>
        </div>
      </div>

      {/* Urna Chassis Structure with Entrance Rotation & Responsiveness */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, rotate: -3 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className={`bg-[#D1D5DB] p-4 sm:p-7 rounded-2xl shadow-2xl border-4 border-[#9CA3AF] grid grid-cols-1 ${
          isGirarModo ? 'md:grid-cols-12' : 'lg:grid-cols-12'
        } gap-6 transition-all duration-300`}
      >
        
        {/* =======================================================
            VISOR DA URNA ELETRÔNICA (TELA LCD DA JUSTIÇA ELEITORAL)
            ======================================================= */}
        <div className={`${isGirarModo ? 'md:col-span-7' : 'lg:col-span-7'} bg-[#EDF3F0] rounded-xl border-4 border-[#4B5563] shadow-inner p-5 sm:p-6 flex flex-col justify-between min-h-[460px]`}>
          
          {isFim ? (
            /* TELA "FIM" DA URNA COM ANIMAÇÃO E COMPROVANTE */
            <div className="h-full flex flex-col items-center justify-center text-center my-auto py-10">
              <div className="text-7xl font-black tracking-widest text-[#111827] font-mono mb-4 animate-pulse">
                FIM
              </div>
              <div className="flex items-center gap-2 text-emerald-700 bg-emerald-100/80 px-4 py-2 rounded-full font-bold text-sm mb-4">
                <CheckCircle2 className="w-5 h-5" />
                <span>Seu voto foi computado, obrigado pela votação.</span>
              </div>
              <div className="bg-white/80 p-4 rounded-xl border border-slate-300 max-w-sm w-full text-xs text-slate-700 mb-6 shadow-xs">
                <div className="flex items-center justify-center gap-1.5 font-bold text-[#0B3D91] mb-1">
                  <Award className="w-4 h-4" />
                  <span>Comprovante Cívico de Votação</span>
                </div>
                <div className="font-mono text-slate-900 font-bold tracking-wider">{comprovanteCodigo}</div>
                <div className="text-[11px] text-slate-500 mt-1">Data: {new Date().toLocaleString('pt-BR')}</div>
              </div>
              <button
                id="btn-urna-concluir"
                onClick={handleConcluirVoto}
                className="bg-[#0B3D91] hover:bg-[#123F8F] text-white font-extrabold px-6 py-3 rounded-xl shadow-lg text-sm transition-all cursor-pointer"
              >
                Voltar à Área Principal
              </button>
            </div>
          ) : (
            <>
              {/* Top: Cargo Header */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-600 mb-1">
                  <span>JUSTIÇA ELEITORAL</span>
                  <span>{cargoIndex + 1} de {cargosOrdem.length}</span>
                </div>
                <div className="text-xs uppercase font-extrabold text-slate-700 tracking-wider">
                  SEU VOTO PARA
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                  {cargoAtual.nome}
                </div>

                {/* Aviso especial de vaga de senador */}
                {cargoAtual.id === 'senador2' && (
                  <div className="text-[11px] text-amber-800 font-semibold bg-amber-100/60 px-2 py-0.5 rounded-sm mt-1">
                    Atenção: A 2ª vaga requer candidato diferente da 1ª vaga escolhida.
                  </div>
                )}
              </div>

              {/* Middle: Digits Display / Candidate details or Blank/Null */}
              <div className="my-4">
                {isBranco ? (
                  <div className="py-10 text-center">
                    <div className="text-3xl font-black text-slate-800 tracking-widest animate-pulse">
                      VOTO EM BRANCO
                    </div>
                  </div>
                ) : (
                  <div>
                    {/* Number input boxes */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xs font-bold text-slate-600">Número:</span>
                      <div className="flex items-center gap-1.5 font-mono">
                        {Array.from({ length: cargoAtual.digitos }).map((_, i) => {
                          const val = digitosDigitados[i] || '';
                          const isCurrent = i === digitosDigitados.length;
                          return (
                            <div
                              key={i}
                              className={`w-9 h-11 border-2 flex items-center justify-center text-2xl font-black bg-white ${
                                isCurrent
                                  ? 'border-[#0B3D91] ring-2 ring-[#0B3D91]/40 animate-pulse'
                                  : 'border-slate-400'
                              } text-slate-900`}
                            >
                              {val}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Feedback area */}
                    {isCarregandoCandidato && (
                      <div className="text-xs font-semibold text-slate-500 animate-pulse">
                        Consultando sistema oficial do TSE...
                      </div>
                    )}

                    {erroAlerta && (
                      <div className="p-2.5 bg-rose-100 border border-rose-300 text-rose-800 text-xs font-bold rounded-lg mb-3">
                        {erroAlerta}
                      </div>
                    )}

                    {isNumeroInexistente && (
                      <div className="p-3 bg-amber-100 border-2 border-amber-400 text-amber-900 rounded-lg">
                        <div className="font-black text-sm tracking-wide">NÚMERO INEXISTENTE</div>
                        <div className="text-xs font-bold mt-1 text-rose-700 animate-pulse">
                          VOTO SERÁ COMPUTADO COMO NULO
                        </div>
                      </div>
                    )}

                    {candidatoConsultado && (
                      <div className="flex items-start gap-4 p-3 bg-white/90 rounded-xl border border-slate-300 shadow-xs">
                        <img
                          src={candidatoConsultado.fotoUrl}
                          alt={candidatoConsultado.nomeUrna}
                          className="w-24 h-32 object-cover rounded-lg border-2 border-slate-400 bg-slate-200 shrink-0"
                          onError={(e: any) => {
                            e.target.src = '/fotos/default-avatar.svg';
                          }}
                        />
                        <div className="space-y-1 text-xs">
                          <div>
                            <span className="font-bold text-slate-500 text-[10px] uppercase">Nome de Urna:</span>
                            <div className="text-base font-black text-slate-900">{candidatoConsultado.nomeUrna}</div>
                          </div>
                          <div>
                            <span className="font-bold text-slate-500 text-[10px] uppercase">Partido / Coligação:</span>
                            <div className="font-bold text-slate-800">
                              {candidatoConsultado.sigla} — {candidatoConsultado.partido}
                            </div>
                          </div>

                          {/* Vice ou Suplentes (§5.4) */}
                          {candidatoConsultado.vice && (
                            <div className="pt-2 border-t border-slate-200 mt-2 flex items-center gap-2.5">
                              {candidatoConsultado.vice.fotoUrl && (
                                <img
                                  src={candidatoConsultado.vice.fotoUrl}
                                  alt={candidatoConsultado.vice.nomeUrna}
                                  className="w-12 h-16 object-cover rounded-md border border-slate-300 bg-slate-100 shrink-0 shadow-2xs"
                                  onError={(e: any) => {
                                    e.target.src = '/fotos/default-avatar.svg';
                                  }}
                                />
                              )}
                              <div className="space-y-0.5">
                                <span className="font-bold text-slate-500 text-[10px] uppercase tracking-wider block">
                                  {candidatoConsultado.vice.cargo || 'Vice da Chapa'}:
                                </span>
                                <div className="font-black text-slate-900 text-xs">
                                  {candidatoConsultado.vice.nomeUrna} ({candidatoConsultado.vice.sigla})
                                </div>
                                {candidatoConsultado.vice.nomeCompleto && (
                                  <div className="text-[10px] text-slate-500 line-clamp-1">
                                    {candidatoConsultado.vice.nomeCompleto}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {candidatoConsultado.suplentes && candidatoConsultado.suplentes.length > 0 && (
                            <div className="pt-1 border-t border-slate-200 mt-1 text-[11px]">
                              <span className="font-bold text-slate-500 uppercase">Suplentes: </span>
                              <span className="font-semibold text-slate-700">
                                1º {candidatoConsultado.suplentes[0]?.nomeUrna}
                                {candidatoConsultado.suplentes[1] ? ` • 2º ${candidatoConsultado.suplentes[1].nomeUrna}` : ''}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom: Instructions */}
              <div className="pt-3 border-t-2 border-slate-400 text-[11px] text-slate-600">
                <div className="font-bold mb-0.5">Aperte a tecla:</div>
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  <span><strong>CONFIRMA</strong> para GRAVAR este voto</span>
                  <span><strong>CORRIGE</strong> para REINICIAR este voto</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* =======================================================
            TECLADO FÍSICO DA URNA ELETRÔNICA DO BRASIL
            ======================================================= */}
        <div className={`${isGirarModo ? 'md:col-span-5' : 'lg:col-span-5'} bg-[#1F2937] p-5 sm:p-6 rounded-xl border-4 border-[#111827] flex flex-col justify-between shadow-2xl`}>
          
          {/* Brand header on keyboard */}
          <div className="text-center pb-3 mb-2 border-b border-gray-700">
            <div className="flex items-center justify-center gap-2 text-white font-extrabold text-sm tracking-wider">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>JUSTIÇA ELEITORAL</span>
            </div>
            <div className="text-[10px] text-gray-400">Terminal do Eleitor • Criptografia Segura</div>
          </div>

          {/* 3x4 Numeric Keypad */}
          <div className="grid grid-cols-3 gap-3 my-auto max-w-[260px] mx-auto w-full">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <button
                key={num}
                id={`btn-urna-num-${num}`}
                onClick={() => handlePressionarNumero(num)}
                className="h-14 bg-[#111827] hover:bg-[#374151] active:bg-[#4B5563] text-white text-2xl font-black rounded-lg border-b-4 border-black shadow-md transition-all active:translate-y-1 select-none flex items-center justify-center"
              >
                {num}
              </button>
            ))}
            
            {/* 0 Key centered */}
            <div className="col-start-2">
              <button
                id="btn-urna-num-0"
                onClick={() => handlePressionarNumero(0)}
                className="w-full h-14 bg-[#111827] hover:bg-[#374151] active:bg-[#4B5563] text-white text-2xl font-black rounded-lg border-b-4 border-black shadow-md transition-all active:translate-y-1 select-none flex items-center justify-center"
              >
                0
              </button>
            </div>
          </div>

          {/* Action Keys (BRANCO, CORRIGE, CONFIRMA) */}
          <div className="grid grid-cols-3 gap-2.5 pt-6 mt-4 border-t border-gray-700 items-end">
            <button
              id="btn-urna-branco"
              onClick={handleBranco}
              className="h-12 bg-[#F3F4F6] hover:bg-white active:bg-gray-200 text-[#111827] text-xs font-black uppercase rounded-lg border-b-4 border-gray-400 shadow-md transition-all active:translate-y-0.5 select-none"
            >
              BRANCO
            </button>

            <button
              id="btn-urna-corrige"
              onClick={handleCorrige}
              className="h-12 bg-[#F97316] hover:bg-[#FB923C] active:bg-[#EA580C] text-white text-xs font-black uppercase rounded-lg border-b-4 border-[#C2410C] shadow-md transition-all active:translate-y-0.5 select-none"
            >
              CORRIGE
            </button>

            <button
              id="btn-urna-confirma"
              disabled={isSubmitting}
              onClick={handleConfirma}
              className="h-16 bg-[#16A34A] hover:bg-[#22C55E] active:bg-[#15803D] text-white text-xs font-black uppercase rounded-lg border-b-4 border-[#14532D] shadow-lg transition-all active:translate-y-0.5 select-none disabled:opacity-50"
            >
              CONFIRMA
            </button>
          </div>

        </div>

      </motion.div>
    </div>
  );
};
