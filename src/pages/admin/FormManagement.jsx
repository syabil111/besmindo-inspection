import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import SearchableDropdown from '../../components/SearchableDropdown';
import {
  FormChecklistIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  ArrowUpDownIcon,
  CheckCircleIcon,
  MinusIcon,
  SearchIcon
} from '../../components/Icons';

const FormManagement = () => {
  const [formTypes, setFormTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [showItemModal, setShowItemModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [targetCategory, setTargetCategory] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [itemDescription, setItemDescription] = useState('');
  const [categoryName, setCategoryName] = useState('');

  useEffect(() => {
    loadFormTypes();
  }, []);

  useEffect(() => {
    if (selectedType) {
      loadCategories(selectedType);
    }
  }, [selectedType]);

  const loadFormTypes = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getForms();
      const types = res.data.data || [];
      setFormTypes(types);
      
      // Auto-select first form type
      if (types.length > 0 && !selectedType) {
        setSelectedType(types[0].type_key);
      }
    } catch (err) {
      console.error('Failed to load form types:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async (typeKey) => {
    try {
      setLoading(true);
      const res = await adminAPI.getFormCategories(typeKey);
      setCategories(res.data.data.categories || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddItem = (category) => {
    setTargetCategory(category);
    setEditingItem(null);
    setItemDescription('');
    setShowItemModal(true);
  };

  const handleOpenEditItem = (item) => {
    setEditingItem(item);
    setItemDescription(item.description);
    setShowItemModal(true);
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!itemDescription.trim()) return;

    try {
      if (editingItem) {
        await adminAPI.updateItem(editingItem.id, { description: itemDescription.trim() });
      } else {
        await adminAPI.addItem(targetCategory.id, {
          description: itemDescription.trim(),
          sort_order: (targetCategory.items?.length || 0) + 1
        });
      }
      setShowItemModal(false);
      loadCategories(selectedType);
    } catch (err) {
      alert('Gagal menyimpan item checklist.');
    }
  };

  const handleToggleItem = async (item) => {
    try {
      await adminAPI.toggleItem(item.id);
      loadCategories(selectedType);
    } catch (err) {
      alert('Gagal mengubah status item.');
    }
  };

  const handleDeleteItem = async (item) => {
    if (!confirm(`Hapus item "${item.description}"?`)) return;
    try {
      await adminAPI.deleteItem(item.id);
      loadCategories(selectedType);
    } catch (err) {
      alert('Gagal menghapus item.');
    }
  };

  const handleReorder = async (item, direction, categoryItems) => {
    const currentIdx = categoryItems.findIndex(i => i.id === item.id);
    const targetIdx = direction === 'up' ? currentIdx - 1 : currentIdx + 1;
    if (targetIdx < 0 || targetIdx >= categoryItems.length) return;

    const targetItem = categoryItems[targetIdx];
    try {
      await adminAPI.reorderItem(item.id, { sort_order: targetItem.sort_order });
      await adminAPI.reorderItem(targetItem.id, { sort_order: item.sort_order });
      loadCategories(selectedType);
    } catch (err) {
      alert('Gagal mengubah urutan.');
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) return;
    try {
      await adminAPI.addCategory(selectedType, {
        name: categoryName.trim(),
        sort_order: categories.length + 1
      });
      setCategoryName('');
      setShowCategoryModal(false);
      loadCategories(selectedType);
    } catch (err) {
      alert('Gagal menambah kategori.');
    }
  };

  const currentFormType = formTypes.find(ft => ft.type_key === selectedType);
  const formTypeOptions = formTypes.map(ft => ({
    value: ft.type_key,
    label: ft.name,
    sublabel: ft.code
  }));

  if (formTypes.length === 0 && !loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-12 text-center">
          <FormChecklistIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">Belum Ada Jenis Formulir</h3>
          <p className="text-sm text-gray-500 mb-6">
            Silakan tambahkan jenis formulir terlebih dahulu di menu <strong>Master Formulir</strong>
          </p>
          <button
            onClick={() => window.location.href = '/admin/form-types'}
            className="inline-flex items-center space-x-2 bg-[#1E4B8E] hover:bg-[#2E6BC4] text-white px-4 py-2 rounded-md text-sm font-semibold"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Buka Master Formulir</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E] tracking-tight">
            Kelola Formulir & Checklist Item
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Pengaturan standar checklist inspeksi harian per jenis alat/kendaraan PT. BESMINDO
          </p>
        </div>
        <button
          onClick={() => setShowCategoryModal(true)}
          className="inline-flex items-center space-x-1.5 bg-[#1E4B8E] hover:bg-[#2E6BC4] text-white px-4 py-2 rounded-md text-xs font-semibold shadow-sm transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Tambah Kategori Baru</span>
        </button>
      </div>

      {/* Dropdown Pemilihan Jenis Formulir dengan Search */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#E5E7EB] shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="w-full md:max-w-xl">
          <SearchableDropdown
            label="Pilih Jenis Formulir Inspeksi"
            options={formTypeOptions}
            value={selectedType}
            onChange={(val) => setSelectedType(val)}
            placeholder="-- Pilih Jenis Formulir Inspeksi --"
            searchPlaceholder="Ketik untuk mencari nama atau kode formulir..."
          />
        </div>
        {currentFormType && (
          <div className="flex items-center gap-3 bg-blue-50/80 border border-blue-200/80 px-4 py-3 rounded-xl text-xs self-start md:self-auto">
            <div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Kode Formulir</div>
              <div className="font-mono font-bold text-[#1E4B8E] text-xs mt-0.5">{currentFormType.code}</div>
            </div>
            <div className="h-7 w-[1px] bg-blue-200" />
            <div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Type Key</div>
              <div className="font-mono font-semibold text-gray-700 text-xs mt-0.5">{currentFormType.type_key}</div>
            </div>
          </div>
        )}
      </div>

      {/* Search Box untuk Cari Item Checklist */}
      <div className="bg-white rounded-xl p-4 border border-[#E5E7EB] shadow-sm">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Cari item checklist... (Contoh: lampu, ban, rem, oli, dll)"
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E4B8E] focus:border-[#1E4B8E] focus:outline-none"
          />
          <SearchIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="text-xs text-gray-500 mt-2">
            Menampilkan hasil pencarian untuk: <strong>"{searchQuery}"</strong>
          </p>
        )}
      </div>

      {/* Checklist per Kategori */}
      {loading ? (
        <div className="flex items-center justify-center h-64 bg-white rounded-xl border border-gray-200">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E4B8E]"></div>
        </div>
      ) : (
        <div className="space-y-5">
          {categories.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-xs text-gray-500">
              Belum ada kategori checklist untuk formulir ini.
            </div>
          ) : (
            categories.map((category) => {
              // Filter items berdasarkan search query
              const filteredItems = searchQuery
                ? (category.items || []).filter(item =>
                    item.description.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                : category.items || [];

              // Skip kategori jika tidak ada item yang match saat search
              if (searchQuery && filteredItems.length === 0) return null;

              return (
                <div key={category.id} className="bg-white rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                  <div className="p-4 bg-gray-50/70 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#1E4B8E]"></span>
                      <h3 className="font-bold text-xs uppercase tracking-wide text-[#1A1A2E]">
                        {category.name} ({searchQuery ? `${filteredItems.length} dari ${category.items?.length || 0}` : `${category.items?.length || 0}`} Item)
                      </h3>
                    </div>
                    <button
                      onClick={() => handleOpenAddItem(category)}
                      className="inline-flex items-center space-x-1 text-xs text-[#1E4B8E] hover:bg-blue-50 px-2.5 py-1 rounded font-semibold transition-colors"
                    >
                      <PlusIcon className="w-3.5 h-3.5" />
                      <span>Tambah Item ke Kategori Ini</span>
                    </button>
                  </div>

                <div className="divide-y divide-gray-100">
                  {filteredItems && filteredItems.length > 0 ? (
                    filteredItems.map((item, idx) => {
                      // Highlight search term
                      const highlightText = (text) => {
                        if (!searchQuery) return text;
                        const regex = new RegExp(`(${searchQuery})`, 'gi');
                        const parts = text.split(regex);
                        return parts.map((part, i) =>
                          regex.test(part) ? (
                            <mark key={i} className="bg-yellow-200 font-bold">{part}</mark>
                          ) : (
                            part
                          )
                        );
                      };

                      return (
                        <div
                          key={item.id}
                          className={`p-3.5 flex items-center justify-between hover:bg-gray-50/50 transition-colors text-xs ${
                            !item.is_active ? 'opacity-50 bg-gray-50/70' : ''
                          }`}
                        >
                          <div className="flex items-center space-x-3 flex-1 pr-4">
                            <span className="font-mono text-gray-400 w-6 text-center font-bold">
                              {idx + 1}.
                            </span>
                            <span className="font-medium text-gray-800">
                              {highlightText(item.description)}
                            </span>
                            {!item.is_active && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-gray-200 text-gray-600 font-bold">
                                Nonaktif
                              </span>
                            )}
                        </div>

                        <div className="flex items-center space-x-1">
                          {/* Reorder Buttons */}
                          <button
                            onClick={() => handleReorder(item, 'up', category.items)}
                            disabled={idx === 0}
                            className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded"
                            title="Pindah ke Atas"
                          >
                            ▲
                          </button>
                          <button
                            onClick={() => handleReorder(item, 'down', category.items)}
                            disabled={idx === category.items.length - 1}
                            className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded"
                            title="Pindah ke Bawah"
                          >
                            ▼
                          </button>

                          {/* Toggle Active */}
                          <button
                            onClick={() => handleToggleItem(item)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                              item.is_active
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            }`}
                            title="Klik untuk ubah status aktif/nonaktif"
                          >
                            {item.is_active ? 'Aktif' : 'Nonaktif'}
                          </button>

                          {/* Edit Item */}
                          <button
                            onClick={() => handleOpenEditItem(item)}
                            className="p-1.5 text-gray-500 hover:text-[#1E4B8E] hover:bg-blue-50 rounded"
                            title="Edit Deskripsi"
                          >
                            <EditIcon className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Item */}
                          <button
                            onClick={() => handleDeleteItem(item)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                            title="Hapus Item"
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                  ) : (
                    <div className="p-4 text-center text-xs text-gray-400">
                      {searchQuery
                        ? `Tidak ada item yang cocok dengan "${searchQuery}" di kategori ini.`
                        : 'Belum ada item checklist pada kategori ini.'}
                    </div>
                  )}
                </div>
              </div>
            );
          })
          )}
        </div>
      )}

      {/* Modal Item */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-200 max-w-md w-full p-5 text-xs">
            <h3 className="font-bold text-sm text-[#1A1A2E] mb-3 pb-2 border-b border-gray-100">
              {editingItem ? 'Edit Item Checklist' : `Tambah Item Checklist ke "${targetCategory?.name}"`}
            </h3>
            <form onSubmit={handleSaveItem} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Deskripsi Item Pemeriksaan</label>
                <textarea
                  rows="3"
                  value={itemDescription}
                  onChange={(e) => setItemDescription(e.target.value)}
                  placeholder="Contoh: Sabuk Pengaman Operator / Kaca Spion Kiri & Kanan"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E4B8E]/20 focus:border-[#1E4B8E] transition-all focus:outline-none"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="px-3 py-1.5 border border-gray-300 rounded text-gray-600 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#1E4B8E] hover:bg-[#2E6BC4] text-white rounded font-semibold"
                >
                  Simpan Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Category */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-200 max-w-md w-full p-5 text-xs">
            <h3 className="font-bold text-sm text-[#1A1A2E] mb-3 pb-2 border-b border-gray-100">
              Tambah Kategori Checklist ({currentFormType?.name})
            </h3>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Nama Kategori</label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Contoh: D. Bagian Khusus / Sistem Pengereman"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E4B8E]/20 focus:border-[#1E4B8E] transition-all focus:outline-none"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-3 py-1.5 border border-gray-300 rounded text-gray-600 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#1E4B8E] hover:bg-[#2E6BC4] text-white rounded font-semibold"
                >
                  Simpan Kategori
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormManagement;

