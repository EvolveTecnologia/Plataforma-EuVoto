import React, { useState, useEffect } from 'react';
import { Candidato } from '../types';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Filter,
  RefreshCw,
  Award,
  CheckCircle2,
  XCircle,
  LayoutGrid,
  List,
  Eye,
  Check,
  X,
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const CARGOS = [
  { id: '', label: 'Todos os Cargos' },
  { id: '1', label: 'Presidente (1)' },
  { id: '3', label: 'Governador (3)' },
  { id: '5', label: 'Senador (5)' },
  { id: '6', label: 'Deputado Federal (6)' },
  { id: '7', label: 'Deputado Estadual (7)' }
];

const UFS = [
  'TODOS', 'BR', 'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN',
  'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO'
];

export const AdminCandidatesManagement: React.FC = () => {
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [busca, setBusca] = useState('');
  const [filtroUf, setFiltroUf] = useState('TODOS');
  const [filtroCargo, setFiltroCargo] = useState('');
  const [filtroPartido, setFiltroPartido] = useState('');
  const [stats, setStats] = useState({
    totalCandidatos: 0,
    totalPresidentes: 0,
    totalGovernadores: 0,
    totalSenadores: 0,
    totalDeputados: 0
  });

  // Modal Novo / Edição
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    nomeUrna: '',
    numero: '',
    cargoCd: 1,
    cargo: 'PRESIDENTE',
    uf: 'BR',
    partido: 'PARTIDO DOS TRABALHADORES',
    sigla: 'PT',
    coligacao: 'BRASIL DA ESPERANÇA',
    fotoUrl: '/fotos/default-avatar.svg',
    situacao: 'DEFERIDO',
    viceNomeUrna: '',
    vicePartido: '',
    viceSigla: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  // Modal Exclusão
  const [deleteConfirmCand, setDeleteConfirmCand] = useState<Candidato | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    carregarCandidatos();
  }, [busca, filtroUf, filtroCargo, filtroPartido]);

  const carregarCandidatos = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (busca) params.append('busca', busca);
      if (filtroUf !== 'TODOS') params.append('uf', filtroUf);
      if (filtroCargo) params.append('cargo', filtroCargo);
      if (filtroPartido) params.append('partido', filtroPartido);

      const res = await fetch(`/api/v1/admin/candidatos?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCandidatos(data.candidatos || []);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      nome: '',
      nomeUrna: '',
      numero: '',
      cargoCd: 1,
      cargo: 'PRESIDENTE',
      uf: 'BR',
      partido: 'PARTIDO DA SOCIAL DEMOCRACIA BRASILEIRA',
      sigla: 'PSDB',
      coligacao: 'FEDERAÇÃO PSDB CIDADANIA',
      fotoUrl: '/fotos/default-avatar.svg',
      situacao: 'DEFERIDO',
      viceNomeUrna: '',
      vicePartido: '',
      viceSigla: ''
    });
    setFeedbackMsg(null);
    setShowModal(true);
  };

  const handleOpenEdit = (c: Candidato) => {
    setIsEditing(true);
    setEditingId(c.id);
    setFormData({
      nome: c.nome || c.nomeUrna,
      nomeUrna: c.nomeUrna,
      numero: c.numero,
      cargoCd: c.cargoCd,
      cargo: c.cargo,
      uf: c.uf,
      partido: c.partido,
      sigla: c.sigla,
      coligacao: c.coligacao || '',
      fotoUrl: c.fotoUrl || '/fotos/default-avatar.svg',
      situacao: c.situacao || 'DEFERIDO',
      viceNomeUrna: c.vice?.nomeUrna || '',
      vicePartido: c.vice?.partido || '',
      viceSigla: c.vice?.sigla || ''
    });
    setFeedbackMsg(null);
    setShowModal(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nomeUrna.trim() || !formData.numero.trim()) {
      setFeedbackMsg({ tipo: 'erro', texto: 'Preencha o nome de urna e o número eleitoral.' });
      return;
    }

    setIsSubmitting(true);
    setFeedbackMsg(null);

    try {
      const url = isEditing && editingId ? `/api/v1/admin/candidatos/${editingId}` : '/api/v1/admin/candidatos';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok) {
        setFeedbackMsg({
          tipo: 'sucesso',
          texto: isEditing ? 'Candidato atualizado com sucesso!' : 'Candidato cadastrado com sucesso!'
        });
        carregarCandidatos();
        setTimeout(() => {
          setShowModal(false);
        }, 1200);
      } else {
        setFeedbackMsg({ tipo: 'erro', texto: data.error || 'Erro ao processar solicitação.' });
      }
    } catch (err: any) {
      setFeedbackMsg({ tipo: 'erro', texto: `Erro de conexão: ${err.message}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCand = async () => {
    if (!deleteConfirmCand) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/v1/admin/candidatos/${deleteConfirmCand.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setDeleteConfirmCand(null);
        carregarCandidatos();
      }
    } catch {}
    finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Total Cadastrados</span>
          <div className="text-xl font-black text-slate-900 mt-1">{stats.totalCandidatos}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-600 uppercase">Presidência</span>
          <div className="text-xl font-black text-emerald-700 mt-1">{stats.totalPresidentes}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-blue-600 uppercase">Governos Estaduais</span>
          <div className="text-xl font-black text-blue-700 mt-1">{stats.totalGovernadores}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-purple-600 uppercase">Senado Federal</span>
          <div className="text-xl font-black text-purple-700 mt-1">{stats.totalSenadores}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-amber-600 uppercase">Deputados</span>
          <div className="text-xl font-black text-amber-700 mt-1">{stats.totalDeputados}</div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por nome de urna, número, partido ou sigla..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20 focus:bg-white transition-all"
          />
        </div>

        {/* Filter Selects */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Cargo */}
          <select
            value={filtroCargo}
            onChange={e => setFiltroCargo(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20 cursor-pointer"
          >
            {CARGOS.map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>

          {/* UF */}
          <select
            value={filtroUf}
            onChange={e => setFiltroUf(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20 cursor-pointer"
          >
            {UFS.map(uf => (
              <option key={uf} value={uf}>{uf === 'TODOS' ? 'Todas UFs' : uf}</option>
            ))}
          </select>

          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-white shadow-xs text-[#0B3D91]' : 'text-slate-500'
              }`}
              title="Visualização em Tabela"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-white shadow-xs text-[#0B3D91]' : 'text-slate-500'
              }`}
              title="Visualização em Grade"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {/* Refresh */}
          <button
            onClick={carregarCandidatos}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
            title="Atualizar lista"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          {/* Add Candidate */}
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 bg-[#0B3D91] hover:bg-[#123F8F] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer active:scale-95 ml-auto sm:ml-0"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Candidato</span>
          </button>
        </div>
      </div>

      {/* Content Rendering */}
      {isLoading ? (
        <div className="p-8 space-y-3 bg-white rounded-2xl border border-slate-200">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : candidatos.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <div className="text-base font-bold text-slate-700">Nenhum candidato encontrado</div>
          <p className="text-xs text-slate-500 mt-1">
            Altere os filtros de cargo e estado ou adicione um novo candidato.
          </p>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Candidato / Foto</th>
                  <th className="py-3.5 px-4">Número</th>
                  <th className="py-3.5 px-4">Cargo / UF</th>
                  <th className="py-3.5 px-4">Partido / Sigla</th>
                  <th className="py-3.5 px-4">Vice / Suplente</th>
                  <th className="py-3.5 px-4">Situação</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {candidatos.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={c.fotoUrl}
                          alt={c.nomeUrna}
                          className="w-10 h-12 object-cover rounded-lg border border-slate-200 bg-slate-100 shrink-0"
                          onError={(e: any) => {
                            e.target.src = '/fotos/default-avatar.svg';
                          }}
                        />
                        <div>
                          <div className="font-extrabold text-slate-900 text-sm">{c.nomeUrna}</div>
                          <div className="text-[11px] text-slate-500">{c.nome}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono font-black text-slate-900 text-sm">
                      <span className="bg-slate-100 px-2 py-1 rounded-md">
                        {c.numero}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{c.cargo}</div>
                      <div className="text-[11px] text-slate-500 font-semibold">UF: {c.uf}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-blue-50 text-[#0B3D91] rounded font-extrabold text-[11px]">
                        {c.sigla}
                      </span>
                      <div className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[160px]">{c.partido}</div>
                    </td>

                    <td className="py-3 px-4">
                      {c.vice ? (
                        <div>
                          <div className="font-bold text-slate-800 text-xs">{c.vice.nomeUrna}</div>
                          <div className="text-[10px] text-slate-500">{c.vice.sigla}</div>
                        </div>
                      ) : c.suplentes && c.suplentes.length > 0 ? (
                        <div className="text-[11px] text-slate-600">
                          1º Suplente: {c.suplentes[0].nomeUrna}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold text-[10px]">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{c.situacao || 'DEFERIDO'}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                          title="Editar candidato"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmCand(c)}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                          title="Excluir candidato"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid Mode */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {candidatos.map(c => (
            <div key={c.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-start gap-3">
                  <img
                    src={c.fotoUrl}
                    alt={c.nomeUrna}
                    className="w-14 h-16 object-cover rounded-xl border border-slate-200 bg-slate-100 shrink-0"
                    onError={(e: any) => {
                      e.target.src = '/fotos/default-avatar.svg';
                    }}
                  />
                  <div className="min-w-0">
                    <span className="font-mono text-xs font-black bg-slate-100 text-slate-900 px-2 py-0.5 rounded-md">
                      Nº {c.numero}
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-sm mt-1 truncate">{c.nomeUrna}</h4>
                    <span className="text-[11px] text-slate-500 font-semibold block">{c.cargo} • {c.uf}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Partido:</span>
                    <span className="font-bold text-[#0B3D91]">{c.sigla}</span>
                  </div>
                  {c.vice && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Vice:</span>
                      <span className="font-semibold text-slate-800 truncate max-w-[120px]">{c.vice.nomeUrna}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(c)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => setDeleteConfirmCand(c)}
                  className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                  title="Excluir"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Criar / Editar Candidato */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#0B3D91] text-white flex items-center justify-center font-bold">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">
                      {isEditing ? 'Editar Candidato' : 'Cadastrar Novo Candidato'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Informações sincronizadas com o padrão de dados do TSE
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {feedbackMsg && (
                <div
                  className={`p-3.5 rounded-xl text-xs font-bold mb-4 ${
                    feedbackMsg.tipo === 'sucesso'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {feedbackMsg.texto}
                </div>
              )}

              <form onSubmit={handleSubmitForm} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Cargo Eletivo *</label>
                    <select
                      value={formData.cargoCd}
                      onChange={e => {
                        const cd = Number(e.target.value);
                        const cargoNome = cd === 1 ? 'PRESIDENTE' : cd === 3 ? 'GOVERNADOR' : cd === 5 ? 'SENADOR' : cd === 6 ? 'DEPUTADO FEDERAL' : 'DEPUTADO ESTADUAL';
                        setFormData({ ...formData, cargoCd: cd, cargo: cargoNome, uf: cd === 1 ? 'BR' : formData.uf });
                      }}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20 cursor-pointer"
                    >
                      <option value={1}>Presidente (1)</option>
                      <option value={3}>Governador (3)</option>
                      <option value={5}>Senador (5)</option>
                      <option value={6}>Deputado Federal (6)</option>
                      <option value={7}>Deputado Estadual (7)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Estado (UF) *</label>
                    <select
                      value={formData.uf}
                      onChange={e => setFormData({ ...formData, uf: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20 cursor-pointer"
                    >
                      {UFS.filter(u => u !== 'TODOS').map(uf => (
                        <option key={uf} value={uf}>{uf}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Número Eleitoral *</label>
                    <input
                      type="text"
                      required
                      value={formData.numero}
                      onChange={e => setFormData({ ...formData, numero: e.target.value.replace(/\D/g, '') })}
                      placeholder="Ex: 13, 22, 151"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nome de Urna *</label>
                    <input
                      type="text"
                      required
                      value={formData.nomeUrna}
                      onChange={e => setFormData({ ...formData, nomeUrna: e.target.value.toUpperCase() })}
                      placeholder="Ex: LULA, FLÁVIO BOLSONARO, HELDER"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nome Completo</label>
                    <input
                      type="text"
                      value={formData.nome}
                      onChange={e => setFormData({ ...formData, nome: e.target.value })}
                      placeholder="Nome completo de registro civil"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Sigla do Partido *</label>
                    <input
                      type="text"
                      required
                      value={formData.sigla}
                      onChange={e => setFormData({ ...formData, sigla: e.target.value.toUpperCase() })}
                      placeholder="Ex: PT, PL, MDB, PDT"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nome do Partido</label>
                    <input
                      type="text"
                      value={formData.partido}
                      onChange={e => setFormData({ ...formData, partido: e.target.value })}
                      placeholder="Ex: PARTIDO LIBERAL"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Coligação / Federação</label>
                  <input
                    type="text"
                    value={formData.coligacao}
                    onChange={e => setFormData({ ...formData, coligacao: e.target.value })}
                    placeholder="Ex: BRASIL PARA TODOS / PARTIDO ISOLADO"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">URL da Foto Oficial</label>
                  <input
                    type="text"
                    value={formData.fotoUrl}
                    onChange={e => setFormData({ ...formData, fotoUrl: e.target.value })}
                    placeholder="/fotos/exemplo.jpg ou https://..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
                  />
                </div>

                {/* Vice / Suplente Section */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <h4 className="text-xs font-extrabold text-slate-800">Vice / 1º Suplente da Chapa</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Nome de Urna do Vice</label>
                      <input
                        type="text"
                        value={formData.viceNomeUrna}
                        onChange={e => setFormData({ ...formData, viceNomeUrna: e.target.value.toUpperCase() })}
                        placeholder="Ex: GERALDO ALCKMIN"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Sigla do Partido do Vice</label>
                      <input
                        type="text"
                        value={formData.viceSigla}
                        onChange={e => setFormData({ ...formData, viceSigla: e.target.value.toUpperCase() })}
                        placeholder="Ex: PSB"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-[#0B3D91] hover:bg-[#123F8F] text-white text-xs font-bold shadow-md transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Cadastrar Candidato'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Confirmar Exclusão */}
      <AnimatePresence>
        {deleteConfirmCand && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Excluir Candidato</h3>
              <p className="text-xs text-slate-500 mt-2">
                Tem certeza que deseja excluir o candidato <strong className="text-slate-800">{deleteConfirmCand.nomeUrna}</strong> (Nº {deleteConfirmCand.numero} - {deleteConfirmCand.sigla}) da base de dados?
              </p>
              <div className="flex items-center justify-center gap-3 mt-6">
                <button
                  onClick={() => setDeleteConfirmCand(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteCand}
                  disabled={isDeleting}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {isDeleting ? 'Excluindo...' : 'Confirmar Exclusão'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
