import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import {
  UsersIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  CheckIcon,
  CrossIcon,
  SearchIcon,
  CheckCircleIcon
} from '../../components/Icons';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, pending, admin, operator
  const [search, setSearch] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form states
  const [addForm, setAddForm] = useState({
    name: '',
    username: '',
    password: '',
    phone: '',
    role: 'operator',
    status: 'active'
  });
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    role: 'operator',
    status: 'active'
  });
  const [resetPasswordVal, setResetPasswordVal] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getUsers();
      setUsers(res.data.data || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, name) => {
    if (!confirm(`Setujui pendaftaran operator "${name}"?`)) return;
    try {
      await adminAPI.approveUser(id);
      alert(`Operator ${name} berhasil disetujui!`);
      loadUsers();
    } catch (error) {
      alert('Gagal menyetujui user: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleReject = async (id, name) => {
    if (!confirm(`Tolak pendaftaran operator "${name}"? Data akan dihapus.`)) return;
    try {
      await adminAPI.rejectUser(id);
      alert(`Pendaftaran operator ${name} ditolak.`);
      loadUsers();
    } catch (error) {
      alert('Gagal menolak user: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!addForm.name || !addForm.username || !addForm.password) {
      alert('Nama, username, dan password wajib diisi.');
      return;
    }
    try {
      await adminAPI.createUser(addForm);
      alert('User baru berhasil dibuat.');
      setShowAddModal(false);
      setAddForm({ name: '', username: '', password: '', phone: '', role: 'operator', status: 'active' });
      loadUsers();
    } catch (err) {
      alert('Gagal membuat user: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      phone: user.phone || '',
      role: user.role,
      status: user.status
    });
    setShowEditModal(true);
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.updateUser(selectedUser.id, editForm);
      alert('Data user berhasil diperbarui.');
      setShowEditModal(false);
      loadUsers();
    } catch (err) {
      alert('Gagal memperbarui user: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleOpenReset = (user) => {
    setSelectedUser(user);
    setResetPasswordVal('');
    setShowResetModal(true);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (resetPasswordVal.length < 6) {
      alert('Password baru minimal 6 karakter.');
      return;
    }
    try {
      await adminAPI.resetPassword(selectedUser.id, { newPassword: resetPasswordVal });
      alert(`Password untuk ${selectedUser.name} berhasil direset!`);
      setShowResetModal(false);
    } catch (err) {
      alert('Gagal reset password: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteUser = async (user) => {
    if (!confirm(`Hapus akun "${user.name}" (@${user.username})? Tindakan ini tidak dapat dibatalkan.`)) return;
    try {
      await adminAPI.deleteUser(user.id);
      alert('Akun berhasil dihapus.');
      loadUsers();
    } catch (err) {
      alert('Gagal menghapus user: ' + (err.response?.data?.message || err.message));
    }
  };

  // Filter users based on activeTab and search
  const pendingCount = users.filter(u => u.status === 'pending').length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const operatorCount = users.filter(u => u.role === 'operator' && u.status !== 'pending').length;

  const filteredUsers = users.filter(u => {
    const matchSearch = (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.username || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.phone || '').toLowerCase().includes(search.toLowerCase());

    if (activeTab === 'pending') return matchSearch && u.status === 'pending';
    if (activeTab === 'admin') return matchSearch && u.role === 'admin';
    if (activeTab === 'operator') return matchSearch && u.role === 'operator';
    return matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E] tracking-tight">Manajemen Pengguna</h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Persetujuan registrasi operator baru, hak akses admin, dan pengelolaan akun staf PT. BESMINDO
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center space-x-1.5 bg-[#1E4B8E] hover:bg-[#2E6BC4] text-white px-4 py-2 rounded-md text-xs font-semibold shadow-sm transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Tambah Pengguna Baru</span>
        </button>
      </div>

      {/* Tabs Navigasi & Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.05)] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-2 border-b md:border-b-0 border-gray-200 pb-2 md:pb-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'all'
                ? 'bg-[#1E4B8E] text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Semua User ({users.length})
          </button>

          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
              activeTab === 'pending'
                ? 'bg-[#D97706] text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>Menunggu Approve</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-500 text-white font-bold">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'admin'
                ? 'bg-[#1E4B8E] text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Admin ({adminCount})
          </button>

          <button
            onClick={() => setActiveTab('operator')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'operator'
                ? 'bg-[#1E4B8E] text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Operator ({operatorCount})
          </button>
        </div>

        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, username, HP..."
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-[#1E4B8E] focus:outline-none"
          />
          <SearchIcon className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Tabel Users */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-[#6B7280] font-semibold">
                <th className="py-3 px-4">Nama Lengkap</th>
                <th className="py-3 px-4">Username</th>
                <th className="py-3 px-4">No. HP</th>
                <th className="py-3 px-4">Peran / Role</th>
                <th className="py-3 px-4">Status Akun</th>
                <th className="py-3 px-4">Tanggal Terdaftar</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E4B8E] mx-auto"></div>
                    <p className="mt-2 text-xs">Memuat data pengguna...</p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-gray-500">
                    Tidak ada data pengguna yang sesuai.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-[#1A1A2E]">
                      {u.name}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-700">
                      @{u.username}
                    </td>
                    <td className="py-3.5 px-4 text-gray-600">
                      {u.phone || '-'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {u.status === 'active' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                          <CheckCircleIcon className="w-3 h-3 mr-1" /> Aktif
                        </span>
                      )}
                      {u.status === 'pending' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 animate-pulse">
                          Menunggu Approval
                        </span>
                      )}
                      {u.status === 'inactive' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600">
                          Nonaktif
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-gray-500">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString('id-ID') : '-'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        {u.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleApprove(u.id, u.name)}
                              className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-[11px] font-bold transition-colors shadow-xs"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(u.id, u.name)}
                              className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[11px] font-bold transition-colors shadow-xs"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleOpenEdit(u)}
                              className="p-1 text-gray-600 hover:text-[#1E4B8E] hover:bg-blue-50 rounded"
                              title="Edit Data User"
                            >
                              <EditIcon className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenReset(u)}
                              className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-[10px] font-semibold"
                              title="Reset Password"
                            >
                              Reset Pass
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u)}
                              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                              title="Hapus Akun"
                            >
                              <TrashIcon className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add User */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 text-xs">
            <h3 className="font-bold text-sm text-[#1A1A2E] mb-3 pb-2 border-b border-gray-100">
              Tambah Pengguna Baru
            </h3>
            <form onSubmit={handleAddUser} className="space-y-3">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  placeholder="Contoh: Ahmad Yani"
                  required
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#1E4B8E] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Username Login</label>
                <input
                  type="text"
                  value={addForm.username}
                  onChange={(e) => setAddForm({ ...addForm, username: e.target.value })}
                  placeholder="Contoh: ahmadyani"
                  required
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#1E4B8E] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Password Awal</label>
                <input
                  type="password"
                  value={addForm.password}
                  onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                  placeholder="Minimal 6 karakter"
                  required
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#1E4B8E] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">No. HP (WhatsApp)</label>
                <input
                  type="text"
                  value={addForm.phone}
                  onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                  placeholder="Contoh: 081234567890"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#1E4B8E] focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Peran / Role</label>
                  <select
                    value={addForm.role}
                    onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#1E4B8E] focus:outline-none"
                  >
                    <option value="operator">Operator Lapangan</option>
                    <option value="admin">Administrator HSE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Status Akun</label>
                  <select
                    value={addForm.status}
                    onChange={(e) => setAddForm({ ...addForm, status: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#1E4B8E] focus:outline-none"
                  >
                    <option value="active">Aktif Langsung</option>
                    <option value="pending">Pending</option>
                    <option value="inactive">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 border border-gray-300 rounded text-gray-600 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#1E4B8E] hover:bg-[#2E6BC4] text-white rounded font-semibold"
                >
                  Simpan User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit User */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 text-xs">
            <h3 className="font-bold text-sm text-[#1A1A2E] mb-3 pb-2 border-b border-gray-100">
              Edit Data User (@{selectedUser.username})
            </h3>
            <form onSubmit={handleEditUser} className="space-y-3">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#1E4B8E] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">No. HP</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#1E4B8E] focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Role</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#1E4B8E] focus:outline-none"
                  >
                    <option value="operator">Operator</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#1E4B8E] focus:outline-none"
                  >
                    <option value="active">Aktif</option>
                    <option value="pending">Pending</option>
                    <option value="inactive">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-3 py-1.5 border border-gray-300 rounded text-gray-600 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#1E4B8E] hover:bg-[#2E6BC4] text-white rounded font-semibold"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Reset Password */}
      {showResetModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-5 text-xs">
            <h3 className="font-bold text-sm text-[#1A1A2E] mb-2">
              Reset Password User
            </h3>
            <p className="text-gray-500 mb-3">
              Masukkan password baru untuk akun <strong>{selectedUser.name}</strong> (@{selectedUser.username}):
            </p>
            <form onSubmit={handleResetPassword} className="space-y-3">
              <div>
                <input
                  type="password"
                  value={resetPasswordVal}
                  onChange={(e) => setResetPasswordVal(e.target.value)}
                  placeholder="Password baru (min. 6 karakter)"
                  required
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#1E4B8E] focus:outline-none"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="px-3 py-1.5 border border-gray-300 rounded text-gray-600 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#1E4B8E] hover:bg-[#2E6BC4] text-white rounded font-semibold"
                >
                  Reset Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
