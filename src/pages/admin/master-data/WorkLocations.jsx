import { useState, useEffect } from 'react';
import { masterDataAPI } from '../../../services/api';
import { PlusIcon, EditIcon, TrashIcon, SearchIcon } from '../../../components/Icons';

const WorkLocations = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    location_type: ''
  });

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      setLoading(true);
      const response = await masterDataAPI.getWorkLocations();
      setLocations(response.data.data || []);
    } catch (error) {
      console.error('Failed to load work locations:', error);
      alert('Gagal memuat data lokasi kerja');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (location = null) => {
    if (location) {
      setEditingLocation(location);
      setFormData({
        name: location.name,
        location_type: location.location_type || ''
      });
    } else {
      setEditingLocation(null);
      setFormData({ name: '', location_type: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingLocation(null);
    setFormData({ name: '', location_type: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Nama lokasi wajib diisi');
      return;
    }

    try {
      if (editingLocation) {
        await masterDataAPI.updateWorkLocation(editingLocation.id, formData);
        alert('Lokasi kerja berhasil diperbarui');
      } else {
        await masterDataAPI.createWorkLocation(formData);
        alert('Lokasi kerja berhasil ditambahkan');
      }
      handleCloseModal();
      loadLocations();
    } catch (error) {
      console.error('Save error:', error);
      alert('Gagal menyimpan lokasi kerja');
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Yakin ingin menghapus lokasi "${name}"?`)) return;
    
    try {
      await masterDataAPI.deleteWorkLocation(id);
      alert('Lokasi kerja berhasil dihapus');
      loadLocations();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Gagal menghapus lokasi kerja');
    }
  };

  const filteredLocations = locations.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    (l.location_type || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lokasi Kerja</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola data master lokasi kerja unit
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center space-x-2 bg-[#1E4B8E] hover:bg-[#163A6E] text-white px-4 py-2 rounded-lg font-medium transition"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Tambah Lokasi</span>
        </button>
      </div>

      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari lokasi kerja..."
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
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Nama Lokasi</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Tipe Lokasi</th>
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
              ) : filteredLocations.length === 0 ? (
                <tr>
                  <td colSpan="3" className="py-12 text-center text-gray-500">
                    {search ? 'Tidak ada lokasi yang cocok.' : 'Belum ada data lokasi kerja.'}
                  </td>
                </tr>
              ) : (
                filteredLocations.map((location) => (
                  <tr key={location.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="font-medium text-gray-900">{location.name}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600 capitalize">{location.location_type || '-'}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleOpenModal(location)}
                          className="p-2 text-gray-600 hover:text-[#1E4B8E] hover:bg-blue-50 rounded"
                        >
                          <EditIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(location.id, location.name)}
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
                {editingLocation ? 'Edit Lokasi Kerja' : 'Tambah Lokasi Kerja'}
              </h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lokasi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Yard / Basecamp Operasional"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E4B8E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipe Lokasi
                </label>
                <select
                  value={formData.location_type}
                  onChange={(e) => setFormData({ ...formData, location_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E4B8E] focus:outline-none"
                >
                  <option value="">Pilih tipe...</option>
                  <option value="yard">Yard</option>
                  <option value="field">Field</option>
                  <option value="workshop">Workshop</option>
                  <option value="office">Office</option>
                </select>
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
                  {editingLocation ? 'Simpan' : 'Tambah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkLocations;

