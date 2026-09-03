import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  User,
  Vote,
  Briefcase,
  CheckCircle2,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  options?: string[];
  field?: 'perfil' | 'nome' | 'email' | 'telefone' | 'uf' | 'mensagem';
}

const UFS_LIST = [
  'PA', 'SP', 'RJ', 'MG', 'BA', 'DF', 'CE', 'PE', 'PR', 'RS',
  'SC', 'GO', 'MA', 'AM', 'ES', 'PB', 'RN', 'MT', 'AL', 'PI',
  'MS', 'SE', 'RO', 'TO', 'AC', 'AP', 'RR'
];

export const ChatbotLead: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [step, setStep] = useState<
    'perfil' | 'nome' | 'email' | 'telefone' | 'uf' | 'mensagem' | 'concluido'
  >('perfil');

  // Lead Collected Data
  const [leadData, setLeadData] = useState<{
    perfil: string;
    nome: string;
    email: string;
    telefone: string;
    uf: string;
    mensagem: string;
  }>({
    perfil: '',
    nome: '',
    email: '',
    telefone: '',
    uf: 'PA',
    mensagem: ''
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize greeting on first open or mount
  useEffect(() => {
    if (messages.length === 0) {
      resetChat();
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const resetChat = () => {
    setStep('perfil');
    setLeadData({
      perfil: '',
      nome: '',
      email: '',
      telefone: '',
      uf: 'PA',
      mensagem: ''
    });
    setMessages([
      {
        id: 'msg-1',
        sender: 'bot',
        text: 'Olá! Sou o Assistente Cívico da Plataforma Eu Voto 2026. 🗳️\n\nComo posso te ajudar hoje? Para iniciarmos, você é:',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        options: ['Eleitor / Cidadão', 'Candidato / Parceiro de Campanha'],
        field: 'perfil'
      }
    ]);
  };

  const addBotMessage = (text: string, options?: string[], field?: any) => {
    setMessages(prev => [
      ...prev,
      {
        id: 'msg-' + Date.now(),
        sender: 'bot',
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        options,
        field
      }
    ]);
  };

  const handleSelectOption = (option: string) => {
    // Add user response
    setMessages(prev => [
      ...prev,
      {
        id: 'user-' + Date.now(),
        sender: 'user',
        text: option,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    if (step === 'perfil') {
      const isCand = option.includes('Candidato');
      setLeadData(prev => ({ ...prev, perfil: option }));
      setStep('nome');
      setTimeout(() => {
        addBotMessage(
          isCand
            ? 'Excelente! Preparamos levantamentos e inteligência de dados exclusiva para campanhas.\n\nPor favor, qual é o seu Nome Completo?'
            : 'Perfeito! É uma honra contar com sua participação cívica.\n\nQual é o seu Nome Completo?',
          undefined,
          'nome'
        );
      }, 400);
    } else if (step === 'uf') {
      setLeadData(prev => ({ ...prev, uf: option }));
      setStep('mensagem');
      setTimeout(() => {
        addBotMessage(
          'Ótimo! Para finalizarmos, gostaria de deixar alguma dúvida ou mensagem específica? (Ou digite "Pronto")',
          undefined,
          'mensagem'
        );
      }, 400);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const text = inputText.trim();
    setInputText('');

    // Add user message
    setMessages(prev => [
      ...prev,
      {
        id: 'user-' + Date.now(),
        sender: 'user',
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    if (step === 'nome') {
      setLeadData(prev => ({ ...prev, nome: text }));
      setStep('email');
      setTimeout(() => {
        addBotMessage(`Prazer, ${text}! 👏\n\nQual é o seu melhor e-mail para contato?`, undefined, 'email');
      }, 400);
    } else if (step === 'email') {
      setLeadData(prev => ({ ...prev, email: text }));
      setStep('telefone');
      setTimeout(() => {
        addBotMessage(
          'Perfeito! Agora, digite seu WhatsApp ou telefone com DDD (ex: 91 99615-6672):',
          undefined,
          'telefone'
        );
      }, 400);
    } else if (step === 'telefone') {
      setLeadData(prev => ({ ...prev, telefone: text }));
      setStep('uf');
      setTimeout(() => {
        addBotMessage(
          'De qual Estado (UF) você é?',
          ['PA', 'SP', 'RJ', 'MG', 'DF', 'Outro'],
          'uf'
        );
      }, 400);
    } else if (step === 'uf') {
      setLeadData(prev => ({ ...prev, uf: text.toUpperCase() }));
      setStep('mensagem');
      setTimeout(() => {
        addBotMessage(
          'Gostaria de deixar alguma mensagem ou interesse específico? (Ou digite "Não")',
          undefined,
          'mensagem'
        );
      }, 400);
    } else if (step === 'mensagem') {
      const msgFinal = text.toLowerCase() === 'não' || text.toLowerCase() === 'pronto' ? 'Nenhuma observação adicional' : text;
      const finalData = { ...leadData, mensagem: msgFinal };
      setLeadData(finalData);
      setStep('concluido');

      setTimeout(() => {
        addBotMessage(
          `🎉 Tudo pronto, ${finalData.nome}!\n\nSeus dados foram organizados. Clique no botão abaixo para conversar diretamente conosco via WhatsApp oficial:`,
          undefined,
          'concluido'
        );
      }, 400);
    }
  };

  // Generate WhatsApp Direct URL
  const generateWhatsAppUrl = () => {
    const telefoneDestino = '5591996156672';
    const textoMensagem = 
`*PLATAFORMA EU VOTO 2026 - CONTATO*
----------------------------------------
*Perfil:* ${leadData.perfil || 'Não informado'}
*Nome:* ${leadData.nome || 'Não informado'}
*E-mail:* ${leadData.email || 'Não informado'}
*Telefone/Whats:* ${leadData.telefone || 'Não informado'}
*Estado (UF):* ${leadData.uf || 'PA'}
*Mensagem/Interesse:* ${leadData.mensagem || 'Gostaria de mais informações sobre a plataforma.'}
----------------------------------------
_Enviado pelo Assistente Virtual Eu Voto_`;

    return `https://wa.me/${telefoneDestino}?text=${encodeURIComponent(textoMensagem)}`;
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen ? (
          <button
            id="btn-open-chatbot"
            onClick={() => setIsOpen(true)}
            aria-label="Abrir Atendimento Eu Voto"
            className="group flex items-center gap-3 bg-linear-to-r from-[#0B3D91] to-[#123F8F] hover:from-[#123F8F] hover:to-[#0B3D91] text-white px-4 py-3 rounded-full shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 active:scale-95 border-2 border-white/40"
          >
            <div className="relative">
              <MessageSquare className="w-6 h-6 text-white" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#16A34A] rounded-full ring-2 ring-white animate-pulse"></span>
            </div>
            <div className="text-left pr-1 hidden sm:block">
              <div className="text-xs font-black tracking-wide leading-tight">Dúvidas ou Parcerias?</div>
              <div className="text-[10px] text-blue-100 font-medium">Assistente Cívico 2026</div>
            </div>
          </button>
        ) : null}
      </div>

      {/* Chatbot Window */}
      {isOpen && (
        <div
          id="chatbot-window"
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
          style={{ height: '540px', maxHeight: 'calc(100vh - 5rem)' }}
        >
          {/* Header */}
          <div className="bg-linear-to-r from-[#0B3D91] to-[#16A34A] text-white p-4 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/20">
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-[#0B3D91]"></span>
              </div>
              <div>
                <h3 className="text-sm font-black tracking-tight leading-tight">Assistente Eu Voto</h3>
                <p className="text-[11px] text-blue-100/90 font-medium">Eleitor ou Candidato 2026</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={resetChat}
                title="Reiniciar Atendimento"
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Fechar"
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Notice */}
          <div className="bg-blue-50/80 px-4 py-1.5 border-b border-blue-100 flex items-center justify-between text-[11px] text-[#0B3D91] font-semibold">
            <span>WhatsApp Direto: (91) 99615-6672</span>
            <span className="text-emerald-700 font-bold">Online</span>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F8FAFC]">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-2xs whitespace-pre-wrap ${
                    msg.sender === 'user'
                      ? 'bg-[#0B3D91] text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-slate-200/70 rounded-bl-xs'
                  }`}
                >
                  {msg.text}
                </div>

                <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>

                {/* Inline Options if available */}
                {msg.options && (
                  <div className="flex flex-wrap gap-2 mt-2 max-w-[90%]">
                    {msg.options.map(opt => (
                      <button
                        key={opt}
                        onClick={() => handleSelectOption(opt)}
                        className="bg-white hover:bg-blue-50 text-[#0B3D91] border border-blue-200 text-xs font-bold px-3 py-1.5 rounded-xl shadow-2xs transition-all active:scale-95"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* If concluded, show WhatsApp Final Action Card */}
            {step === 'concluido' && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-3 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-black text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Resumo do Atendimento Gerado</span>
                </div>
                <div className="text-xs space-y-1 text-slate-700 bg-white/70 p-2.5 rounded-xl border border-emerald-100">
                  <div><strong>Perfil:</strong> {leadData.perfil}</div>
                  <div><strong>Nome:</strong> {leadData.nome}</div>
                  <div><strong>WhatsApp:</strong> {leadData.telefone}</div>
                  <div><strong>UF:</strong> {leadData.uf}</div>
                </div>
                <a
                  href={generateWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#16A34A] hover:bg-[#15803d] text-white font-extrabold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 text-center"
                >
                  <Phone className="w-4 h-4" />
                  <span>Enviar para WhatsApp (91) 99615-6672</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-1" />
                </a>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          {step !== 'concluido' ? (
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder={
                  step === 'perfil'
                    ? 'Escolha uma opção acima ou digite...'
                    : step === 'nome'
                    ? 'Digite seu nome completo...'
                    : step === 'email'
                    ? 'Digite seu e-mail...'
                    : step === 'telefone'
                    ? 'Digite seu telefone com DDD...'
                    : step === 'uf'
                    ? 'Digite sua UF (ex: PA)...'
                    : 'Digite sua mensagem...'
                }
                className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0B3D91] focus:bg-white"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="bg-[#0B3D91] hover:bg-[#123F8F] text-white p-2.5 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="p-3 bg-white border-t border-slate-200 text-center">
              <button
                onClick={resetChat}
                className="text-xs font-bold text-[#0B3D91] hover:underline flex items-center justify-center gap-1.5 mx-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Iniciar novo atendimento</span>
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};
