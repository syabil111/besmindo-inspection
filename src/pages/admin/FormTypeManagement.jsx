import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import {
  PlusIcon,
  EditIcon,
  TrashIcon,
  SearchIcon
} from '../../components/Icons';

const FormTypeManagement = () => {
  const [formTypes, setFormTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFormType, setEditingFormType] = useState(null);
  const [search, setSearch] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type_key: ''
  });

  useEffect(() => {
    loadFormTypes();
  }, []);

  const loadFormTypes = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getForms();
      setFormTypes(response.data.data || []);
    } catch (error) {
      console.error('Failed to load form types:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (formType = null) => {
    if (formType) {
      setEditingFormType(formType);
      setFormData({
        name: formType.name,
        code: formType.code,
        type_key: formType.type_key
      });
    } else {
      setEditingFormType(null);
      setFormData({
        name: '',
        code: '',
        type_key: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingFormType(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.code.trim() || !formData.type_key.trim()) {
      alert('Semua field wajib diisi.');
      return;
    }

    // Validate type_key format (lowercase, no spaces, alphanumeric + underscore)
    const typeKeyRegex = /^[a-z0-9_]+$/;
    if (!typeKeyRegex.test(formData.type_key)) {
      alert('Type Key hanya boleh huruf kecil, angka, dan underscore (_). Contoh: crane_mobile, forklift_3t');
      return;
    }

    try {
      if (editingFormType) {
        await adminAPI.updateFormType(editingFormType.id, formData);
        alert('Jenis formulir berhasil diperbarui!');
      } else {
        await adminAPI.createFormType(formData);
        alert('Jenis formulir baru berhasil ditambahkan!');
      }
      handleCloseModal();
      loadFormTypes();
    } catch (error) {
      alert('Gagal menyimpan jenis formulir: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Yakin ingin menghapus jenis formulir "${name}"?\n\nPeringatan: Semua kategori checklist dan data inspeksi terkait akan terpengaruh!`)) return;
    
    try {
      await adminAPI.deleteFormType(id);
      alert('Jenis formulir berhasil dihapus.');
      loadFormTypes();
    } catch (error) {
      alert('Gagal menghapus jenis formulir: ' + (error.response?.data?.message || error.message));
    }
  };

  const filteredFormTypes = formTypes.filter(ft => 
    (ft.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (ft.code || '').toLowerCase().includes(search.toLowerCase()) ||
    (ft.type_key || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#162F5C] dark:text-white tracking-tight">Master Jenis Formulir Inspeksi</h1>
          <p className="text-xs text-[#6B7280] dark:text-gray-400 mt-0.5">
            Kelola jenis formulir inspeksi (Dozer, Bus, Crane, Forklift, dll). Formulir baru otomatis muncul di sistem.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center space-x-1.5 bg-[#162F5C] hover:bg-[#1E4B8E] text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-sm transition-all"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Tambah Jenis Formulir Baru</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama formulir, kode, atau type key..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-slate-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#1E4B8E] focus:outline-none"
          />
          <SearchIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-gray-800 text-slate-400 dark:text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-5">Nama Formulir</th>
                <th className="py-3.5 px-5">Kode Formulir</th>
                <th className="py-3.5 px-5">Type Key (URL)</th>
                <th className="py-3.5 px-5">Total Kategori</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-gray-500 dark:text-gray-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E4B8E] mx-auto"></div>
                    <p className="mt-2 text-xs">Memuat data...</p>
                  </td>
                </tr>
              ) : filteredFormTypes.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-gray-500 dark:text-gray-400">
                    {search ? 'Tidak ada formulir yang cocok dengan pencarian.' : 'Belum ada jenis formulir. Klik "Tambah Jenis Formulir Baru" untuk mulai.'}
                  </td>
                </tr>
              ) : (
                filteredFormTypes.map((formType) => (
                  <tr key={formType.id} className="hover:bg-slate-50/80 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-[#1E4B8E]">{formType.name}</div>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="font-mono text-[11px] text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {formType.code}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="font-mono text-[11px] font-semibold text-gray-800">
                        {formType.type_key}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-600 dark:text-gray-300">
                      {formType.category_count || 0} kategori
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => handleOpenModal(formType)}
                          className="p-1.5 text-gray-600 hover:text-[#1E4B8E] hover:bg-blue-50 rounded"
                          title="Edit Formulir"
                        >
                          <EditIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(formType.id, formType.name)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Hapus Formulir"
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

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900">
        <div className="flex items-start space-x-3">
          <span className="text-2xl">💡</span>
          <div>
            <p className="font-bold mb-1">Tips Penambahan Jenis Formulir Baru:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li><strong>Nama Formulir:</strong> Contoh: "Crane Mobile 50T", "Forklift 3 Ton", "Excavator Komatsu"</li>
              <li><strong>Kode Formulir:</strong> Format PT.BESMINDO, Contoh: "BMSD/05/FO/HSE/01/24"</li>
              <li><strong>Type Key:</strong> Unik, huruf kecil + underscore. Contoh: "crane_mobile", "forklift_3t", "excavator"</li>
            </ul>
            <p className="mt-2 text-blue-700">
              Setelah ditambahkan, formulir baru otomatis muncul di: Dropdown Operator, Tab Formulir Admin, dan Filter Kendaraan!
            </p>
          </div>
        </div>
      </div>

      {/* Modal Add / Edit Form Type */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-200 max-w-lg w-full p-6">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-3 mb-4">
              <h3 className="font-bold text-base text-[#1A1A2E]">
                {editingFormType ? 'Edit Jenis Formulir' : 'Tambah Jenis Formulir Baru'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">
                  Nama Formulir <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Crane Mobile 50 Ton"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-slate-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#1E4B8E]/20 focus:border-[#1E4B8E] transition-all focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">
                  Kode Formulir PT. BESMINDO <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="Contoh: BMSD/05/FO/HSE/01/24"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-slate-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#1E4B8E]/20 focus:border-[#1E4B8E] transition-all focus:outline-none font-mono text-xs"
                />
                <p className="text-[10px] text-gray-500 mt-1">Format: BMSD/[No]/FO/[Dept]/[Seq]/[Year]</p>
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">
                  Type Key (URL Slug) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.type_key}
                  onChange={(e) => setFormData({ ...formData, type_key: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                  placeholder="Contoh: crane_mobile atau forklift_3t"
                  required
                  disabled={!!editingFormType}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-slate-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#1E4B8E]/20 focus:border-[#1E4B8E] transition-all focus:outline-none font-mono text-xs disabled:bg-gray-100"
                />
                <p className="text-[10px] text-gray-500 mt-1">
                  {editingFormType 
                    ? '⚠️ Type Key tidak bisa diubah setelah dibuat (untuk menjaga konsistensi data)'
                    : 'Unik, huruf kecil, angka, underscore. Spasi otomatis jadi underscore (_)'}
                </p>
              </div>


              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1E4B8E] hover:bg-[#2E6BC4] text-white rounded-md font-semibold"
                >
                  {editingFormType ? 'Simpan Perubahan' : 'Tambah Formulir'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormTypeManagement;

