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
    <div className="max-w-3xl mx-auto">
      {/* Header Simple */}
      <div className="bg-[#1E4B8E] text-white p-6 rounded-lg mb-6">
        <h1 className="text-xl font-bold mb-1">Formulir Inspeksi Kendaraan</h1>
        <p className="text-sm text-blue-100">Isi data inspeksi sebelum mengoperasikan kendaraan</p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow p-6">
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
              className="px-5 py-2.5 bg-[#1E4B8E] hover:bg-[#163A6E] text-white rounded-lg text-sm font-semibold transition"
            >
              Coba Lagi
            </button>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Nama Operator */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Operator
            </label>
            <input
              type="text"
              value={formData.operator_name}
              onChange={(e) => setFormData({ ...formData, operator_name: e.target.value })}
              placeholder="Masukkan nama lengkap"
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E4B8E] focus:border-[#1E4B8E] focus:outline-none"
            />
          </div>

          {/* Pilih Jenis Formulir */}
          <SearchableDropdown
            options={formTypeOptions}
            value={formData.form_type}
            onChange={handleFormTypeChange}
            placeholder="Pilih jenis formulir"
            searchPlaceholder="Cari formulir..."
            label="Jenis Formulir"
            required
          />

          {/* Pilih Kendaraan */}
          <SearchableDropdown
            options={vehicleOptions}
            value={formData.vehicle_id}
            onChange={(val) => setFormData({ ...formData, vehicle_id: val })}
            placeholder="Pilih kendaraan"
            searchPlaceholder="Cari nomor kendaraan..."
            label="Kendaraan"
            required
          />

          {/* Shift dan Tanggal */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Shift</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, shift: '1st' })}
                  className={`py-2 px-3 rounded-lg border text-sm font-medium transition ${
                    formData.shift === '1st'
                      ? 'bg-[#1E4B8E] text-white border-[#1E4B8E]'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Pagi
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, shift: '2nd' })}
                  className={`py-2 px-3 rounded-lg border text-sm font-medium transition ${
                    formData.shift === '2nd'
                      ? 'bg-[#1E4B8E] text-white border-[#1E4B8E]'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Malam
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal</label>
              <input
                type="date"
                value={formData.inspection_date}
                onChange={(e) => setFormData({ ...formData, inspection_date: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E4B8E] focus:border-[#1E4B8E] focus:outline-none"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 bg-[#1E4B8E] hover:bg-[#163A6E] text-white rounded-lg font-medium transition"
          >
            Mulai Inspeksi
          </button>
        </form>
        )}
      </div>
    </div>
  );
};

export default SelectForm;