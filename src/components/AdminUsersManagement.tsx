import React, { useState, useEffect } from 'react';
import { UsuarioPerfil } from '../types';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Shield,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  RefreshCw,
  Mail,
  MapPin,
  Calendar,
  Lock,
  Eye,
  Check,
  X,
  AlertTriangle,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const UFS = [
  'TODOS', 'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN',
  'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO'
];

export const AdminUsersManagement: React.FC = () => {
  const [usuarios, setUsuarios] = useState<UsuarioPerfil[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [busca, setBusca] = useState('');
  const [filtroUf, setFiltroUf] = useState('TODOS');
  const [filtroRole, setFiltroRole] = useState<'todos' | 'admin' | 'eleitor'>('todos');
  const [filtroStatus, setFiltroStatus] = useState<'TODOS' | 'ATIVO' | 'BLOQUEADO'>('TODOS');
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    totalEleitores: 0,
    totalAdmins: 0,
    totalVerificados: 0,
    ufsAtivas: 0
  });

  // Modal Novo / Edição
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUid, setEditingUid] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    sexo: 'MASCULINO' as 'MASCULINO' | 'FEMININO' | 'OUTRO' | 'NAO_INFORMADO',
    dtNascimento: '1995-05-10',
    idade: 29,
    celular: '(91) 99615-6672',
    municipio: 'Belém',
    uf: 'PA',
    isAdmin: false,
    status: 'ATIVO' as 'ATIVO' | 'BLOQUEADO' | 'PENDENTE'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  // Modal de Exclusão
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<UsuarioPerfil | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    carregarUsuarios();
  }, [busca, filtroUf, filtroRole, filtroStatus]);

  const carregarUsuarios = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (busca) params.append('busca', busca);
      if (filtroUf !== 'TODOS') params.append('uf', filtroUf);
      if (filtroRole !== 'todos') params.append('role', filtroRole);
      if (filtroStatus !== 'TODOS') params.append('status', filtroStatus);

      const res = await fetch(`/api/v1/admin/usuarios?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setUsuarios(data.usuarios || []);
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
    setEditingUid(null);
    setFormData({
      nome: '',
      email: '',
      sexo: 'MASCULINO',
      dtNascimento: '1995-05-10',
      idade: 29,
      celular: '',
      municipio: 'Belém',
      uf: 'PA',
      isAdmin: false,
      status: 'ATIVO'
    });
    setFeedbackMsg(null);
    setShowModal(true);
  };

  const handleOpenEdit = (u: UsuarioPerfil) => {
    setIsEditing(true);
    setEditingUid(u.uid);
    setFormData({
      nome: u.nome,
      email: u.email,
      sexo: u.sexo || 'MASCULINO',
      dtNascimento: u.dtNascimento || '1995-05-10',
      idade: u.idade || 28,
      celular: u.celular || '',
      municipio: u.municipio || 'Belém',
      uf: u.uf || 'PA',
      isAdmin: Boolean(u.isAdmin),
      status: u.status || 'ATIVO'
    });
    setFeedbackMsg(null);
    setShowModal(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome.trim() || !formData.email.trim()) {
      setFeedbackMsg({ tipo: 'erro', texto: 'Preencha o nome e e-mail do usuário.' });
      return;
    }

    setIsSubmitting(true);
    setFeedbackMsg(null);

    try {
      const url = isEditing && editingUid ? `/api/v1/admin/usuarios/${editingUid}` : '/api/v1/admin/usuarios';
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
          texto: isEditing ? 'Usuário atualizado com sucesso!' : 'Novo usuário cadastrado com sucesso!'
        });
        carregarUsuarios();
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

  const handleToggleAdmin = async (u: UsuarioPerfil) => {
    try {
      const res = await fetch(`/api/v1/admin/usuarios/${u.uid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAdmin: !u.isAdmin })
      });
      if (res.ok) {
        carregarUsuarios();
      }
    } catch {}
  };

  const handleToggleStatus = async (u: UsuarioPerfil) => {
    const nextStatus = (u.status || 'ATIVO') === 'ATIVO' ? 'BLOQUEADO' : 'ATIVO';
    try {
      const res = await fetch(`/api/v1/admin/usuarios/${u.uid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        carregarUsuarios();
      }
    } catch {}
  };

  const handleDeleteUser = async () => {
    if (!deleteConfirmUser) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/v1/admin/usuarios/${deleteConfirmUser.uid}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setDeleteConfirmUser(null);
        carregarUsuarios();
      }
    } catch {}
    finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total de Usuários</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0B3D91] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{stats.totalUsuarios}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Cadastros ativos na plataforma</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Eleitores Ativos</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{stats.totalEleitores}</div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Habilitados para votar</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Administradores</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{stats.totalAdmins}</div>
          <span className="text-[11px] text-amber-600 font-semibold mt-1 block">Acesso ao painel de gestão</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Verificados com CPF</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{stats.totalVerificados}</div>
          <span className="text-[11px] text-purple-600 font-semibold mt-1 block">Hash criptográfico auditado</span>
        </div>
      </div>

      {/* Action Bar & Filters */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por nome, e-mail, CPF ou município..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20 focus:bg-white transition-all"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* UF */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500">UF:</span>
            <select
              value={filtroUf}
              onChange={e => setFiltroUf(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20 cursor-pointer"
            >
              {UFS.map(uf => (
                <option key={uf} value={uf}>
                  {uf === 'TODOS' ? 'Todos os Estados' : uf}
                </option>
              ))}
            </select>
          </div>

          {/* Role */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500">Perfil:</span>
            <select
              value={filtroRole}
              onChange={e => setFiltroRole(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20 cursor-pointer"
            >
              <option value="todos">Todos</option>
              <option value="admin">Administrador</option>
              <option value="eleitor">Eleitor</option>
            </select>
          </div>

          {/* Status */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500">Status:</span>
            <select
              value={filtroStatus}
              onChange={e => setFiltroStatus(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20 cursor-pointer"
            >
              <option value="TODOS">Todos</option>
              <option value="ATIVO">Ativo</option>
              <option value="BLOQUEADO">Bloqueado</option>
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={carregarUsuarios}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
            title="Atualizar lista"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          {/* Add User Button */}
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 bg-[#0B3D91] hover:bg-[#123F8F] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer active:scale-95 ml-auto sm:ml-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Novo Usuário</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
            Listagem de Usuários e Eleitores ({usuarios.length})
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Padrão LGPD com hash de documento
          </span>
        </div>

        {isLoading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : usuarios.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <div className="text-base font-bold text-slate-700">Nenhum usuário encontrado</div>
            <p className="text-xs text-slate-500 mt-1">
              Altere os filtros de busca ou cadastre um novo usuário.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Usuário / Eleitor</th>
                  <th className="py-3.5 px-4">E-mail</th>
                  <th className="py-3.5 px-4">CPF (LGPD)</th>
                  <th className="py-3.5 px-4">Localidade</th>
                  <th className="py-3.5 px-4">Perfil</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usuarios.map(u => {
                  const isBlocked = (u.status || 'ATIVO') === 'BLOQUEADO';
                  return (
                    <tr key={u.uid} className={`hover:bg-slate-50/80 transition-colors ${isBlocked ? 'opacity-60 bg-rose-50/10' : ''}`}>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                            u.isAdmin
                              ? 'bg-amber-500 text-white'
                              : 'bg-[#0B3D91] text-white'
                          }`}>
                            {u.nome.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900 text-sm">{u.nome}</div>
                            <div className="text-[11px] text-slate-400">
                              {u.celular || 'Sem telefone'} • {u.idade ? `${u.idade} anos` : 'Idade N/I'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-medium text-slate-700">
                        {u.email}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono text-xs text-slate-700 font-bold bg-slate-100 px-2 py-0.5 rounded-md">
                          {u.cpfMascarado || '***.***.***-**'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{u.municipio ? `${u.municipio} - ${u.uf}` : u.uf}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {u.isAdmin ? (
                          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full font-black text-[10px] border border-amber-300">
                            <Shield className="w-3 h-3 text-amber-700" />
                            <span>ADMIN</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold text-[10px] border border-emerald-200">
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>ELEITOR</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {isBlocked ? (
                          <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-bold text-[10px]">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            <span>Bloqueado</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold text-[10px]">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Ativo</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Toggle Admin */}
                          <button
                            onClick={() => handleToggleAdmin(u)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              u.isAdmin
                                ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                            title={u.isAdmin ? 'Remover privilégio Admin' : 'Tornar Administrador'}
                          >
                            <Shield className="w-4 h-4" />
                          </button>

                          {/* Toggle Status */}
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isBlocked
                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                            }`}
                            title={isBlocked ? 'Desbloquear usuário' : 'Bloquear usuário'}
                          >
                            {isBlocked ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                            title="Editar usuário"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setDeleteConfirmUser(u)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                            title="Excluir usuário"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Criar / Editar Usuário */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-slate-100 relative"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#0B3D91] text-white flex items-center justify-center font-bold">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">
                      {isEditing ? 'Editar Usuário' : 'Cadastrar Novo Usuário'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Preencha os dados cadastrais e permissões do usuário
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nome Completo *</label>
                    <input
                      type="text"
                      required
                      value={formData.nome}
                      onChange={e => setFormData({ ...formData, nome: e.target.value })}
                      placeholder="Ex: Carlos Eduardo Lima"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">E-mail *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder="carlos@exemplo.com.br"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Telefone / WhatsApp</label>
                    <input
                      type="text"
                      value={formData.celular}
                      onChange={e => setFormData({ ...formData, celular: e.target.value })}
                      placeholder="(91) 99999-9999"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Estado (UF)</label>
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
                    <label className="block text-xs font-bold text-slate-700 mb-1">Município</label>
                    <input
                      type="text"
                      value={formData.municipio}
                      onChange={e => setFormData({ ...formData, municipio: e.target.value })}
                      placeholder="Ex: Belém"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Sexo Biológico</label>
                    <select
                      value={formData.sexo}
                      onChange={e => setFormData({ ...formData, sexo: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20 cursor-pointer"
                    >
                      <option value="MASCULINO">Masculino</option>
                      <option value="FEMININO">Feminino</option>
                      <option value="OUTRO">Outro / Prefere não informar</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Idade</label>
                    <input
                      type="number"
                      value={formData.idade}
                      onChange={e => setFormData({ ...formData, idade: Number(e.target.value) })}
                      min={16}
                      max={120}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
                    />
                  </div>
                </div>

                {/* Permissions & Status */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-extrabold text-slate-800">Privilégio de Administrador</div>
                      <div className="text-[11px] text-slate-500">Concede acesso total ao painel administrativo</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isAdmin}
                        onChange={e => setFormData({ ...formData, isAdmin: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0B3D91]"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                    <div>
                      <div className="text-xs font-extrabold text-slate-800">Status da Conta</div>
                      <div className="text-[11px] text-slate-500">Contas bloqueadas não podem acessar nem votar</div>
                    </div>
                    <select
                      value={formData.status}
                      onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                      className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
                    >
                      <option value="ATIVO">Ativo</option>
                      <option value="BLOQUEADO">Bloqueado</option>
                    </select>
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
                    {isSubmitting ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Cadastrar Usuário'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Confirmar Exclusão */}
      <AnimatePresence>
        {deleteConfirmUser && (
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
              <h3 className="text-lg font-black text-slate-900">Excluir Usuário</h3>
              <p className="text-xs text-slate-500 mt-2">
                Tem certeza que deseja excluir permanentemente o cadastro de <strong className="text-slate-800">{deleteConfirmUser.nome}</strong> ({deleteConfirmUser.email})?
              </p>
              <div className="flex items-center justify-center gap-3 mt-6">
                <button
                  onClick={() => setDeleteConfirmUser(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteUser}
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
