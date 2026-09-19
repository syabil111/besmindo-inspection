import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { publicAPI } from '../../services/api';
import SearchableDropdown from '../../components/SearchableDropdown';

// ============================================================================
// SELECT FORM — HALAMAN UTAMA OPERATOR (via Link, Tanpa Login)
// Operator langsung masuk ke sini, ketik nama, pilih kendaraan, mulai inspeksi.
// ============================================================================

const SelectForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [vehicles, setVehicles] = useState([]);
  const [formTypes, setFormTypes] = useState([]); // NEW: Dynamic form types
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    operator_name: '',
    form_type: searchParams.get('type') || '',
    vehicle_id: '',
    shift: '1st',
    inspection_date: new Date().toISOString().split('T')[0],
  });
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setLoadError('');
      const [vehiclesRes, formTypesRes] = await Promise.all([
        publicAPI.getVehicles(),
        publicAPI.getFormTypes()
      ]);

      const vehiclesList = vehiclesRes.data.data || [];
      const formTypesList = formTypesRes.data.data || [];

      if (formTypesList.length === 0) {
        setLoadError('Data jenis formulir kosong. Hubungi admin untuk menambah Master Formulir.');
      }

      setVehicles(vehiclesList);
      setFormTypes(formTypesList);

      // Auto-select first form type if not specified
      if (!formData.form_type && formTypesList.length > 0) {
        const firstFormType = formTypesList[0].type_key;
        setFormData(prev => ({ ...prev, form_type: firstFormType }));

        // Auto-select first matching vehicle
        const matching = vehiclesList.filter(v => v.form_type === firstFormType);
        if (matching.length > 0) {
          setFormData(prev => ({ ...prev, vehicle_id: matching[0].id }));
        }
      } else if (formData.form_type) {
        // Auto-select first matching vehicle for specified form type
        const matching = vehiclesList.filter(v => v.form_type === formData.form_type);
        if (matching.length > 0) {
          setFormData(prev => ({ ...prev, vehicle_id: matching[0].id }));
        }
      }
    } catch (error) {
      console.error('Failed to load initial data:', error);
      setLoadError('Gagal memuat data dari server. Pastikan backend berjalan, lalu klik Coba Lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormTypeChange = (typeVal) => {
    const matching = vehicles.filter(v => v.form_type === typeVal);
    setFormData({
      ...formData,
      form_type: typeVal,
      vehicle_id: matching.length > 0 ? matching[0].id : ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.operator_name.trim()) {
      alert('Mohon isi nama Anda.');
      return;
    }

    if (!formData.form_type) {
      alert('Silakan pilih jenis formulir.');
      return;
    }

    if (!formData.vehicle_id) {
      alert('Silakan pilih kendaraan.');
      return;
    }

    // Find selected vehicle data including master data
    const selectedVehicle = vehicles.find(v => v.id === formData.vehicle_id);

    const params = new URLSearchParams({
      vehicle_id: formData.vehicle_id,
      shift: formData.shift,
      date: formData.inspection_date,
      operator_name: formData.operator_name.trim(),
    });

    // Navigate with vehicle data in state for auto-fill
    navigate(`/fill-form/${formData.form_type}?${params.toString()}`, {
      state: { selectedVehicle }
    });
  };

  // Build form type options dynamically from database
  const formTypeOptions = formTypes.map(ft => ({
    value: ft.type_key,
    label: ft.name,
    sublabel: ft.code
  }));

  // Build vehicle options for SearchableDropdown with groups
  const matchingVehicles = vehicles.filter(v => v.form_type === formData.form_type);
  const otherVehicles = vehicles.filter(v => v.form_type !== formData.form_type);

  const vehicleOptions = [
    ...matchingVehicles.map(v => ({
      value: v.id,
      label: `${v.vehicle_number} — ${v.vehicle_type}`,
      sublabel: v.department || 'Rig',
      group: 'Unit Sesuai Kategori Form'
    })),
    ...otherVehicles.map(v => ({
      value: v.id,
      label: `${v.vehicle_number} — ${v.vehicle_type}`,
      sublabel: v.department || 'Rig',
      group: 'Unit Armada Lainnya'
    }))
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1E4B8E] mx-auto"></div>
          <p className="text-sm text-gray-500 font-medium">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Container Card Sederhana dengan Garis Aksen Biru */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 border-t-4 border-t-[#162F5C] overflow-hidden">
        
        {/* Header Sederhana & Bersih (Putih dengan Aksen Garis Biru) */}
        <div className="bg-white p-6 sm:p-7 border-b border-slate-200/80 relative">
          {/* Garis Aksen Biru Halus di Bawah Header Card */}
          <div className="absolute bottom-0 left-6 right-6 h-[2px] bg-gradient-to-r from-[#162F5C] via-blue-400 to-[#162F5C]/20 rounded-full" />
          <div className="flex items-center gap-3.5">
            <div className="w-1.5 h-11 bg-[#162F5C] rounded-full shrink-0 shadow-xs" />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#162F5C]">
                Formulir Inspeksi Kendaraan & Alat
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Silakan isi nama Anda dan pilih unit kendaraan sebelum mengoperasikan armada.
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 pt-6">
          {loadError ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-amber-50 flex items-center justify-center">
                <svg className="w-7 h-7 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-sm text-gray-600 font-medium">{loadError}</p>
              <button
                type="button"
                onClick={loadInitialData}
                className="px-5 py-2.5 bg-[#1E4B8E] hover:bg-[#163A6E] text-white rounded-xl text-sm font-semibold transition shadow-md shadow-blue-900/20"
              >
                Coba Lagi
              </button>
            </div>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Nama Operator */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">
                Nama Lengkap Operator *
              </label>
              <input
                type="text"
                value={formData.operator_name}
                onChange={(e) => setFormData({ ...formData, operator_name: e.target.value })}
                placeholder="Masukkan nama lengkap Anda..."
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#1E4B8E]/25 focus:border-[#1E4B8E] focus:outline-none transition"
              />
            </div>

            {/* Pilih Jenis Formulir */}
            <SearchableDropdown
              options={formTypeOptions}
              value={formData.form_type}
              onChange={handleFormTypeChange}
              placeholder="Pilih jenis formulir..."
              searchPlaceholder="Cari jenis formulir..."
              label="Jenis Formulir Checklist *"
              required
            />

            {/* Pilih Kendaraan */}
            <SearchableDropdown
              options={vehicleOptions}
              value={formData.vehicle_id}
              onChange={(val) => setFormData({ ...formData, vehicle_id: val })}
              placeholder="Pilih nomor kendaraan atau unit..."
              searchPlaceholder="Cari nomor kendaraan..."
              label="Kendaraan / Unit Armada *"
              required
            />

            {/* Shift dan Tanggal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Shift Kerja *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, shift: '1st' })}
                    className={`py-2.5 px-3 rounded-lg border text-xs sm:text-sm font-semibold transition cursor-pointer ${
                      formData.shift === '1st'
                        ? 'bg-[#162F5C] text-white border-[#162F5C] shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span>Pagi (1st)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, shift: '2nd' })}
                    className={`py-2.5 px-3 rounded-lg border text-xs sm:text-sm font-semibold transition cursor-pointer ${
                      formData.shift === '2nd'
                        ? 'bg-[#162F5C] text-white border-[#162F5C] shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span>Malam (2nd)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tanggal Inspeksi *</label>
                <input
                  type="date"
                  value={formData.inspection_date}
                  onChange={(e) => setFormData({ ...formData, inspection_date: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#162F5C]/25 focus:border-[#162F5C] focus:outline-none transition"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 bg-[#162F5C] hover:bg-[#112447] active:bg-[#0c1a33] text-white rounded-lg font-semibold text-sm shadow transition duration-150 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Lanjutkan ke Pengisian Formulir</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SelectForm;