import React, { useState, useEffect } from 'react';
import {
  Pesquisa,
  ConfigLanding
} from '../types';
import { AdminDataDashboard } from './AdminDataDashboard';
import { PergunteAosDadosChat } from './PergunteAosDadosChat';
import { AdminUsersManagement } from './AdminUsersManagement';
import { AdminCandidatesManagement } from './AdminCandidatesManagement';
import { AdminEtlUpload } from './AdminEtlUpload';
import {
  Shield,
  BarChart3,
  Users,
  Vote,
  UploadCloud,
  Send,
  Sparkles,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  Play,
  UserCheck
} from 'lucide-react';

interface AdminViewProps {
  pesquisas: Pesquisa[];
  configLanding: ConfigLanding;
  onRefreshPesquisas: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  pesquisas,
  configLanding,
  onRefreshPesquisas
}) => {
  const [activeTab, setActiveTab] = useState<
    'kpis' | 'pesquisas' | 'candidatos' | 'usuarios' | 'etl' | 'push' | 'cms' | 'ia' | 'testes'
  >('kpis');

  // Scroll to top on mount and whenever active tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [activeTab]);

  // CMS state
  const [cmsForm, setCmsForm] = useState<ConfigLanding>(configLanding);
  const [cmsMsg, setCmsMsg] = useState('');

  // Push state
  const [pushTitulo, setPushTitulo] = useState('');
  const [pushMsg, setPushMsg] = useState('');
  const [pushUf, setPushUf] = useState('BR');
  const [pushStatus, setPushStatus] = useState('');

  // Gemini AI state
  const [aiInsight, setAiInsight] = useState<string>('');
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);

  // New Survey Modal / Form
  const [novaPesquisa, setNovaPesquisa] = useState({
    titulo: '',
    descricao: '',
    inicio: new Date().toISOString().split('T')[0],
    fim: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    ufs: 'PA, BR',
    metodologia: 'Amostragem estratificada proporcional'
  });
  const [surveyMsg, setSurveyMsg] = useState('');

  // Automated Tests T1-T7 state
  const [testResults, setTestResults] = useState<
    { id: string; titulo: string; status: 'idle' | 'running' | 'pass' | 'fail'; detalhe?: string }[]
  >([
    { id: 'T1', titulo: 'T1: Candidato Presidencial Nacional (Lula/PT)', status: 'idle' },
    { id: 'T2', titulo: 'T2: Candidato Presidencial Oposição (Flávio/PL)', status: 'idle' },
    { id: 'T3', titulo: 'T3: Deputado Estadual PA (Rodrigo Cunha 12345)', status: 'idle' },
    { id: 'T4', titulo: 'T4: Senador PA com Suplentes (Helder 151)', status: 'idle' },
    { id: 'T5', titulo: 'T5: Consulta Número Inexistente retorna 404', status: 'idle' },
    { id: 'T6', titulo: 'T6: Bloqueio de Voto Duplo ({pesquisaId}_{uid} retorna 409)', status: 'idle' },
    { id: 'T7', titulo: 'T7: Disparo Automático de Notificação PUSH ao Publicar Pesquisa', status: 'idle' }
  ]);

  // Publish survey and trigger Push (T7)
  const handlePublicarPesquisa = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/pesquisas/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'publicada' })
      });
      if (res.ok) {
        setSurveyMsg('Pesquisa publicada! Notificação PUSH enviada automaticamente aos eleitores.');
        onRefreshPesquisas();
      }
    } catch {}
  };

  // Create new survey
  const handleCriarPesquisa = async (e: React.FormEvent) => {
    e.preventDefault();
    setSurveyMsg('');
    try {
      const res = await fetch('/api/v1/pesquisas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: novaPesquisa.titulo,
          descricao: novaPesquisa.descricao,
          inicio: new Date(novaPesquisa.inicio).toISOString(),
          fim: new Date(novaPesquisa.fim).toISOString(),
          ufs: novaPesquisa.ufs.split(',').map(s => s.trim().toUpperCase()),
          metodologia: novaPesquisa.metodologia,
          status: 'publicada'
        })
      });
      if (res.ok) {
        setSurveyMsg('Nova pesquisa criada e aberta com sucesso!');
        setNovaPesquisa({
          titulo: '',
          descricao: '',
          inicio: new Date().toISOString().split('T')[0],
          fim: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
          ufs: 'PA, BR',
          metodologia: 'Amostragem estratificada proporcional'
        });
        onRefreshPesquisas();
      }
    } catch {}
  };

  // Save CMS
  const handleSalvarCms = async (e: React.FormEvent) => {
    e.preventDefault();
    setCmsMsg('');
    try {
      const res = await fetch('/api/v1/config_landing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cmsForm)
      });
      if (res.ok) {
        setCmsMsg('Textos institucionais e aviso legal atualizados com sucesso!');
      }
    } catch {}
  };

  // Send Manual Push
  const handleEnviarPush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pushTitulo || !pushMsg) return;
    setPushStatus('Enviando...');
    try {
      const res = await fetch('/api/v1/notificacoes/enviar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: pushTitulo,
          mensagem: pushMsg,
          uf: pushUf
        })
      });
      if (res.ok) {
        setPushStatus(`Notificação disparada com sucesso para o tópico /topics/eleitores_${pushUf}!`);
        setPushTitulo('');
        setPushMsg('');
      } else {
        setPushStatus('Erro ao enviar notificação push.');
      }
    } catch {
      setPushStatus('Erro de conexão ao enviar push.');
    }
  };

  // Generate AI Insights via Gemini
  const handleGerarAiInsights = async () => {
    setIsGeneratingInsight(true);
    try {
      const res = await fetch('/api/v1/admin/ai-insights', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setAiInsight(data.insight);
      }
    } catch {}
    finally {
      setIsGeneratingInsight(false);
    }
  };

  // Run Test Suite T1-T7
  const runAllTests = async () => {
    const updated = [...testResults];

    // T1: Candidato Presidencial Nacional (Lula)
    updated[0].status = 'running';
    setTestResults([...updated]);
    try {
      const r1 = await fetch('/api/v1/candidatos?uf=BR&cargo=1&numero=13');
      const d1 = await r1.json();
      if (r1.ok && d1.nomeUrna === 'LULA' && d1.vice?.nomeUrna === 'GERALDO ALCKMIN') {
        updated[0].status = 'pass';
        updated[0].detalhe = '200 OK — LULA (PT) com vice Geraldo Alckmin recuperado via SQ_COLIGACAO.';
      } else {
        updated[0].status = 'fail';
      }
    } catch {
      updated[0].status = 'fail';
    }
    setTestResults([...updated]);

    // T2: Candidato Presidencial Oposição (Flávio Bolsonaro)
    updated[1].status = 'running';
    setTestResults([...updated]);
    try {
      const r2 = await fetch('/api/v1/candidatos?uf=BR&cargo=1&numero=22');
      const d2 = await r2.json();
      if (r2.ok && d2.nomeUrna === 'FLAVIO BOLSONARO' && d2.vice?.nomeUrna === 'ALFREDO GASPAR') {
        updated[1].status = 'pass';
        updated[1].detalhe = '200 OK — FLAVIO BOLSONARO (PL) com vice Alfredo Gaspar.';
      } else {
        updated[1].status = 'fail';
      }
    } catch {
      updated[1].status = 'fail';
    }
    setTestResults([...updated]);

    // T3: Deputado Estadual PA (Rodrigo Cunha 12345)
    updated[2].status = 'running';
    setTestResults([...updated]);
    try {
      const r3 = await fetch('/api/v1/candidatos?uf=PA&cargo=7&numero=12345');
      const d3 = await r3.json();
      if (r3.ok && d3.nomeUrna === 'RODRIGO CUNHA' && d3.cargoCd === 7) {
        updated[2].status = 'pass';
        updated[2].detalhe = '200 OK — RODRIGO CUNHA (PDT) Deputado Estadual no Pará.';
      } else {
        updated[2].status = 'fail';
      }
    } catch {
      updated[2].status = 'fail';
    }
    setTestResults([...updated]);

    // T4: Senador PA com Suplentes (Helder 151)
    updated[3].status = 'running';
    setTestResults([...updated]);
    try {
      const r4 = await fetch('/api/v1/candidatos?uf=PA&cargo=5&numero=151');
      const d4 = await r4.json();
      if (r4.ok && d4.nomeUrna === 'HELDER' && d4.suplentes?.length > 0) {
        updated[3].status = 'pass';
        updated[3].detalhe = `200 OK — HELDER (MDB) com 1º Suplente ${d4.suplentes[0].nomeUrna}.`;
      } else {
        updated[3].status = 'fail';
      }
    } catch {
      updated[3].status = 'fail';
    }
    setTestResults([...updated]);

    // T5: Inexistente 404
    updated[4].status = 'running';
    setTestResults([...updated]);
    try {
      const r5 = await fetch('/api/v1/candidatos?uf=BR&cargo=1&numero=9999');
      if (r5.status === 404) {
        updated[4].status = 'pass';
        updated[4].detalhe = '404 Not Found retornado corretamente para número inexistente.';
      } else {
        updated[4].status = 'fail';
      }
    } catch {
      updated[4].status = 'fail';
    }
    setTestResults([...updated]);

    // T6: Bloqueio Voto Duplo 409
    updated[5].status = 'running';
    setTestResults([...updated]);
    try {
      const testUid = 'audit_' + Date.now();
      await fetch('/api/v1/votos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pesquisaId: 'pesq_test_t6',
          uid: testUid,
          uf: 'PA',
          cargos: { presidente: { tipo: 'BRANCO', numero: 'BRANCO' } }
        })
      });
      // Second identical vote attempt
      const r6 = await fetch('/api/v1/votos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pesquisaId: 'pesq_test_t6',
          uid: testUid,
          uf: 'PA',
          cargos: { presidente: { tipo: 'BRANCO', numero: 'BRANCO' } }
        })
      });
      if (r6.status === 409) {
        updated[5].status = 'pass';
        updated[5].detalhe = '409 Conflict retornado bloqueando duplicidade com doc {pesquisaId}_{uid}.';
      } else {
        updated[5].status = 'fail';
      }
    } catch {
      updated[5].status = 'fail';
    }
    setTestResults([...updated]);

    // T7: Disparo automático de Push ao publicar pesquisa
    updated[6].status = 'running';
    setTestResults([...updated]);
    try {
      const pRes = await fetch('/api/v1/pesquisas/pesq_2026_01', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'publicada' })
      });
      const nRes = await fetch('/api/v1/notificacoes');
      const nData = await nRes.json();
      if (pRes.ok && nData.length > 0) {
        updated[6].status = 'pass';
        updated[6].detalhe = `200 OK — Notificação Push criada e disparada no tópico (${nData[0].titulo}).`;
      } else {
        updated[6].status = 'fail';
      }
    } catch {
      updated[6].status = 'fail';
    }
    setTestResults([...updated]);
  };

  return (
    <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      
      {/* Admin Title Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900">Painel de Gestão e Auditoria</h1>
              <span className="bg-amber-100 text-amber-900 text-[10px] font-black uppercase px-2 py-0.5 rounded-md border border-amber-300">
                admin:true
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Controle de ETL, amostragem demográfica protegida, CMS, Usuários e Inteligência Artificial.
            </p>
          </div>
        </div>

        {/* Quick Test Suite Launcher */}
        <button
          onClick={() => {
            setActiveTab('testes');
            runAllTests();
          }}
          className="flex items-center gap-2 bg-[#0B3D91] hover:bg-[#123F8F] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
        >
          <Play className="w-4 h-4 text-emerald-400" />
          <span>Executar Bateria de Testes (T1-T7)</span>
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="my-6 border-b border-slate-200 flex flex-wrap gap-2">
        {[
          { id: 'kpis', label: 'Painel de Dados & Gráficos', icon: BarChart3 },
          { id: 'pesquisas', label: 'Pesquisas', icon: Vote },
          { id: 'candidatos', label: 'Candidatos', icon: UserCheck },
          { id: 'usuarios', label: 'Usuários & Eleitores', icon: Users },
          { id: 'etl', label: 'Upload TSE (ETL)', icon: UploadCloud },
          { id: 'push', label: 'Notificações Push', icon: Send },
          { id: 'cms', label: 'CMS Landing', icon: Edit3 },
          { id: 'ia', label: 'Pergunte aos Dados (IA)', icon: Sparkles },
          { id: 'testes', label: 'Verificador T1–T7', icon: CheckCircle2 }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                document.documentElement.scrollTop = 0;
                document.body.scrollTop = 0;
              }}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'border-[#0B3D91] text-[#0B3D91]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* =======================================================
          TAB 1: VISÃO GERAL, PAINEL INTERATIVO RECHARTS & DEMOGRAFIA (§5.5)
          ======================================================= */}
      {activeTab === 'kpis' && (
        <AdminDataDashboard />
      )}

      {/* =======================================================
          TAB 2: GESTÃO DE PESQUISAS
          ======================================================= */}
      {activeTab === 'pesquisas' && (
        <div className="space-y-8">
          {surveyMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{surveyMsg}</span>
            </div>
          )}

          {/* New Survey Form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-4">
              Criar Nova Pesquisa Eleitoral
            </h3>

            <form onSubmit={handleCriarPesquisa} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Título da Pesquisa *</label>
                <input
                  type="text"
                  required
                  value={novaPesquisa.titulo}
                  onChange={e => setNovaPesquisa({ ...novaPesquisa, titulo: e.target.value })}
                  placeholder="Ex.: Pesquisa Eleitoral Estadual Pará — 1º Turno 2026"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0B3D91]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Descrição e Objetivos</label>
                <textarea
                  rows={2}
                  value={novaPesquisa.descricao}
                  onChange={e => setNovaPesquisa({ ...novaPesquisa, descricao: e.target.value })}
                  placeholder="Sondagem para cargos majoritários e proporcionais..."
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0B3D91]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Data Início</label>
                  <input
                    type="date"
                    required
                    value={novaPesquisa.inicio}
                    onChange={e => setNovaPesquisa({ ...novaPesquisa, inicio: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Data Encerramento</label>
                  <input
                    type="date"
                    required
                    value={novaPesquisa.fim}
                    onChange={e => setNovaPesquisa({ ...novaPesquisa, fim: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">UFs Participantes (separadas por vírgula)</label>
                  <input
                    type="text"
                    required
                    value={novaPesquisa.ufs}
                    onChange={e => setNovaPesquisa({ ...novaPesquisa, ufs: e.target.value })}
                    placeholder="PA, BR, SP"
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="bg-[#16A34A] hover:bg-[#15803d] text-white font-extrabold px-6 py-2.5 rounded-xl text-xs shadow-md transition-all cursor-pointer"
              >
                Salvar e Abrir Pesquisa
              </button>
            </form>
          </div>

          {/* List of Surveys */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                Pesquisas Registradas no Sistema
              </h3>
            </div>
            <div className="divide-y divide-slate-100">
              {pesquisas.map(p => (
                <div key={p.id} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-900">{p.titulo}</span>
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                          p.status === 'publicada'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{p.descricao}</p>
                    <div className="text-[11px] text-slate-400 mt-1">
                      UFs: {p.ufs.join(', ')} • Total Votos: {p.totalVotos}
                    </div>
                  </div>

                  {p.status !== 'publicada' && (
                    <button
                      onClick={() => handlePublicarPesquisa(p.id)}
                      className="bg-[#0B3D91] hover:bg-[#123F8F] text-white px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer"
                    >
                      Publicar e Notificar (Push)
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =======================================================
          TAB 3: GESTÃO COMPLETA DE CANDIDATOS COM FILTROS E EDIÇÃO
          ======================================================= */}
      {activeTab === 'candidatos' && (
        <AdminCandidatesManagement />
      )}

      {/* =======================================================
          TAB 4: GESTÃO DE USUÁRIOS E ELEITORES
          ======================================================= */}
      {activeTab === 'usuarios' && (
        <AdminUsersManagement />
      )}

      {/* =======================================================
          TAB 5: UPLOAD TSE (ESTEIRA ETL §2 e §3 COM PRELOADER %)
          ======================================================= */}
      {activeTab === 'etl' && (
        <AdminEtlUpload />
      )}

      {/* =======================================================
          TAB 6: NOTIFICAÇÕES PUSH
          ======================================================= */}
      {activeTab === 'push' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs max-w-2xl">
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-2">
            Disparar Notificação Push para Eleitores (FCM)
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Envie alertas diretos para dispositivos cadastrados por tópicos de UF.
          </p>

          <form onSubmit={handleEnviarPush} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Título da Notificação *</label>
              <input
                type="text"
                required
                value={pushTitulo}
                onChange={e => setPushTitulo(e.target.value)}
                placeholder="Ex.: Nova pesquisa aberta no Pará!"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mensagem *</label>
              <textarea
                rows={3}
                required
                value={pushMsg}
                onChange={e => setPushMsg(e.target.value)}
                placeholder="Ex.: Participe do simulador da urna oficial das Eleições 2026..."
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tópico de Destino (UF)</label>
              <select
                value={pushUf}
                onChange={e => setPushUf(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold"
              >
                <option value="BR">BR (Todos os eleitores cadastrados)</option>
                <option value="PA">PA (Eleitores do Pará)</option>
                <option value="SP">SP (Eleitores de São Paulo)</option>
                <option value="RJ">RJ (Eleitores do Rio de Janeiro)</option>
              </select>
            </div>

            {pushStatus && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold">
                {pushStatus}
              </div>
            )}

            <button
              type="submit"
              className="bg-[#0B3D91] hover:bg-[#123F8F] text-white font-extrabold px-6 py-2.5 rounded-xl text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Enviar Transmissão Push</span>
            </button>
          </form>
        </div>
      )}

      {/* =======================================================
          TAB 7: CMS DA LANDING PAGE
          ======================================================= */}
      {activeTab === 'cms' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs max-w-3xl">
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-2">
            Gestão de Conteúdo da Landing (config_landing)
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Altere os textos institucionais exibidos na página inicial e o aviso legal obrigatório do TSE.
          </p>

          <form onSubmit={handleSalvarCms} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Título Seção Sobre</label>
              <input
                type="text"
                value={cmsForm.sobreTitulo}
                onChange={e => setCmsForm({ ...cmsForm, sobreTitulo: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Texto Seção Sobre</label>
              <textarea
                rows={3}
                value={cmsForm.sobreTexto}
                onChange={e => setCmsForm({ ...cmsForm, sobreTexto: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Título Metodologia</label>
              <input
                type="text"
                value={cmsForm.metodologiaTitulo}
                onChange={e => setCmsForm({ ...cmsForm, metodologiaTitulo: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Texto Metodologia</label>
              <textarea
                rows={3}
                value={cmsForm.metodologiaTexto}
                onChange={e => setCmsForm({ ...cmsForm, metodologiaTexto: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Aviso Legal TSE / PesqEle (Obrigatório)</label>
              <textarea
                rows={3}
                value={cmsForm.avisoLegalTSE}
                onChange={e => setCmsForm({ ...cmsForm, avisoLegalTSE: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-amber-900 bg-amber-50/50"
              />
            </div>

            {cmsMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold">
                {cmsMsg}
              </div>
            )}

            <button
              type="submit"
              className="bg-[#16A34A] hover:bg-[#15803d] text-white font-extrabold px-6 py-2.5 rounded-xl text-xs shadow-md transition-all cursor-pointer"
            >
              Publicar Alterações no CMS
            </button>
          </form>
        </div>
      )}

      {/* =======================================================
          TAB 8: INSIGHTS IA (GEMINI API) (§5.5)
          ======================================================= */}
      {activeTab === 'ia' && (
        <div className="space-y-6">
          
          {/* Executive Insights Generator */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  Relatório Executivo Semanal de Insights Eleitorais (Gemini AI)
                </h3>
              </div>
              <button
                onClick={handleGerarAiInsights}
                disabled={isGeneratingInsight}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-extrabold transition-all active:scale-95 disabled:opacity-60 flex items-center gap-2 self-start sm:self-auto cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isGeneratingInsight ? 'Processando Modelos...' : 'Gerar Novo Relatório'}</span>
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Análise preditiva automatizada sobre tendências de voto, engajamento e estratificação amostral gerada pelo modelo Gemini com grounding nos dados da urna.
            </p>

            {aiInsight && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs leading-relaxed text-slate-800 whitespace-pre-wrap">
                {aiInsight}
              </div>
            )}
          </div>

          {/* Interactive Chat: Pergunte aos Dados */}
          <PergunteAosDadosChat />

        </div>
      )}

      {/* =======================================================
          TAB 9: VERIFICADOR DE TESTES T1–T7 (§8)
          ======================================================= */}
      {activeTab === 'testes' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs max-w-3xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Bateria de Verificação Técnica Automatizada (T1 a T7)
              </h3>
              <p className="text-xs text-slate-500">
                Validação end-to-end de todos os requisitos de arquitetura, integridade e API.
              </p>
            </div>

            <button
              onClick={runAllTests}
              className="bg-[#16A34A] hover:bg-[#15803d] text-white font-extrabold px-5 py-2 rounded-xl text-xs shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4" />
              <span>Executar Novamente</span>
            </button>
          </div>

          <div className="space-y-3">
            {testResults.map(t => (
              <div
                key={t.id}
                className={`p-4 rounded-xl border flex items-start justify-between gap-3 text-xs ${
                  t.status === 'pass'
                    ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                    : t.status === 'fail'
                    ? 'bg-rose-50 border-rose-300 text-rose-950'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div>
                  <div className="font-black text-xs flex items-center gap-2">
                    <span>{t.titulo}</span>
                    {t.status === 'pass' && (
                      <span className="bg-emerald-200 text-emerald-900 font-bold px-1.5 py-0.2 rounded-sm text-[10px]">
                        APROVADO ✓
                      </span>
                    )}
                    {t.status === 'fail' && (
                      <span className="bg-rose-200 text-rose-900 font-bold px-1.5 py-0.2 rounded-sm text-[10px]">
                        FALHA ✗
                      </span>
                    )}
                    {t.status === 'running' && (
                      <span className="bg-blue-100 text-blue-800 font-bold px-1.5 py-0.2 rounded-sm text-[10px] animate-pulse">
                        EXECUTANDO...
                      </span>
                    )}
                  </div>
                  {t.detalhe && (
                    <div className="text-[11px] font-mono mt-1 opacity-90">{t.detalhe}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
