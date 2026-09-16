import { useState, useEffect } from 'react';
import { adminAPI, masterDataAPI } from '../../services/api';
import SearchableDropdown from '../../components/SearchableDropdown';
import {
  PlusIcon,
  EditIcon,
  TrashIcon,
  SearchIcon,
  CheckCircleIcon,
  MinusIcon,
  VehicleIcon
} from '../../components/Icons';

const VehicleManagement = () => {
  const [vehicles, setVehicles] = useState([]);
  const [formTypes, setFormTypes] = useState([]); // NEW: Dynamic form types
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');

  // Master data for dropdowns
  const [vehicleModels, setVehicleModels] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [formData, setFormData] = useState({
    vehicle_number: '',
    vehicle_type: '',
    form_type: '',
    department: '',
    asset_bms_no: '',
    is_active: true,
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [vehiclesRes, formTypesRes, modelsRes, deptsRes] = await Promise.all([
        adminAPI.getVehicles(),
        adminAPI.getForms(),
        masterDataAPI.getVehicleModels(),
        masterDataAPI.getDepartments()
      ]);
      setVehicles(vehiclesRes.data.data || []);
      setFormTypes(formTypesRes.data.data || []);
      setVehicleModels(modelsRes.data.data || []);
      setDepartments(deptsRes.data.data || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (vehicle = null) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      setFormData({
        vehicle_number: vehicle.vehicle_number,
        vehicle_type: vehicle.vehicle_type || '',
        form_type: vehicle.form_type || (formTypes.length > 0 ? formTypes[0].type_key : ''),
        department: vehicle.department || '',
        asset_bms_no: vehicle.asset_bms_no || '',
        is_active: vehicle.is_active !== undefined ? vehicle.is_active : true,
      });
    } else {
      setEditingVehicle(null);
      setFormData({
        vehicle_number: '',
        vehicle_type: '',
        form_type: formTypes.length > 0 ? formTypes[0].type_key : '',
        department: '',
        asset_bms_no: '',
        is_active: true,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingVehicle(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.vehicle_number.trim()) {
      alert('Nomor kendaraan / S/N wajib diisi.');
      return;
    }

    try {
      if (editingVehicle) {
        await adminAPI.updateVehicle(editingVehicle.id, formData);
        alert('Data unit berhasil diperbarui!');
      } else {
        await adminAPI.createVehicle(formData);
        alert('Data unit baru berhasil ditambahkan!');
      }
      handleCloseModal();
      loadInitialData();
    } catch (error) {
      alert('Gagal menyimpan kendaraan: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleToggleActive = async (vehicle) => {
    try {
      await adminAPI.updateVehicle(vehicle.id, {
        ...vehicle,
        is_active: !vehicle.is_active
      });
      loadInitialData();
    } catch (err) {
      alert('Gagal mengubah status unit.');
    }
  };

  const handleDelete = async (id, vehicleNumber) => {
    if (!confirm(`Yakin ingin menghapus kendaraan ${vehicleNumber}?`)) return;
    try {
      await adminAPI.deleteVehicle(id);
      alert('Kendaraan berhasil dihapus.');
      loadInitialData();
    } catch (error) {
      alert('Gagal menghapus kendaraan: ' + (error.response?.data?.message || error.message));
    }
  };

  const getFormTypeLabel = (typeKey) => {
    const formType = formTypes.find(ft => ft.type_key === typeKey);
    return formType ? formType.name : typeKey;
  };

  const filteredVehicles = vehicles.filter(v => {
    const matchSearch = (v.vehicle_number || '').toLowerCase().includes(search.toLowerCase()) ||
      (v.vehicle_type || '').toLowerCase().includes(search.toLowerCase()) ||
      (v.department || '').toLowerCase().includes(search.toLowerCase()) ||
      (v.asset_bms_no || '').toLowerCase().includes(search.toLowerCase());
    const matchType = filterType ? v.form_type === filterType : true;
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E] tracking-tight">Master Data Kendaraan & Alat Berat</h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Daftar armada dan unit yang tersedia pada pilihan dropdown pengisian formulir operator
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center space-x-1.5 bg-[#1E4B8E] hover:bg-[#2E6BC4] text-white px-4 py-2 rounded-md text-xs font-semibold shadow-sm transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Tambah Unit Baru</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nopol, tipe, departemen, asset..."
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E4B8E]/20 focus:border-[#1E4B8E] focus:outline-none transition-all"
          />
          <SearchIcon className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
        </div>

        <div className="w-full sm:w-auto flex items-center space-x-2">
          <label className="text-xs text-gray-500 font-medium whitespace-nowrap">Filter Jenis:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E4B8E]/20 focus:border-[#1E4B8E] focus:outline-none transition-all"
          >
            <option value="">Semua Jenis Form</option>
            {formTypes.map(ft => (
              <option key={ft.type_key} value={ft.type_key}>{ft.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-[#6B7280] font-semibold">
                <th className="py-3 px-4">No. Registrasi / SN</th>
                <th className="py-3 px-4">Tipe Kendaraan / Model</th>
                <th className="py-3 px-4">Peruntukan Formulir</th>
                <th className="py-3 px-4">Departemen / Rig</th>
                <th className="py-3 px-4">No. Asset BMS</th>
                <th className="py-3 px-4">Status Operasional</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E4B8E] mx-auto"></div>
                    <p className="mt-2 text-xs">Memuat data kendaraan...</p>
                  </td>
                </tr>
              ) : filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-gray-500">
                    Tidak ada unit kendaraan yang cocok.
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#1E4B8E]">{vehicle.vehicle_number}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-gray-800">
                      {vehicle.vehicle_type || '-'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-800">
                        {getFormTypeLabel(vehicle.form_type)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-600">
                      {vehicle.department || '-'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-gray-600">
                      {vehicle.asset_bms_no || '-'}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleActive(vehicle)}
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-all ${
                          vehicle.is_active
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title="Klik untuk ubah status aktif"
                      >
                        {vehicle.is_active ? 'Aktif (Muncul di Form)' : 'Nonaktif'}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => handleOpenModal(vehicle)}
                          className="p-1 text-gray-600 hover:text-[#1E4B8E] hover:bg-blue-50 rounded"
                          title="Edit Kendaraan"
                        >
                          <EditIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(vehicle.id, vehicle.vehicle_number)}
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Hapus Kendaraan"
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

      {/* Modal Add / Edit Vehicle */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-200 max-w-lg w-full p-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-3 mb-4">
              <h3 className="font-bold text-base text-[#1A1A2E]">
                {editingVehicle ? 'Edit Data Kendaraan / Unit' : 'Tambah Unit Baru'}
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
                <label className="block text-gray-700 font-semibold mb-1">
                  Nomor Polisi / S/N Unit <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.vehicle_number}
                  onChange={(e) => setFormData({ ...formData, vehicle_number: e.target.value })}
                  placeholder="Contoh: BK 1234 AB atau DZ-01"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#1E4B8E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Tipe / Seri Unit
                </label>
                <SearchableDropdown
                  options={vehicleModels.map(m => ({ value: m.name, label: m.name, sublabel: m.category }))}
                  value={formData.vehicle_type}
                  onChange={(val) => setFormData({ ...formData, vehicle_type: val })}
                  placeholder="Pilih model kendaraan"
                  searchPlaceholder="Cari model..."
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Peruntukan Jenis Formulir <span className="text-red-500">*</span>
                </label>
                {formTypes.length === 0 ? (
                  <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3">
                    <p className="font-semibold mb-1">⚠️ Belum ada jenis formulir</p>
                    <p>Silakan tambahkan jenis formulir terlebih dahulu di menu <strong>Master Formulir</strong></p>
                  </div>
                ) : (
                  <select
                    value={formData.form_type}
                    onChange={(e) => setFormData({ ...formData, form_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#1E4B8E] focus:outline-none"
                  >
                    {formTypes.map(ft => (
                      <option key={ft.type_key} value={ft.type_key}>
                        {ft.name} - {ft.code}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Departemen / Rig</label>
                  <SearchableDropdown
                    options={departments.map(d => ({ value: d.name, label: d.name, sublabel: d.code }))}
                    value={formData.department}
                    onChange={(val) => setFormData({ ...formData, department: val })}
                    placeholder="Pilih departemen"
                    searchPlaceholder="Cari departemen..."
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">No. Asset BMS</label>
                  <input
                    type="text"
                    value={formData.asset_bms_no}
                    onChange={(e) => setFormData({ ...formData, asset_bms_no: e.target.value })}
                    placeholder="Contoh: BMS-LV-01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#1E4B8E] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded text-[#1E4B8E] focus:ring-[#1E4B8E]"
                />
                <label htmlFor="is_active" className="text-gray-700 font-medium">
                  Aktifkan unit (Tampilkan di dropdown operator saat inspeksi)
                </label>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-100">
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
                  {editingVehicle ? 'Simpan Perubahan' : 'Tambah Unit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleManagement;
