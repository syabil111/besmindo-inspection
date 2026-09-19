import { useState, useEffect } from 'react';
import { masterDataAPI } from '../../../services/api';
import { PlusIcon, EditIcon, TrashIcon, SearchIcon } from '../../../components/Icons';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    code: ''
  });

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const response = await masterDataAPI.getDepartments();
      setDepartments(response.data.data || []);
    } catch (error) {
      console.error('Failed to load departments:', error);
      alert('Gagal memuat data department');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (dept = null) => {
    if (dept) {
      setEditingDept(dept);
      setFormData({
        name: dept.name,
        code: dept.code || ''
      });
    } else {
      setEditingDept(null);
      setFormData({ name: '', code: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingDept(null);
    setFormData({ name: '', code: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Nama department wajib diisi');
      return;
    }

    try {
      if (editingDept) {
        await masterDataAPI.updateDepartment(editingDept.id, formData);
        alert('Department berhasil diperbarui');
      } else {
        await masterDataAPI.createDepartment(formData);
        alert('Department berhasil ditambahkan');
      }
      handleCloseModal();
      loadDepartments();
    } catch (error) {
      console.error('Save error:', error);
      alert('Gagal menyimpan department');
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Yakin ingin menghapus department "${name}"?`)) return;
    
    try {
      await masterDataAPI.deleteDepartment(id);
      alert('Department berhasil dihapus');
      loadDepartments();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Gagal menghapus department');
    }
  };

  const filteredDepts = departments.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    (d.code || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Department / Rig</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola data master department dan rig
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center space-x-2 bg-[#1E4B8E] hover:bg-[#163A6E] text-white px-4 py-2 rounded-lg font-medium transition"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Tambah Department</span>
        </button>
      </div>

      <div className="bg-white rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari department..."
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E4B8E] focus:outline-none"
          />
          <SearchIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-100 dark:border-gray-800">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Nama Department</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Kode</th>
                <th className="py-3 px-4 text-center text-sm font-semibold text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan="3" className="py-12 text-center text-gray-500 dark:text-gray-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E4B8E] mx-auto mb-2"></div>
                    <p className="text-sm">Memuat data...</p>
                  </td>
                </tr>
              ) : filteredDepts.length === 0 ? (
                <tr>
                  <td colSpan="3" className="py-12 text-center text-gray-500 dark:text-gray-400">
                    {search ? 'Tidak ada department yang cocok.' : 'Belum ada data department.'}
                  </td>
                </tr>
              ) : (
                filteredDepts.map((dept) => (
                  <tr key={dept.id} className="hover:bg-gray-50">
                    <td className="py-3.5 px-5">
                      <span className="font-medium text-gray-900">{dept.name}</span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {dept.code || '-'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleOpenModal(dept)}
                          className="p-2 text-gray-600 hover:text-[#1E4B8E] hover:bg-blue-50 rounded"
                        >
                          <EditIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(dept.id, dept.name)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {editingDept ? 'Edit Department' : 'Tambah Department'}
              </h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 dark:text-gray-300">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Department <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Rig Operation & Earthmoving"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E4B8E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kode Department
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="Contoh: RIG-OPS"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E4B8E] focus:outline-none font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">Opsional</p>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1E4B8E] hover:bg-[#163A6E] text-white rounded-lg font-medium"
                >
                  {editingDept ? 'Simpan' : 'Tambah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;

