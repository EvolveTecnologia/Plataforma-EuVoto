import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  RotateCcw,
  Sparkles,
  ExternalLink,
  UserCheck,
  Megaphone,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  options?: { label: string; action: () => void }[];
  isFinalCard?: boolean;
  finalData?: {
    tipo: 'Eleitor' | 'Candidato';
    nome: string;
    idade?: string;
    numero?: string;
    cargo?: string;
    telefone: string;
    localidade: string;
    assunto: string;
  };
}

type UserRole = 'eleitor' | 'candidato' | null;

type Step =
  | 'choose_role'
  // Eleitor steps
  | 'eleitor_nome'
  | 'eleitor_idade'
  | 'eleitor_telefone'
  | 'eleitor_localidade'
  | 'eleitor_assunto'
  // Candidato steps
  | 'candidato_nome'
  | 'candidato_numero'
  | 'candidato_cargo'
  | 'candidato_telefone'
  | 'candidato_localidade'
  | 'candidato_assunto'
  | 'done';

const WHATSAPP_NUMBER = '5591996156672';
const WHATSAPP_DISPLAY = '(91) 99615-6672';

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [step, setStep] = useState<Step>('choose_role');
  const [role, setRole] = useState<UserRole>(null);

  // Collected data
  const [formData, setFormData] = useState({
    nome: '',
    idade: '',
    numero: '',
    cargo: '',
    telefone: '',
    localidade: '',
    assunto: ''
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen, messages]);

  // Initial welcome message
  const initChat = () => {
    setRole(null);
    setStep('choose_role');
    setFormData({
      nome: '',
      idade: '',
      numero: '',
      cargo: '',
      telefone: '',
      localidade: '',
      assunto: ''
    });

    const welcomeMsg: ChatMessage = {
      id: 'welcome_' + Date.now(),
      sender: 'bot',
      text: 'Olá! Sou o Assistente Cívico da Plataforma Eu Voto 2026. 🗳️\n\nComo posso te ajudar hoje? Para iniciarmos seu atendimento, você é:',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      options: [
        {
          label: '👤 Sou Eleitor / Cidadão',
          action: () => handleSelectRole('eleitor')
        },
        {
          label: '📢 Sou Candidato / Assessoria',
          action: () => handleSelectRole('candidato')
        }
      ]
    };

    setMessages([welcomeMsg]);
  };

  useEffect(() => {
    initChat();
  }, []);

  const handleSelectRole = (selectedRole: 'eleitor' | 'candidato') => {
    setRole(selectedRole);

    const userReply: ChatMessage = {
      id: 'user_' + Date.now(),
      sender: 'user',
      text: selectedRole === 'eleitor' ? 'Sou Eleitor / Cidadão' : 'Sou Candidato / Assessoria',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    if (selectedRole === 'eleitor') {
      setStep('eleitor_nome');
      const botReply: ChatMessage = {
        id: 'bot_' + (Date.now() + 1),
        sender: 'bot',
        text: 'Perfeito! Para personalizarmos seu contato, qual é o seu Nome completo?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, userReply, botReply]);
    } else {
      setStep('candidato_nome');
      const botReply: ChatMessage = {
        id: 'bot_' + (Date.now() + 1),
        sender: 'bot',
        text: 'Olá, candidato(a)! Seja bem-vindo(a). Qual é o seu Nome completo?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, userReply, botReply]);
    }
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: 'user_' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setInputText('');
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);

    processNextStep(text, newMsgs);
  };

  const processNextStep = (text: string, currentMsgs: ChatMessage[]) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // ELEITOR FLOW
    if (step === 'eleitor_nome') {
      const updated = { ...formData, nome: text };
      setFormData(updated);
      setStep('eleitor_idade');
      setMessages([
        ...currentMsgs,
        {
          id: 'bot_' + Date.now(),
          sender: 'bot',
          text: `Muito prazer, ${text.split(' ')[0]}! Qual é a sua Idade?`,
          timestamp: time
        }
      ]);
    } else if (step === 'eleitor_idade') {
      const updated = { ...formData, idade: text };
      setFormData(updated);
      setStep('eleitor_telefone');
      setMessages([
        ...currentMsgs,
        {
          id: 'bot_' + Date.now(),
          sender: 'bot',
          text: 'Qual é o seu Telefone com DDD (de preferência WhatsApp)?',
          timestamp: time
        }
      ]);
    } else if (step === 'eleitor_telefone') {
      const updated = { ...formData, telefone: text };
      setFormData(updated);
      setStep('eleitor_localidade');
      setMessages([
        ...currentMsgs,
        {
          id: 'bot_' + Date.now(),
          sender: 'bot',
          text: 'De qual Estado (UF) e Município você está falando?',
          timestamp: time
        }
      ]);
    } else if (step === 'eleitor_localidade') {
      const updated = { ...formData, localidade: text };
      setFormData(updated);
      setStep('eleitor_assunto');
      setMessages([
        ...currentMsgs,
        {
          id: 'bot_' + Date.now(),
          sender: 'bot',
          text: 'Qual assunto você gostaria de tratar com nossa equipe? (Ex: Dúvida sobre pesquisa, simulação de urna, cadastro, integridade)',
          timestamp: time
        }
      ]);
    } else if (step === 'eleitor_assunto') {
      const finalData = { ...formData, assunto: text };
      setFormData(finalData);
      setStep('done');

      finishAndSendWhatsApp('Eleitor', finalData, currentMsgs);
    }

    // CANDIDATO FLOW
    else if (step === 'candidato_nome') {
      const updated = { ...formData, nome: text };
      setFormData(updated);
      setStep('candidato_numero');
      setMessages([
        ...currentMsgs,
        {
          id: 'bot_' + Date.now(),
          sender: 'bot',
          text: 'Qual é o seu Número de Candidato na urna eletrônica?',
          timestamp: time
        }
      ]);
    } else if (step === 'candidato_numero') {
      const updated = { ...formData, numero: text };
      setFormData(updated);
      setStep('candidato_cargo');
      setMessages([
        ...currentMsgs,
        {
          id: 'bot_' + Date.now(),
          sender: 'bot',
          text: 'Qual é o Cargo pretendido para 2026? (Ex: Presidente, Governador, Senador, Deputado Federal, Deputado Estadual)',
          timestamp: time,
          options: [
            { label: 'Presidente', action: () => handleDirectSelectCargo('Presidente', currentMsgs) },
            { label: 'Governador', action: () => handleDirectSelectCargo('Governador', currentMsgs) },
            { label: 'Senador', action: () => handleDirectSelectCargo('Senador', currentMsgs) },
            { label: 'Deputado Federal', action: () => handleDirectSelectCargo('Deputado Federal', currentMsgs) },
            { label: 'Deputado Estadual', action: () => handleDirectSelectCargo('Deputado Estadual', currentMsgs) }
          ]
        }
      ]);
    } else if (step === 'candidato_cargo') {
      const updated = { ...formData, cargo: text };
      setFormData(updated);
      setStep('candidato_telefone');
      setMessages([
        ...currentMsgs,
        {
          id: 'bot_' + Date.now(),
          sender: 'bot',
          text: 'Qual é o seu Telefone com DDD / WhatsApp para contato direto?',
          timestamp: time
        }
      ]);
    } else if (step === 'candidato_telefone') {
      const updated = { ...formData, telefone: text };
      setFormData(updated);
      setStep('candidato_localidade');
      setMessages([
        ...currentMsgs,
        {
          id: 'bot_' + Date.now(),
          sender: 'bot',
          text: 'De qual Estado (UF) e Município é a sua base eleitoral?',
          timestamp: time
        }
      ]);
    } else if (step === 'candidato_localidade') {
      const updated = { ...formData, localidade: text };
      setFormData(updated);
      setStep('candidato_assunto');
      setMessages([
        ...currentMsgs,
        {
          id: 'bot_' + Date.now(),
          sender: 'bot',
          text: 'Qual assunto você deseja tratar com a coordenação? (Ex: Atualização cadastral TSE, metodologia de pesquisa, fotos, coligações)',
          timestamp: time
        }
      ]);
    } else if (step === 'candidato_assunto') {
      const finalData = { ...formData, assunto: text };
      setFormData(finalData);
      setStep('done');

      finishAndSendWhatsApp('Candidato', finalData, currentMsgs);
    }
  };

  const handleDirectSelectCargo = (cargoName: string, currentMsgs: ChatMessage[]) => {
    const updated = { ...formData, cargo: cargoName };
    setFormData(updated);
    setStep('candidato_telefone');

    const userMsg: ChatMessage = {
      id: 'user_' + Date.now(),
      sender: 'user',
      text: cargoName,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const botMsg: ChatMessage = {
      id: 'bot_' + (Date.now() + 1),
      sender: 'bot',
      text: 'Qual é o seu Telefone com DDD / WhatsApp para contato direto?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...currentMsgs, userMsg, botMsg]);
  };

  const finishAndSendWhatsApp = (
    userType: 'Eleitor' | 'Candidato',
    data: any,
    currentMsgs: ChatMessage[]
  ) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Generate WhatsApp text
    let waText = `*CONTATO VIA PLATAFORMA EU VOTO 2026*\n\n`;
    waText += `*Tipo:* ${userType}\n`;
    waText += `*Nome:* ${data.nome}\n`;
    if (userType === 'Eleitor') {
      waText += `*Idade:* ${data.idade} anos\n`;
    } else {
      waText += `*Número:* ${data.numero}\n`;
      waText += `*Cargo:* ${data.cargo}\n`;
    }
    waText += `*Telefone:* ${data.telefone}\n`;
    waText += `*Localidade:* ${data.localidade}\n`;
    waText += `*Assunto:* ${data.assunto}\n\n`;
    waText += `_Mensagem enviada através do Assistente Cívico da Plataforma Eu Voto._`;

    const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waText)}`;

    const summaryMsg: ChatMessage = {
      id: 'bot_final_' + Date.now(),
      sender: 'bot',
      text: `Excelente, ${data.nome}! Seus dados foram organizados com sucesso.\n\nClique no botão abaixo para enviar sua mensagem diretamente ao WhatsApp da nossa equipe no número ${WHATSAPP_DISPLAY}:`,
      timestamp: time,
      isFinalCard: true,
      finalData: {
        tipo: userType,
        nome: data.nome,
        idade: data.idade,
        numero: data.numero,
        cargo: data.cargo,
        telefone: data.telefone,
        localidade: data.localidade,
        assunto: data.assunto
      }
    };

    setMessages([...currentMsgs, summaryMsg]);

    // Automatically open WhatsApp link after a tiny pause
    setTimeout(() => {
      window.open(waLink, '_blank', 'noopener,noreferrer');
    }, 900);
  };

  const getPlaceholder = () => {
    switch (step) {
      case 'choose_role':
        return 'Escolha uma das opções acima...';
      case 'eleitor_nome':
      case 'candidato_nome':
        return 'Digite seu nome completo...';
      case 'eleitor_idade':
        return 'Digite sua idade (ex: 32)...';
      case 'eleitor_telefone':
      case 'candidato_telefone':
        return 'Digite seu WhatsApp (ex: 91 99615-6672)...';
      case 'eleitor_localidade':
      case 'candidato_localidade':
        return 'Digite Estado (UF) e Município...';
      case 'eleitor_assunto':
      case 'candidato_assunto':
        return 'Digite o assunto ou sua mensagem...';
      case 'candidato_numero':
        return 'Digite o número de urna (ex: 1510)...';
      case 'candidato_cargo':
        return 'Digite o cargo pretendido...';
      default:
        return 'Escreva sua mensagem...';
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      {/* Trigger floating button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 bg-gradient-to-r from-[#0B3D91] to-[#16A34A] hover:from-[#123F8F] hover:to-[#15803d] text-white px-4 sm:px-5 py-3.5 rounded-full shadow-2xl border-2 border-white/20 transition-all cursor-pointer group"
          title="Fale com nosso assistente virtual no WhatsApp"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5 transition-transform group-hover:rotate-6" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-[#0B3D91] animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-[#0B3D91]" />
          </div>
          <span className="text-xs sm:text-sm font-extrabold tracking-wide">
            Assistente Eu Voto
          </span>
        </motion.button>
      )}

      {/* Floating Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-[92vw] sm:w-[390px] h-[540px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#081325] via-[#0B3D91] to-[#16A34A] text-white p-4 shrink-0 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-emerald-300 ring-1 ring-white/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black leading-tight">Assistente Eu Voto</h3>
                  <p className="text-[11px] text-emerald-200 font-medium">Eleitor ou Candidato 2026</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={initChat}
                  title="Reiniciar conversa"
                  className="p-1.5 rounded-xl hover:bg-white/15 text-white/80 hover:text-white transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Fechar assistente"
                  className="p-1.5 rounded-xl hover:bg-white/15 text-white/80 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Direct WhatsApp Sub-header */}
            <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
                <span>WhatsApp Direto: <strong>{WHATSAPP_DISPLAY}</strong></span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                Online
              </span>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F8FAFC]">
              {messages.map((msg) => {
                const isBot = msg.sender === 'bot';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                        isBot
                          ? 'bg-white text-slate-800 border border-slate-200 shadow-xs'
                          : 'bg-[#0B3D91] text-white shadow-xs font-medium'
                      }`}
                    >
                      <p className="whitespace-pre-line">{msg.text}</p>

                      {/* Option Buttons */}
                      {msg.options && msg.options.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-slate-100 flex flex-col gap-1.5">
                          {msg.options.map((opt, idx) => (
                            <button
                              key={idx}
                              onClick={opt.action}
                              className="text-left text-xs font-bold px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0B3D91] transition-colors border border-blue-200 cursor-pointer flex items-center justify-between"
                            >
                              <span>{opt.label}</span>
                              <Sparkles className="w-3 h-3 text-[#16A34A]" />
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Final Card Summary */}
                      {msg.isFinalCard && msg.finalData && (
                        <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-[11px] text-slate-700">
                          <div className="font-extrabold text-slate-900 pb-1 border-b border-slate-200 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                            <span>Resumo do Atendimento</span>
                          </div>
                          <div><strong>Tipo:</strong> {msg.finalData.tipo}</div>
                          <div><strong>Nome:</strong> {msg.finalData.nome}</div>
                          {msg.finalData.idade && <div><strong>Idade:</strong> {msg.finalData.idade} anos</div>}
                          {msg.finalData.numero && <div><strong>Número Urna:</strong> {msg.finalData.numero}</div>}
                          {msg.finalData.cargo && <div><strong>Cargo:</strong> {msg.finalData.cargo}</div>}
                          <div><strong>Telefone:</strong> {msg.finalData.telefone}</div>
                          <div><strong>Localidade:</strong> {msg.finalData.localidade}</div>
                          <div><strong>Assunto:</strong> {msg.finalData.assunto}</div>

                          <a
                            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                              `*CONTATO VIA PLATAFORMA EU VOTO 2026*\n\n` +
                              `*Tipo:* ${msg.finalData.tipo}\n` +
                              `*Nome:* ${msg.finalData.nome}\n` +
                              (msg.finalData.tipo === 'Eleitor'
                                ? `*Idade:* ${msg.finalData.idade}\n`
                                : `*Número:* ${msg.finalData.numero}\n*Cargo:* ${msg.finalData.cargo}\n`) +
                              `*Telefone:* ${msg.finalData.telefone}\n` +
                              `*Local:* ${msg.finalData.localidade}\n` +
                              `*Assunto:* ${msg.finalData.assunto}`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2.5 w-full bg-[#16A34A] hover:bg-[#15803d] text-white py-2 px-3 rounded-xl font-black text-center text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                          >
                            <span>Abrir Conversa no WhatsApp</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      )}
                    </div>

                    <span className="text-[9px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={getPlaceholder()}
                disabled={step === 'done'}
                className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || step === 'done'}
                className="p-2.5 bg-[#0B3D91] hover:bg-[#123F8F] disabled:opacity-40 text-white rounded-xl transition-all active:scale-95 cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
