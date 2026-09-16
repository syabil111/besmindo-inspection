import { useState, useEffect } from 'react';
import { masterDataAPI } from '../../../services/api';
import { PlusIcon, EditIcon, TrashIcon, SearchIcon } from '../../../components/Icons';

const AssetStatuses = () => {
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStatus, setEditingStatus] = useState(null);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    color: 'gray'
  });

  useEffect(() => {
    loadStatuses();
  }, []);

  const loadStatuses = async () => {
    try {
      setLoading(true);
      const response = await masterDataAPI.getAssetStatuses();
      setStatuses(response.data.data || []);
    } catch (error) {
      console.error('Failed to load asset statuses:', error);
      alert('Gagal memuat data status asset');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (status = null) => {
    if (status) {
      setEditingStatus(status);
      setFormData({
        name: status.name,
        color: status.color || 'gray'
      });
    } else {
      setEditingStatus(null);
      setFormData({ name: '', color: 'gray' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingStatus(null);
    setFormData({ name: '', color: 'gray' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Nama status wajib diisi');
      return;
    }

    try {
      if (editingStatus) {
        await masterDataAPI.updateAssetStatus(editingStatus.id, formData);
        alert('Status asset berhasil diperbarui');
      } else {
        await masterDataAPI.createAssetStatus(formData);
        alert('Status asset berhasil ditambahkan');
      }
      handleCloseModal();
      loadStatuses();
    } catch (error) {
      console.error('Save error:', error);
      alert('Gagal menyimpan status asset');
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Yakin ingin menghapus status "${name}"?`)) return;
    
    try {
      await masterDataAPI.deleteAssetStatus(id);
      alert('Status asset berhasil dihapus');
      loadStatuses();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Gagal menghapus status asset');
    }
  };

  const filteredStatuses = statuses.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const getColorBadge = (color) => {
    const colorMap = {
      green: 'bg-green-100 text-green-700 border-green-300',
      yellow: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      orange: 'bg-orange-100 text-orange-700 border-orange-300',
      red: 'bg-red-100 text-red-700 border-red-300',
      gray: 'bg-gray-100 text-gray-700 border-gray-300'
    };
    return colorMap[color] || colorMap.gray;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Status Asset Armada</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola data master status asset kendaraan
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center space-x-2 bg-[#1E4B8E] hover:bg-[#163A6E] text-white px-4 py-2 rounded-lg font-medium transition"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Tambah Status</span>
        </button>
      </div>

      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari status asset..."
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E4B8E] focus:outline-none"
          />
          <SearchIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Nama Status</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Warna</th>
                <th className="py-3 px-4 text-center text-sm font-semibold text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="3" className="py-12 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E4B8E] mx-auto mb-2"></div>
                    <p className="text-sm">Memuat data...</p>
                  </td>
                </tr>
              ) : filteredStatuses.length === 0 ? (
                <tr>
                  <td colSpan="3" className="py-12 text-center text-gray-500">
                    {search ? 'Tidak ada status yang cocok.' : 'Belum ada data status asset.'}
                  </td>
                </tr>
              ) : (
                filteredStatuses.map((status) => (
                  <tr key={status.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="font-medium text-gray-900">{status.name}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getColorBadge(status.color)}`}>
                        {status.color}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleOpenModal(status)}
                          className="p-2 text-gray-600 hover:text-[#1E4B8E] hover:bg-blue-50 rounded"
                        >
                          <EditIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(status.id, status.name)}
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
                {editingStatus ? 'Edit Status Asset' : 'Tambah Status Asset'}
              </h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Status <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Operasional"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E4B8E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Warna Status
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {['green', 'yellow', 'orange', 'red', 'gray'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`h-10 rounded-lg border-2 transition ${
                        formData.color === color
                          ? 'border-[#1E4B8E] ring-2 ring-[#1E4B8E]/20'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${
                        color === 'green' ? 'bg-green-500' :
                        color === 'yellow' ? 'bg-yellow-500' :
                        color === 'orange' ? 'bg-orange-500' :
                        color === 'red' ? 'bg-red-500' :
                        'bg-gray-500'
                      }`}
                      title={color}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">Pilih warna untuk visualisasi status</p>
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
                  {editingStatus ? 'Simpan' : 'Tambah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetStatuses;

