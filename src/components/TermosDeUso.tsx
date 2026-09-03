import React from 'react';
import { ArrowLeft, Scale, Check, Shield, FileText, AlertCircle } from 'lucide-react';

interface TermosDeUsoProps {
  onVoltar: () => void;
}

export const TermosDeUso: React.FC<TermosDeUsoProps> = ({ onVoltar }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Top Navigation */}
      <button
        onClick={onVoltar}
        className="inline-flex items-center gap-2 text-xs font-bold text-[#0B3D91] hover:text-[#123F8F] bg-blue-50 px-3.5 py-2 rounded-xl border border-blue-200 mb-6 transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Voltar para o Início</span>
      </button>

      {/* Main Document Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-8">
        
        {/* Header */}
        <div className="border-b border-slate-100 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#0B3D91] text-xs font-bold mb-3 border border-blue-200">
            <Scale className="w-3.5 h-3.5" />
            <span>Marco Regulatório & Condições Gerais</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Termos de Uso da Plataforma Eu Voto
          </h1>
          <p className="text-xs text-slate-500 mt-2">
            Vigência: Eleições Gerais 2026 • Última atualização: 02 de setembro de 2026
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
          
          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#0B3D91] text-white flex items-center justify-center text-xs">1</span>
              <span>Objeto e Finalidade Cívico-Estatística</span>
            </h2>
            <p>
              A <strong>Plataforma Eu Voto</strong> (“Plataforma”) é um ambiente digital independente, técnico e cívico destinado à sondagem de intenção de voto, simulação educativa de votação em urna eletrônica e apuração estatística para as <strong>Eleições Gerais de 2026</strong>.
            </p>
            <p>
              O simulador da urna eletrônica tem caráter de conscientização cívica e de pesquisa amostral de opinião pública, não possuindo vinculação jurídica com a apuração oficial do pleito executada pela Justiça Eleitoral.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#0B3D91] text-white flex items-center justify-center text-xs">2</span>
              <span>Conformidade com a Legislação Eleitoral (Lei nº 9.504/1997)</span>
            </h2>
            <p>
              Em observância ao artigo 33 e seguintes da Lei Federal nº 9.504/1997 e às resoluções específicas do Tribunal Superior Eleitoral (TSE) que regem as pesquisas eleitorais para 2026:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>Todas as pesquisas de opinião pública destinadas à divulgação ampla durante o período legal são previamente cadastradas no sistema PesqEle da Justiça Eleitoral;</li>
              <li>A plataforma disponibiliza a íntegra da metodologia, plano amostral, nível de confiança (95%), margem de erro estimada e dados do estatístico responsável;</li>
              <li>Os dados de candidatos, partidos, federações, coligações e fotos são importados exclusivamente do repositório oficial de dados abertos do TSE.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#0B3D91] text-white flex items-center justify-center text-xs">3</span>
              <span>Requisitos de Elegibilidade e Cadastro do Eleitor</span>
            </h2>
            <p>
              Para assegurar a autenticidade amostral e impedir votos automatizados (bots) ou manipulação coordenada:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>O participante deve possuir idade mínima de 16 (dezesseis) anos na data do pleito;</li>
              <li>Cada eleitor tem direito a registrar estritamente <strong>um voto por pesquisa</strong> ({'{pesquisaId}_{uid}'}), sendo vedada qualquer tentativa de duplo voto;</li>
              <li>O fornecimento de dados verdadeiros na etapa cadastral é condição imperativa para a validação estatística da cédula.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#0B3D91] text-white flex items-center justify-center text-xs">4</span>
              <span>Sigilo Inviolável do Voto e Desassociação</span>
            </h2>
            <p>
              A plataforma garante a <strong>desassociação criptográfica absoluta</strong> entre o voto registrado na urna simulada e a identidade do cidadão. Uma vez confirmada a votação com o som oficial, a cédula é contabilizada em agregado estatístico, sendo tecnicamente impossível a qualquer administrador ou terceiro correlacionar o voto individual ao CPF ou nome do participante.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#0B3D91] text-white flex items-center justify-center text-xs">5</span>
              <span>Condutas Proibidas e Auditoria Técnica</span>
            </h2>
            <p>É expressamente proibido ao usuário:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>Utilizar robôs, scripts, proxies de alteração de IP em massa ou ferramentas de automação;</li>
              <li>Tentar violar a segurança, os servidores, as rotas de API ou as bases criptográficas da plataforma;</li>
              <li>Divulgar resultados preliminares com falsas alegações de apuração oficial do TSE.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#0B3D91] text-white flex items-center justify-center text-xs">6</span>
              <span>Canais Oficiais de Contato</span>
            </h2>
            <p>
              Para dúvidas técnicas, auditoria estatística ou parcerias institucionais:
            </p>
            <p className="font-semibold text-slate-800">
              WhatsApp Oficial de Atendimento: <a href="https://wa.me/5591996156672" className="text-[#0B3D91] underline" target="_blank" rel="noreferrer">(91) 99615-6672</a><br />
              E-mail da Coordenação: <span className="text-[#0B3D91]">contato@plataformaeuvoto.org.br</span>
            </p>
          </section>

        </div>

      </div>

    </div>
  );
};
