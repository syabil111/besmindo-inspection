import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { publicAPI } from '../../services/api';
import SearchableDropdown from '../../components/SearchableDropdown';
import {
  ArrowLeftIcon,
  CheckIcon,
  CrossIcon,
  MinusIcon,
  WarningIcon,
  CheckCircleIcon,
  OperatorHatIcon,
  CalendarIcon
} from '../../components/Icons';

const FillForm = () => {
  const { formType } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [currentStep, setCurrentStep] = useState(2); // Step 1 was vehicle & shift selection in SelectForm
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [lastAutoSave, setLastAutoSave] = useState(null);

  // Master data for dropdowns
  const [departments, setDepartments] = useState([]);
  const [workLocations, setWorkLocations] = useState([]);
  const [assetStatuses, setAssetStatuses] = useState([]);
  const [vehicleModels, setVehicleModels] = useState([]);

  // Form state
  const [headerData, setHeaderData] = useState({});
  const [personalDocuments, setPersonalDocuments] = useState([]);
  const [checklistResults, setChecklistResults] = useState({});
  const [operatorName, setOperatorName] = useState(searchParams.get('operator_name') || '');

  // Query parameters
  const vehicleId = searchParams.get('vehicle_id');
  const shift = searchParams.get('shift') || '1st';
  const inspectionDate = searchParams.get('date') || new Date().toISOString().split('T')[0];

  // Get vehicle data from navigation state (passed from SelectForm)
  const vehicleFromState = location.state?.selectedVehicle;

  const draftStorageKey = `besmindo_draft_${formType}_${vehicleId}_${shift}`;

  useEffect(() => {
    loadInitialData();
  }, [formType, vehicleId]);

  // Auto-save draft every 30 seconds to localStorage
  useEffect(() => {
    const timer = setInterval(() => {
      saveDraftToLocalStorage();
    }, 30000);
    return () => clearInterval(timer);
  }, [headerData, personalDocuments, checklistResults, operatorName]);

  const saveDraftToLocalStorage = () => {
    try {
      const draft = {
        headerData,
        personalDocuments,
        checklistResults,
        operatorName,
        savedAt: new Date().toLocaleTimeString('id-ID')
      };
      localStorage.setItem(draftStorageKey, JSON.stringify(draft));
      setLastAutoSave(draft.savedAt);
    } catch (e) {
      console.warn('Draft save error:', e);
    }
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [formRes, vehRes, deptsRes, locsRes, statusesRes, modelsRes] = await Promise.all([
        publicAPI.getFormChecklist(formType),
        publicAPI.getVehicles(),
        publicAPI.getDepartments(),
        publicAPI.getWorkLocations(),
        publicAPI.getAssetStatuses(),
        publicAPI.getVehicleModels()
      ]);

      const formInfo = formRes.data.data;
      setFormData(formInfo);

      const allVehicles = vehRes.data.data || [];
      
      // Load master data
      setDepartments(deptsRes.data.data || []);
      setWorkLocations(locsRes.data.data || []);
      setAssetStatuses(statusesRes.data.data || []);
      setVehicleModels(modelsRes.data.data || []);
      
      // Prioritize vehicle data from state, fallback to API fetch
      const currentVeh = vehicleFromState || allVehicles.find(v => v.id === vehicleId) || {};
      setSelectedVehicle(currentVeh);

      // Pre-fill header data dengan AUTO-FILL dari master data
      const defaultHeader = {
        vehicle_number: currentVeh.vehicle_number || '',
        sn_engine: currentVeh.sn_engine || '', // AUTO-FILL dari vehicle
        department: currentVeh.dept?.name || currentVeh.department || 'Transport & Logistics', // AUTO-FILL dari master
        vehicle_type: currentVeh.vehicle_type || '',
        model: currentVeh.vehicle_model?.name || currentVeh.vehicle_type || '', // AUTO-FILL dari master
        location: currentVeh.default_location?.name || 'Yard / Basecamp Operasional', // AUTO-FILL dari master
        asset_status: currentVeh.default_asset_status?.name || 'Operasional', // AUTO-FILL dari master
        km_reading_value: '',
        running_hours: '',
        exp_pajak: currentVeh.exp_pajak || '', // AUTO-FILL dari vehicle
        exp_kiur: currentVeh.exp_kiur || '', // AUTO-FILL dari vehicle
        exp_coi: currentVeh.exp_coi || '', // AUTO-FILL dari vehicle
        tahun_k3: currentVeh.year_manufacture || '' // AUTO-FILL dari vehicle
      };

      // Default personal documents for vehicle forms
      const defaultDocs = ['lv_bus', 'vacum', 'tandem'].includes(formType) ? [
        { doc_type: 'SIM', doc_number_1st: '', doc_number_2nd: '', expiry_date_1st: '', expiry_date_2nd: '' },
        { doc_type: 'Permit_BMS', doc_number_1st: '', doc_number_2nd: '', expiry_date_1st: '', expiry_date_2nd: '' },
        { doc_type: 'Kartu_Pengemudi', doc_number_1st: '', doc_number_2nd: '', expiry_date_1st: '', expiry_date_2nd: '' }
      ] : [];

      // Initial checklist map
      const initialChecklist = {};
      (formInfo.categories || []).forEach(cat => {
        (cat.items || []).forEach(item => {
          initialChecklist[item.id] = { condition: null, notes: '' };
        });
      });

      // Check if draft exists in localStorage
      const savedDraft = localStorage.getItem(draftStorageKey);
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          setHeaderData({ ...defaultHeader, ...parsed.headerData });
          setPersonalDocuments(parsed.personalDocuments || defaultDocs);
          setChecklistResults({ ...initialChecklist, ...parsed.checklistResults });
          if (parsed.operatorName) setOperatorName(parsed.operatorName);
          setLastAutoSave(parsed.savedAt);
        } catch (err) {
          setHeaderData(defaultHeader);
          setPersonalDocuments(defaultDocs);
          setChecklistResults(initialChecklist);
        }
      } else {
        setHeaderData(defaultHeader);
        setPersonalDocuments(defaultDocs);
        setChecklistResults(initialChecklist);
      }
    } catch (error) {
      console.error('Failed to load form initialization:', error);
      alert('Gagal memuat formulir.');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const updateChecklist = (itemId, condition, notes = '') => {
    setChecklistResults(prev => ({
      ...prev,
      [itemId]: {
        condition,
        notes: condition === 'broken' ? notes : ''
      }
    }));
  };

  const updateChecklistNotes = (itemId, notes) => {
    setChecklistResults(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        notes
      }
    }));
  };

  // Progress computation
  const totalItems = Object.keys(checklistResults).length;
  const filledItems = Object.values(checklistResults).filter(r => r.condition !== null).length;
  const progressPercent = totalItems > 0 ? Math.round((filledItems / totalItems) * 100) : 0;

  const goodCount = Object.values(checklistResults).filter(r => r.condition === 'good').length;
  const brokenCount = Object.values(checklistResults).filter(r => r.condition === 'broken').length;
  const naCount = Object.values(checklistResults).filter(r => r.condition === 'na').length;

  const isVehicleForm = ['lv_bus', 'vacum', 'tandem'].includes(formType);
  const maxSteps = isVehicleForm ? 5 : 4; // Step 2: Header, Step 3: Docs (if vehicle), Step 4: Checklist, Step 5: Review

  // Step Validation
  const validateCurrentStep = () => {
    if (currentStep === 2) {
      if (formType === 'dozer') {
        if (!headerData.sn_engine?.trim() || !headerData.department?.trim()) {
          alert('Mohon isi Nomor SN Mesin dan Departemen.');
          return false;
        }
      } else {
        if (!headerData.vehicle_number?.trim() || !headerData.department?.trim()) {
          alert('Mohon isi Nomor Kendaraan dan Departemen.');
          return false;
        }
      }
      return true;
    }

    if (currentStep === 3 && isVehicleForm) {
      return true; // Personal documents optional or non-blocking
    }

    if ((currentStep === 4 && isVehicleForm) || (currentStep === 3 && !isVehicleForm)) {
      // Checklist step: all items must be answered & broken must have notes
      const unselected = Object.values(checklistResults).filter(r => r.condition === null);
      if (unselected.length > 0) {
        alert(`Masih ada ${unselected.length} item checklist yang belum diisi. Mohon lengkapi seluruh item.`);
        return false;
      }

      const brokenWithoutNotes = Object.values(checklistResults).filter(r => r.condition === 'broken' && !r.notes?.trim());
      if (brokenWithoutNotes.length > 0) {
        alert('Setiap item yang berstatus RUSAK wajib dilengkapi catatan keterangan kerusakan!');
        return false;
      }
      return true;
    }

    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;
    saveDraftToLocalStorage();
    setCurrentStep(prev => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    if (currentStep > 2) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/operator');
    }
  };

  const handleSubmit = async () => {
    if (!operatorName.trim()) {
      alert('Mohon ketikkan nama operator / pengemudi sebagai konfirmasi tanda tangan.');
      return;
    }

    if (!confirm('Apakah Anda yakin ingin mengirim formulir inspeksi ini sekarang?')) return;

    try {
      setSubmitting(true);
      const payload = {
        form_type_key: formType,
        vehicle_id: vehicleId,
        shift: shift,
        inspection_date: inspectionDate,
        inspection_time: new Date().toTimeString().slice(0, 5),
        header_data: headerData,
        personal_documents: isVehicleForm ? personalDocuments : null,
        checklist_results: Object.entries(checklistResults).map(([itemId, r]) => ({
          checklist_item_id: itemId,
          condition: r.condition,
          notes: r.notes || null
        })),
        operator_name: operatorName.trim()
      };

      await publicAPI.submitInspection(payload);

      // Clean draft
      localStorage.removeItem(draftStorageKey);

      navigate('/operator/success', {
        replace: true,
        state: {
          vehicleNumber: headerData.vehicle_number || headerData.sn_engine,
          formType: formData?.form_type?.name,
          shift: shift
        }
      });
    } catch (err) {
      console.error('Submit error:', err);
      alert('Gagal mengirim formulir inspeksi: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E4B8E]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Top Wizard Navigation & Progress Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E5E7EB] shadow-md sticky top-16 md:top-20 z-10">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={handleBack}
            className="inline-flex items-center space-x-2 text-xs font-bold text-gray-600 hover:text-[#1E4B8E] bg-gray-50 hover:bg-blue-50 px-3 py-1.5 rounded-xl border border-gray-200 transition-colors"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            <span>Kembali</span>
          </button>
          <span className="text-xs font-bold text-[#1E4B8E] bg-blue-50 px-3 py-1 rounded-full font-mono border border-blue-100 shadow-xs">
            Langkah {currentStep} dari {maxSteps}
          </span>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-xs font-bold text-gray-600 mb-1.5">
            <span>Progress Checklist ({filledItems}/{totalItems} Item Terisi)</span>
            <span className="text-[#1E4B8E] font-mono">{progressPercent}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-[#1E4B8E] h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {lastAutoSave && (
          <p className="text-[10px] text-gray-400 mt-2 text-right font-mono">
            Draft Tersimpan Otomatis: {lastAutoSave}
          </p>
        )}
      </div>

      {/* Info Header Banner (Wide Responsive Card) */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 text-xs sm:text-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 shadow-xs">
        <div>
          <div className="font-extrabold text-[#1E4B8E] text-base">{selectedVehicle?.vehicle_number}</div>
          <div className="text-xs text-gray-500 font-medium">{formData?.form_type?.name}</div>
        </div>
        <div className="flex items-center space-x-2 text-right">
          <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-bold font-mono ${shift === '1st' ? 'bg-amber-100 text-amber-900 border border-amber-200' : 'bg-indigo-100 text-indigo-900 border border-indigo-200'
            }`}>
            Shift {shift === '1st' ? 'Pagi (1st)' : 'Malam (2nd)'}
          </span>
          <div className="text-xs text-gray-500 font-mono font-semibold bg-gray-100 px-3 py-1 rounded-lg border border-gray-200">{inspectionDate}</div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STEP 2: ISI HEADER FORM                                                   */}
      {/* ========================================================================= */}
      {currentStep === 2 && (
        <div className="bg-white rounded-2xl p-5 sm:p-7 border border-[#E5E7EB] shadow-md space-y-5 text-xs sm:text-sm">
          <h3 className="text-base sm:text-lg font-bold text-[#1A1A2E] border-b border-gray-100 pb-3">
            Langkah 2: Lengkapi Data Header & Informasi Spesifikasi Unit
          </h3>

          {formType === 'dozer' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <label className="block text-gray-700 font-bold mb-1.5">S/N Engine / No. Unit *</label>
                <input
                  type="text"
                  value={headerData.sn_engine || ''}
                  onChange={(e) => setHeaderData({ ...headerData, sn_engine: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-[#1E4B8E] focus:outline-none"
                />
              </div>
              
              <SearchableDropdown
                options={departments.map(d => ({ value: d.name, label: d.name, sublabel: d.code }))}
                value={headerData.department || ''}
                onChange={(val) => setHeaderData({ ...headerData, department: val })}
                placeholder="Pilih departemen"
                searchPlaceholder="Cari departemen..."
                label="Rig / Departemen *"
                required
              />
              
              <SearchableDropdown
                options={vehicleModels.map(m => ({ value: m.name, label: m.name, sublabel: m.category }))}
                value={headerData.model || ''}
                onChange={(val) => setHeaderData({ ...headerData, model: val })}
                placeholder="Pilih model alat"
                searchPlaceholder="Cari model..."
                label="Model Alat"
              />
              
              <SearchableDropdown
                options={workLocations.map(l => ({ value: l.name, label: l.name, sublabel: l.location_type }))}
                value={headerData.location || ''}
                onChange={(val) => setHeaderData({ ...headerData, location: val })}
                placeholder="Pilih lokasi kerja"
                searchPlaceholder="Cari lokasi..."
                label="Lokasi Kerja Unit"
              />
              
              <div>
                <label className="block text-gray-700 font-bold mb-1.5">Running Hours (Jam Mesin)</label>
                <input
                  type="number"
                  step="0.1"
                  value={headerData.running_hours || ''}
                  onChange={(e) => setHeaderData({ ...headerData, running_hours: e.target.value })}
                  placeholder="Contoh: 1250.5"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-[#1E4B8E] focus:outline-none"
                />
              </div>
              
              <SearchableDropdown
                options={assetStatuses.map(s => ({ value: s.name, label: s.name, sublabel: s.color }))}
                value={headerData.asset_status || ''}
                onChange={(val) => setHeaderData({ ...headerData, asset_status: val })}
                placeholder="Pilih status asset"
                searchPlaceholder="Cari status..."
                label="Status Asset Armada"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <label className="block text-gray-700 font-bold mb-1.5">Nomor Polisi / Armada *</label>
                <input
                  type="text"
                  value={headerData.vehicle_number || ''}
                  onChange={(e) => setHeaderData({ ...headerData, vehicle_number: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-[#1E4B8E] focus:outline-none"
                />
              </div>
              
              <SearchableDropdown
                options={departments.map(d => ({ value: d.name, label: d.name, sublabel: d.code }))}
                value={headerData.department || ''}
                onChange={(val) => setHeaderData({ ...headerData, department: val })}
                placeholder="Pilih departemen"
                searchPlaceholder="Cari departemen..."
                label="Rig / Departemen *"
                required
              />
              
              <div>
                <label className="block text-gray-700 font-bold mb-1.5">KM Reading (Odometer)</label>
                <input
                  type="number"
                  step="0.1"
                  value={headerData.km_reading_value || ''}
                  onChange={(e) => setHeaderData({ ...headerData, km_reading_value: e.target.value })}
                  placeholder="Contoh: 45210"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-[#1E4B8E] focus:outline-none"
                />
              </div>
              
              <SearchableDropdown
                options={workLocations.map(l => ({ value: l.name, label: l.name, sublabel: l.location_type }))}
                value={headerData.location || ''}
                onChange={(val) => setHeaderData({ ...headerData, location: val })}
                placeholder="Pilih lokasi kerja"
                searchPlaceholder="Cari lokasi..."
                label="Lokasi Pengoperasian"
              />
              
              <div>
                <label className="block text-gray-700 font-bold mb-1.5">Masa Berlaku Pajak STNK</label>
                <input
                  type="date"
                  value={headerData.exp_pajak || ''}
                  onChange={(e) => setHeaderData({ ...headerData, exp_pajak: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-[#1E4B8E] focus:outline-none bg-white"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-1.5">Masa Berlaku KIUR</label>
                <input
                  type="date"
                  value={headerData.exp_kiur || ''}
                  onChange={(e) => setHeaderData({ ...headerData, exp_kiur: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-[#1E4B8E] focus:outline-none bg-white"
                />
              </div>
              {formType === 'vacum' && (
                <>
                  <div>
                    <label className="block text-gray-700 font-bold mb-1.5">Tahun K3 Angkut</label>
                    <input
                      type="number"
                      value={headerData.tahun_k3 || ''}
                      onChange={(e) => setHeaderData({ ...headerData, tahun_k3: e.target.value })}
                      placeholder="Contoh: 2024"
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-[#1E4B8E] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-1.5">Exp. COI Tangki Vacum</label>
                    <input
                      type="date"
                      value={headerData.exp_coi || ''}
                      onChange={(e) => setHeaderData({ ...headerData, exp_coi: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-[#1E4B8E] focus:outline-none bg-white"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          <div className="pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={handleNext}
              className="w-full py-3.5 bg-[#1E4B8E] hover:bg-[#163A6E] text-white rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              Lanjut ke {isVehicleForm ? 'Dokumen Pengemudi →' : 'Checklist Item →'}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: DOKUMEN PERSONAL (SIM, Permit, Kartu Pengemudi)                     */}
      {/* ========================================================================= */}
      {currentStep === 3 && isVehicleForm && (
        <div className="bg-white rounded-2xl p-5 sm:p-7 border border-[#E5E7EB] shadow-md space-y-5 text-xs sm:text-sm">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#1A1A2E]">Langkah 3: Dokumen Legalitas Pengemudi</h3>
            <p className="text-xs text-gray-500 mt-1">
              Periksa masa berlaku SIM, Permit BMS, dan Kartu Pengemudi Anda sebelum mengemudikan armada.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {personalDocuments.map((doc, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3 shadow-xs">
                <div className="font-bold text-[#1E4B8E] text-xs sm:text-sm">
                  {doc.doc_type === 'SIM' ? '1. Surat Izin Mengemudi (SIM)' :
                    doc.doc_type === 'Permit_BMS' ? '2. Permit Berkendara BMS' :
                      '3. Kartu Pengemudi'}
                </div>
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Nomor Dokumen</label>
                    <input
                      type="text"
                      value={doc.doc_number_1st || ''}
                      onChange={(e) => {
                        const updated = [...personalDocuments];
                        updated[idx].doc_number_1st = e.target.value;
                        setPersonalDocuments(updated);
                      }}
                      placeholder="Nomor..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-semibold bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Masa Berlaku (Exp Date)</label>
                    <input
                      type="date"
                      value={doc.expiry_date_1st || ''}
                      onChange={(e) => {
                        const updated = [...personalDocuments];
                        updated[idx].expiry_date_1st = e.target.value;
                        setPersonalDocuments(updated);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-semibold bg-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={handleNext}
              className="w-full py-3.5 bg-[#1E4B8E] hover:bg-[#163A6E] text-white rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              Lanjut ke Checklist Pemeriksaan Fisik →
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP CHECKLIST: CARD PER ITEM DENGAN TOMBOL SENTUH BESAR (MIN 48PX)        */}
      {/* ========================================================================= */}
      {((currentStep === 4 && isVehicleForm) || (currentStep === 3 && !isVehicleForm)) && (
        <div className="space-y-5">
          <div className="bg-white p-4 rounded-2xl border border-gray-200 text-xs sm:text-sm shadow-xs flex items-center justify-between">
            <div>
              <h3 className="font-bold text-[#1A1A2E] uppercase tracking-wider text-xs">
                Petunjuk Pengisian Checklist
              </h3>
              <p className="text-xs text-gray-600 mt-0.5">
                Tekan tombol sentuh pada tiap item. Jika item <strong>RUSAK</strong>, wajib menuliskan catatan kerusakan.
              </p>
            </div>
            <div className="hidden sm:block text-right font-mono text-xs font-bold text-[#1E4B8E]">
              {filledItems} dari {totalItems} Selesai
            </div>
          </div>

          {(formData?.categories || []).map((category) => (
            <div key={category.id} className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-md space-y-4">
              <div className="flex items-center space-x-2 border-b border-gray-100 pb-3">
                <span className="w-3 h-3 rounded-full bg-[#1E4B8E]"></span>
                <h4 className="font-extrabold text-sm sm:text-base uppercase tracking-wide text-[#1E4B8E]">
                  {category.name}
                </h4>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {(category.items || []).map((item, idx) => {
                  const currentResult = checklistResults[item.id] || { condition: null, notes: '' };
                  const isBroken = currentResult.condition === 'broken';

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-xl border transition-all ${currentResult.condition === 'good'
                          ? 'border-green-300 bg-green-50/40'
                          : currentResult.condition === 'broken'
                            ? 'border-red-300 bg-red-50/50 ring-1 ring-red-300'
                            : currentResult.condition === 'na'
                              ? 'border-gray-300 bg-gray-50'
                              : 'border-gray-200 bg-white'
                        }`}
                    >
                      <div className="text-xs sm:text-sm font-bold text-gray-900 mb-3 leading-snug">
                        <span className="text-gray-400 font-mono mr-1.5">{idx + 1}.</span>
                        {item.description}
                      </div>

                      {/* 3 Tombol Sentuh Besar (Min 48px Height) */}
                      <div className="grid grid-cols-3 gap-2">
                        {/* BAGUS */}
                        <button
                          type="button"
                          onClick={() => updateChecklist(item.id, 'good')}
                          className={`h-12 min-h-[48px] rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${currentResult.condition === 'good'
                              ? 'bg-[#16A34A] text-white shadow-md ring-2 ring-green-300'
                              : 'bg-white border-2 border-green-600 text-green-700 hover:bg-green-50'
                            }`}
                        >
                          <CheckIcon className="w-4 h-4" />
                          <span>BAGUS</span>
                        </button>

                        {/* RUSAK */}
                        <button
                          type="button"
                          onClick={() => updateChecklist(item.id, 'broken')}
                          className={`h-12 min-h-[48px] rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${currentResult.condition === 'broken'
                              ? 'bg-[#DC2626] text-white shadow-md ring-2 ring-red-300'
                              : 'bg-white border-2 border-red-600 text-red-700 hover:bg-red-50'
                            }`}
                        >
                          <CrossIcon className="w-4 h-4" />
                          <span>RUSAK</span>
                        </button>

                        {/* N/A */}
                        <button
                          type="button"
                          onClick={() => updateChecklist(item.id, 'na')}
                          className={`h-12 min-h-[48px] rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${currentResult.condition === 'na'
                              ? 'bg-[#9CA3AF] text-white shadow-md ring-2 ring-gray-300'
                              : 'bg-white border-2 border-gray-400 text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                          <MinusIcon className="w-4 h-4" />
                          <span>N/A</span>
                        </button>
                      </div>

                      {/* Kolom Catatan Wajib Jika Memilih RUSAK */}
                      {isBroken && (
                        <div className="mt-3 pt-2 border-t border-red-200">
                          <label className="block text-xs font-bold text-red-700 mb-1">
                            Catatan Kerusakan (Wajib Diisi) *
                          </label>
                          <textarea
                            rows="2"
                            value={currentResult.notes || ''}
                            onChange={(e) => updateChecklistNotes(item.id, e.target.value)}
                            placeholder="Jelaskan kondisi kerusakan item secara rinci..."
                            required
                            className="w-full p-2.5 border border-red-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-red-400 focus:outline-none bg-white shadow-xs"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Special Safety Note for Dozer */}
          {formType === 'dozer' && (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl text-xs sm:text-sm text-amber-900 font-semibold shadow-xs">
              <strong>Peringatan Khusus HSE:</strong> Pastikan Wire Winch and Tail Chain/Hock tidak ada yang rusak & Terpasang dengan benar.
            </div>
          )}

          <div className="pt-3">
            <button
              type="button"
              onClick={handleNext}
              className="w-full py-4 bg-[#1E4B8E] hover:bg-[#163A6E] text-white rounded-xl font-bold text-sm sm:text-base shadow-md transition-all cursor-pointer"
            >
              Review & Tanda Tangan Submit →
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP REVIEW & SUBMIT                                                      */}
      {/* ========================================================================= */}
      {currentStep === maxSteps && (
        <div className="bg-white rounded-2xl p-5 sm:p-7 border border-[#E5E7EB] shadow-md space-y-5 text-xs sm:text-sm">
          <h3 className="text-base sm:text-lg font-extrabold text-[#1A1A2E] border-b border-gray-100 pb-3">
            Ringkasan & Konfirmasi Pengiriman Formulir Inspeksi
          </h3>

          {/* Summary Box */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-4 bg-green-50 rounded-2xl border border-green-200 shadow-xs">
              <span className="text-xl sm:text-2xl font-black text-green-700">{goodCount}</span>
              <div className="text-xs text-green-800 font-bold uppercase mt-0.5">Bagus</div>
            </div>
            <div className="p-4 bg-red-50 rounded-2xl border border-red-200 shadow-xs">
              <span className="text-xl sm:text-2xl font-black text-red-700">{brokenCount}</span>
              <div className="text-xs text-red-800 font-bold uppercase mt-0.5">Rusak</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-xl sm:text-2xl font-black text-gray-700">{naCount}</span>
              <div className="text-xs text-gray-800 font-bold uppercase mt-0.5">N/A</div>
            </div>
          </div>

          {/* List item rusak if any */}
          {brokenCount > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl space-y-2.5">
              <div className="flex items-center space-x-2 text-red-800 font-extrabold text-xs sm:text-sm">
                <WarningIcon className="w-5 h-5 text-red-600" />
                <span>{brokenCount} Item Rusak Akan Dilaporkan ke HSE:</span>
              </div>
              <ul className="space-y-1.5 pl-3 text-xs sm:text-sm">
                {Object.entries(checklistResults)
                  .filter(([_, r]) => r.condition === 'broken')
                  .map(([itemId, r]) => {
                    let desc = 'Item Checklist';
                    (formData?.categories || []).forEach(cat => {
                      const f = (cat.items || []).find(it => it.id === itemId);
                      if (f) desc = f.description;
                    });
                    return (
                      <li key={itemId} className="text-red-900 list-disc">
                        <strong>{desc}</strong>: <em>"{r.notes}"</em>
                      </li>
                    );
                  })}
              </ul>
            </div>
          )}

          {/* Info Header Recap */}
          <div className="p-4 bg-gray-50 rounded-xl text-xs sm:text-sm space-y-1.5 text-gray-700 border border-gray-200 font-medium">
            <div>Kendaraan: <strong>{headerData.vehicle_number || headerData.sn_engine}</strong></div>
            <div>Shift: <strong>{shift === '1st' ? 'Pagi (1st)' : 'Malam (2nd)'}</strong> | Tanggal: <strong>{inspectionDate}</strong></div>
            <div>Departemen: <strong>{headerData.department}</strong></div>
          </div>

          {/* Signature / Confirmation Name */}
          <div className="pt-2">
            <label className="block font-extrabold text-gray-800 mb-1.5">
              Nama Terang Operator / Pengemudi (Konfirmasi Paraf) *
            </label>
            <input
              type="text"
              value={operatorName}
              onChange={(e) => setOperatorName(e.target.value)}
              placeholder="Ketikkan nama lengkap Anda..."
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-[#1E4B8E] focus:outline-none shadow-xs"
            />
            <p className="text-[11px] text-gray-400 mt-1.5">
              * Dengan menekan tombol Kirim, Anda menyatakan telah memeriksa unit secara sungguh-sungguh sesuai standar keselamatan HSE PT. BESMINDO.
            </p>
          </div>

          <div className="pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-4 bg-[#16A34A] hover:bg-green-700 text-white rounded-xl font-bold text-sm sm:text-base shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2"
            >
              <CheckCircleIcon className="w-5 h-5" />
              <span>{submitting ? 'Mengirim Formulir...' : 'KIRIM FORMULIR INSPEKSI SEKARANG'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FillForm;