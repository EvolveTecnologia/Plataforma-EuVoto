import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, User, Copy, Check, HelpCircle, ArrowRight, Loader2 } from 'lucide-react';
import { ChatMessage } from '../types';

interface PergunteAosDadosChatProps {
  onSuggestQuery?: (query: string) => void;
  compact?: boolean;
}

const PERGUNTAS_SUGERIDAS = [
  'Qual candidato a Presidente lidera no total de votos?',
  'Como está a proporção de votos femininos vs masculinos no Pará?',
  'Qual município registra a maior participação de eleitores?',
  'Qual a taxa de votos brancos e nulos para os cargos majoritários?',
  'Qual é a faixa etária mais participativa na plataforma?',
  'Faça uma análise estatística de tendências para o 1º turno de 2026.'
];

export const PergunteAosDadosChat: React.FC<PergunteAosDadosChatProps> = ({ compact = false }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'gemini',
      text: 'Olá, Administrador! Sou o Cientista de Dados Eleitorais da Plataforma Eu Voto, alimentado pela Gemini API. Pergunte-me qualquer questão sobre os votos computados, rankings de candidatos, estratificação demográfica (sexo, idade, UF e município) ou tendências estatísticas.',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    // Only scroll internally if messages list has more than 1 message or loading changed
    if (messages.length > 1 || loading) {
      scrollToBottom();
    }
  }, [messages, loading]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/v1/admin/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: textToSend.trim() })
      });

      if (!res.ok) {
        throw new Error('Falha na resposta do servidor');
      }

      const data = await res.json();
      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'gemini',
        text: data.answer || 'Não foi possível sintetizar a resposta com os dados atuais.',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: 'gemini',
        text: 'Desculpe, ocorreu uma instabilidade na consulta à inteligência de dados. Por favor, tente novamente.',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden ${compact ? 'h-[520px]' : 'h-[620px]'}`}>
      {/* Header */}
      <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-400 shadow-inner">
            <Sparkles className="w-5 h-5 text-indigo-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold tracking-wide">Pergunte aos Dados Eleitorais</h3>
              <span className="bg-indigo-500/30 text-indigo-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-indigo-400/30">
                Gemini API
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Análise em linguagem natural conectada em tempo real aos votos e demografia oficial
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-2.5 py-1 rounded-full font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Base Ativa 2026</span>
        </div>
      </div>

      {/* Suggested prompts carousel / list */}
      <div className="bg-slate-50/80 px-4 py-2.5 border-b border-slate-200 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 whitespace-nowrap mr-1">
          <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
          <span>Sugestões:</span>
        </div>
        {PERGUNTAS_SUGERIDAS.map((sug, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(sug)}
            disabled={loading}
            className="text-[11px] font-medium text-slate-700 hover:text-indigo-900 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 px-3 py-1 rounded-full whitespace-nowrap transition-all flex items-center gap-1 shadow-2xs active:scale-95 disabled:opacity-50"
          >
            <span>{sug}</span>
            <ArrowRight className="w-2.5 h-2.5 opacity-60" />
          </button>
        ))}
      </div>

      {/* Messages area */}
      <div ref={messagesContainerRef} className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#f8fafc]">
        {messages.map(msg => {
          const isAi = msg.sender === 'gemini';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isAi ? 'justify-start' : 'justify-end'}`}
            >
              {isAi && (
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs leading-relaxed shadow-xs relative group ${
                  isAi
                    ? 'bg-white border border-slate-200 text-slate-800'
                    : 'bg-[#0B3D91] text-white font-medium'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5 gap-4">
                  <span className={`text-[10px] font-black uppercase tracking-wider ${isAi ? 'text-indigo-600' : 'text-blue-200'}`}>
                    {isAi ? 'Cientista de Dados (Gemini)' : 'Você (Administrador)'}
                  </span>
                  <span className={`text-[10px] ${isAi ? 'text-slate-400' : 'text-blue-300'}`}>
                    {msg.timestamp}
                  </span>
                </div>

                <div className="whitespace-pre-wrap font-normal">{msg.text}</div>

                {isAi && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1 text-slate-400">
                      <Sparkles className="w-2.5 h-2.5 text-indigo-500" />
                      Auditoria de Dados TSE 2026
                    </span>
                    <button
                      onClick={() => copyToClipboard(msg.id, msg.text)}
                      className="hover:text-slate-700 flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded hover:bg-slate-100"
                      title="Copiar resposta"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600 font-bold">Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {!isAi && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5 animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 text-xs leading-relaxed shadow-xs flex items-center gap-3">
              <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
              <div className="space-y-1">
                <p className="font-bold text-slate-800">Processando modelos estatísticos e cruzando bases...</p>
                <p className="text-[11px] text-slate-500">Gemini está computando intenções de voto e demografia.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3.5 bg-white border-t border-slate-200 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Faça uma pergunta sobre candidatos, votos, UFs, municípios ou demografia..."
          disabled={loading}
          className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-indigo-600 transition-all disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Enviar</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
