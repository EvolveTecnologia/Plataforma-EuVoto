import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ShieldCheck, Vote, Scale, Users, FileText } from 'lucide-react';

interface FaqItem {
  id: string;
  categoria: 'eleicoes' | 'seguranca' | 'tse' | 'parcerias';
  pergunta: string;
  resposta: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-1',
    categoria: 'eleicoes',
    pergunta: 'Como funciona o simulador da Urna Eletrônica na Plataforma Eu Voto?',
    resposta: 'O simulador reproduz com fidelidade a ordem oficial de votação definida pelo Tribunal Superior Eleitoral (TSE) para as Eleições Gerais de 2026: Deputado Federal (4 dígitos), Deputado Estadual (5 dígitos), Senador 1ª Vaga (3 dígitos), Senador 2ª Vaga (3 dígitos, bloqueando repetição), Governador (2 dígitos) e Presidente da República (2 dígitos). A interface conta com áudio sintetizado oficial do teclado, alertas sonoros ao concluir na tela FIM.'
  },
  {
    id: 'faq-2',
    categoria: 'seguranca',
    pergunta: 'O meu voto na pesquisa é realmente secreto e seguro?',
    resposta: 'Sim, 100% secreto. A arquitetura da plataforma desacopla a sua cédula de votação de qualquer identificador pessoal rastreável. Seu voto é computado de forma anônima e criptografada. O identificador único de votação utiliza uma chave idempotente ({pesquisaId}_{uid}) exclusivamente para impedir fraude ou voto duplo, sem que ninguém possa associar a sua escolha partidária ao seu nome ou CPF.'
  },
  {
    id: 'faq-3',
    categoria: 'seguranca',
    pergunta: 'Por que é exigido o CPF no cadastro complementar se o voto é anônimo?',
    resposta: 'O CPF é utilizado estritamente para garantir a lisura estatística da amostragem (evitando perfis falsos, robôs ou cadastros em duplicidade). Em conformidade com a LGPD (Lei nº 13.709/2018), o número do seu CPF NUNCA é armazenado em texto claro: nosso servidor gera um hash criptográfico irreversível SHA-256 com sal e descarta o número original.'
  },
  {
    id: 'faq-4',
    categoria: 'tse',
    pergunta: 'As pesquisas da plataforma seguem as exigências legais do TSE?',
    resposta: 'Sim. A plataforma segue os parâmetros da Lei nº 9.504/1997 e das resoluções normativas do TSE para o pleito de 2026. Todas as pesquisas contam com estratificação amostragem probabilística (por gênero, faixa etária, escolaridade e UF), período de coleta demarcado, margem de erro, nível de confiança de 95% e indicação de registro no sistema PesqEle durante o período eleitoral oficial.'
  },
  {
    id: 'faq-5',
    categoria: 'parcerias',
    pergunta: 'Candidatos, partidos políticos ou institutos podem contratar a plataforma?',
    resposta: 'Sim! A Plataforma Eu Voto dispõe de módulos especializados para coordenações de campanha, institutos de pesquisa e consultorias eleitorais. Disponibilizamos levantamentos territoriais, relatórios de sentimento, análise de transferência de votos, cruzamentos demográficos avançados e integração com modelos de IA Gemini para predição de cenários. Fale com nossa equipe pelo WhatsApp (91) 99615-6672.'
  },
  {
    id: 'faq-6',
    categoria: 'eleicoes',
    pergunta: 'Qual a diferença entre a Área do Eleitor e a Área Administrativa?',
    resposta: 'A Área do Eleitor é o espaço cívico onde o cidadão gerencia seu cadastro, acompanha suas participações, visualiza comprovantes de votação e acessa resultados públicos. Já a Área Administrativa é restrita a gestores autorizados e auditores estatísticos, permitindo importação de dados oficiais do TSE (ETL), envio de notificações push, gestão de pesquisas e análise de amostragem protegida.'
  },
  {
    id: 'faq-7',
    categoria: 'tse',
    pergunta: 'De onde vêm os dados e fotos dos candidatos exibidos na urna?',
    resposta: 'Todos os dados dos candidatos (nomes de urna, números, legendas partidárias, composição de coligações/federações e fotos oficiais) são extraídos diretamente do Portal de Dados Abertos do TSE através de nossa esteira automatizada de ETL, garantindo fidelidade absoluta com os registros do pleito de 2026.'
  }
];

export const FaqSection: React.FC = () => {
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>('todos');
  const [abertoId, setAbertoId] = useState<string | null>('faq-1');

  const categorias = [
    { id: 'todos', label: 'Todas as Perguntas', icon: HelpCircle },
    { id: 'eleicoes', label: 'Eleições 2026 & Urna', icon: Vote },
    { id: 'seguranca', label: 'Segurança & LGPD', icon: ShieldCheck },
    { id: 'tse', label: 'Legislação & TSE', icon: Scale },
    { id: 'parcerias', label: 'Candidatos & Campanhas', icon: Users }
  ];

  const itensFiltrados = FAQ_ITEMS.filter(item => 
    categoriaAtiva === 'todos' ? true : item.categoria === categoriaAtiva
  );

  const toggleItem = (id: string) => {
    setAbertoId(abertoId === id ? null : id);
  };

  return (
    <section id="faq-section" className="py-12 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 text-[#0B3D91] text-xs font-bold mb-3 border border-blue-200/60">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Tire Suas Dúvidas</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            Perguntas Frequentes (FAQ)
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600">
            Entenda como a Plataforma Eu Voto garante transparência estatística, sigilo de dados e conformidade com as regras eleitorais brasileiras.
          </p>
        </div>

        {/* Categorias - Tabs Responsivas */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {categorias.map(cat => {
            const Icon = cat.icon;
            const isSelected = categoriaAtiva === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setCategoriaAtiva(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-[#0B3D91] text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {itensFiltrados.map(item => {
            const isAberto = abertoId === item.id;
            return (
              <div
                key={item.id}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isAberto
                    ? 'bg-blue-50/40 border-blue-200 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <button
                  onClick={() => toggleItem(item.id)}
                  className="w-full px-5 py-4 sm:px-6 sm:py-5 flex items-center justify-between gap-4 text-left focus:outline-none"
                  aria-expanded={isAberto}
                >
                  <span className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    {item.pergunta}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isAberto
                        ? 'bg-[#0B3D91] text-white rotate-180'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isAberto && (
                  <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-blue-100/60 pt-3">
                    <p>{item.resposta}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Support Callout */}
        <div className="mt-10 p-5 rounded-2xl bg-linear-to-r from-slate-900 to-[#0B3D91] text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h4 className="font-extrabold text-sm sm:text-base">Não encontrou a resposta que procurava?</h4>
            <p className="text-xs text-blue-100/90 mt-0.5">
              Nossa equipe de coordenação técnica e atendimento cívico está disponível para orientar você.
            </p>
          </div>
          <a
            href="https://wa.me/5591996156672?text=Ol%C3%A1!%20Tenho%20uma%20d%C3%BAvida%20sobre%20a%20Plataforma%20Eu%20Voto%202026."
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#16A34A] hover:bg-[#15803d] text-white px-5 py-2.5 rounded-xl font-extrabold text-xs shadow-md transition-all shrink-0 active:scale-95 flex items-center gap-2"
          >
            <span>Falar com Suporte no WhatsApp</span>
          </a>
        </div>

      </div>
    </section>
  );
};
