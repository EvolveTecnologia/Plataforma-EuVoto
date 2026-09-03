import React from 'react';
import { ArrowLeft, ShieldCheck, Lock, CheckCircle2, FileText, Database } from 'lucide-react';

interface PoliticaPrivacidadeProps {
  onVoltar: () => void;
}

export const PoliticaPrivacidade: React.FC<PoliticaPrivacidadeProps> = ({ onVoltar }) => {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-[#16A34A] text-xs font-bold mb-3 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Conformidade com a LGPD (Lei Federal nº 13.709/2018)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Política de Privacidade e Proteção de Dados
          </h1>
          <p className="text-xs text-slate-500 mt-2">
            Compromisso ético e técnico com a privacidade do eleitor brasileiro • Atualizada em 2026
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
          
          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#16A34A] text-white flex items-center justify-center text-xs">1</span>
              <span>Princípio Fundamental: O Voto é 100% Anônimo</span>
            </h2>
            <p>
              A <strong>Plataforma Eu Voto</strong> opera sob o princípio de <em>Privacy by Design</em>. Em nenhuma circunstância o seu voto individual é associado ao seu nome, e-mail, telefone ou documento de identificação. As escolhas feitas na urna simulada são agregadas instantaneamente aos totais estatísticos, eliminando qualquer elo de ligação entre a pessoa e o partido/candidato votado.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#16A34A] text-white flex items-center justify-center text-xs">2</span>
              <span>Tratamento e Anonimização do CPF (Hash SHA-256)</span>
            </h2>
            <p>
              Em respeito estrito à LGPD, a plataforma <strong>NUNCA armazena o número do seu CPF em formato texto legível</strong>. O fluxo opera da seguinte forma:
            </p>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <Lock className="w-4 h-4 text-[#0B3D91]" />
                <span>Mecanismo Criptográfico Unidirecional:</span>
              </div>
              <p className="text-slate-600">
                1. O CPF digitado é validado conforme o algoritmo oficial da Receita Federal;<br />
                2. O backend aplica imediatamente um algoritmo de dispersão criptográfica irreversível (<strong>SHA-256 com Salt dinâmico</strong>);<br />
                3. O número do CPF original é descartado da memória RAM e nunca é gravado no banco de dados Firestore;<br />
                4. Apenas o hash gerado é mantido para garantir que o mesmo cidadão não vote duas vezes na mesma pesquisa.
              </p>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#16A34A] text-white flex items-center justify-center text-xs">3</span>
              <span>Finalidade dos Dados Demográficos Coletados</span>
            </h2>
            <p>
              Os dados de <strong>Gênero/Sexo, Data de Nascimento (Idade), Município e UF</strong> são utilizados com exclusividade para:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>Ponderação e estratificação da amostra estatística exigida pelas resoluções do TSE;</li>
              <li>Garantir que a distribuição demográfica dos votantes reflita a proporção real do eleitorado brasileiro conforme o Censo do IBGE e cadastro eleitoral;</li>
              <li>Geração de cruzamentos demográficos restritos na área administrativa (sem exibir identificação de qualquer participante).</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#16A34A] text-white flex items-center justify-center text-xs">4</span>
              <span>Notificações Push e Comunicações</span>
            </h2>
            <p>
              Ao optar pelo recebimento de notificações push (“Opt-in”), seu dispositivo recebe avisos de novas pesquisas liberadas em sua UF e divulgação de relatórios consolidados. Você pode revogar essa permissão a qualquer momento nas configurações do seu navegador ou no seu perfil de usuário.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#16A34A] text-white flex items-center justify-center text-xs">5</span>
              <span>Direitos do Titular de Dados e Encarregado (DPO)</span>
            </h2>
            <p>
              Conforme o artigo 18 da LGPD, você tem direito a confirmar a existência de tratamento, atualizar seus dados cadastrais, solicitar a anonimização ou exclusão definitiva de sua conta da plataforma.
            </p>
            <p>
              Para exercer seus direitos como titular de dados ou falar com nosso Encarregado de Proteção de Dados (DPO):
            </p>
            <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 text-xs font-semibold text-[#0B3D91]">
              WhatsApp DPO & Privacidade: <a href="https://wa.me/5591996156672" target="_blank" rel="noreferrer" className="underline">(91) 99615-6672</a><br />
              Canal de Privacidade LGPD: dpo@plataformaeuvoto.org.br
            </div>
          </section>

        </div>

      </div>

    </div>
  );
};
