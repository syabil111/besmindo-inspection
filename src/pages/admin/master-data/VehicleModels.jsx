import { useState, useEffect } from 'react';
import { masterDataAPI } from '../../../services/api';
import { PlusIcon, EditIcon, TrashIcon, SearchIcon } from '../../../components/Icons';

const VehicleModels = () => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingModel, setEditingModel] = useState(null);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    category: ''
  });

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      setLoading(true);
      const response = await masterDataAPI.getVehicleModels();
      setModels(response.data.data || []);
    } catch (error) {
      console.error('Failed to load vehicle models:', error);
      alert('Gagal memuat data model kendaraan');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (model = null) => {
    if (model) {
      setEditingModel(model);
      setFormData({
        name: model.name,
        category: model.category || ''
      });
    } else {
      setEditingModel(null);
      setFormData({ name: '', category: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingModel(null);
    setFormData({ name: '', category: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Nama model wajib diisi');
      return;
    }

    try {
      if (editingModel) {
        await masterDataAPI.updateVehicleModel(editingModel.id, formData);
        alert('Model kendaraan berhasil diperbarui');
      } else {
        await masterDataAPI.createVehicleModel(formData);
        alert('Model kendaraan berhasil ditambahkan');
      }
      handleCloseModal();
      loadModels();
    } catch (error) {
      console.error('Save error:', error);
      alert('Gagal menyimpan model kendaraan');
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Yakin ingin menghapus model "${name}"?`)) return;
    
    try {
      await masterDataAPI.deleteVehicleModel(id);
      alert('Model kendaraan berhasil dihapus');
      loadModels();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Gagal menghapus model kendaraan');
    }
  };

  const filteredModels = models.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    (m.category || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Model Kendaraan</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola data master model kendaraan
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center space-x-2 bg-[#1E4B8E] hover:bg-[#163A6E] text-white px-4 py-2 rounded-lg font-medium transition"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Tambah Model</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari model kendaraan..."
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E4B8E] focus:outline-none"
          />
          <SearchIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-100 dark:border-gray-800">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Nama Model</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Kategori</th>
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
              ) : filteredModels.length === 0 ? (
                <tr>
                  <td colSpan="3" className="py-12 text-center text-gray-500 dark:text-gray-400">
                    {search ? 'Tidak ada model yang cocok dengan pencarian.' : 'Belum ada data model kendaraan.'}
                  </td>
                </tr>
              ) : (
                filteredModels.map((model) => (
                  <tr key={model.id} className="hover:bg-gray-50">
                    <td className="py-3.5 px-5">
                      <span className="font-medium text-gray-900">{model.name}</span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="text-sm text-gray-600 dark:text-gray-300">{model.category || '-'}</span>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleOpenModal(model)}
                          className="p-2 text-gray-600 hover:text-[#1E4B8E] hover:bg-blue-50 rounded"
                          title="Edit"
                        >
                          <EditIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(model.id, model.name)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Hapus"
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {editingModel ? 'Edit Model Kendaraan' : 'Tambah Model Kendaraan'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-300"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Model <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Komatsu D85"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E4B8E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Contoh: dozer, truck, bus"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E4B8E] focus:outline-none"
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
                  {editingModel ? 'Simpan' : 'Tambah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleModels;

