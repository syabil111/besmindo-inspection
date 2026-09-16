import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import {
  ArrowLeftIcon,
  PrintIcon,
  CheckIcon,
  CheckCircleIcon,
  WarningIcon,
  MinusIcon,
  ClockIcon,
  VehicleIcon,
  UsersIcon
} from '../../components/Icons';
import PrintableInspectionForm from '../../components/PrintableInspectionForm';

const InspectionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [acknowledging, setAcknowledging] = useState(false);

  const printComponentRef = useRef();

  useEffect(() => {
    loadDetail();
  }, [id]);

  const loadDetail = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getInspectionDetail(id);
      setData(res.data.data);
    } catch (err) {
      console.error('Failed to load inspection detail:', err);
      alert('Gagal mengambil detail inspeksi.');
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async () => {
    if (!confirm('Konfirmasi persetujuan (acknowledge) formulir inspeksi ini?')) return;
    try {
      setAcknowledging(true);
      await adminAPI.acknowledgeInspection(id);
      alert('Formulir berhasil di-acknowledge.');
      loadDetail();
    } catch (err) {
      alert('Gagal acknowledge: ' + (err.response?.data?.message || err.message));
    } finally {
      setAcknowledging(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-72">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1E4B8E]"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white p-8 rounded-xl border border-gray-200 text-center">
        <p className="text-gray-600">Inspeksi tidak ditemukan.</p>
        <button
          onClick={() => navigate('/admin/inspections')}
          className="mt-4 text-xs font-semibold text-[#1E4B8E] hover:underline"
        >
          ← Kembali ke Data Inspeksi
        </button>
      </div>
    );
  }

  const isAcknowledged = !!data.acknowledged_by || !!data.acknowledged_at;
  const results = data.results || [];
  const brokenItems = results.filter(r => r.condition === 'broken');
  const goodItems = results.filter(r => r.condition === 'good');
  const naItems = results.filter(r => r.condition === 'na');

  // Group checklist by category
  const groupedResults = results.reduce((acc, curr) => {
    const cat = curr.category_name || 'Checklist Pemeriksaan';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(curr);
    return acc;
  }, {});

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/admin/inspections')}
            className="p-2 bg-white hover:bg-gray-100 rounded-lg border border-gray-200 text-gray-600 transition-colors"
            title="Kembali"
          >
            <ArrowLeftIcon className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono text-gray-500">{data.form_code || 'BMSD/FORM'}</span>
              <span>•</span>
              <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                data.shift === '1st' ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'
              }`}>
                SHIFT {data.shift === '1st' ? 'PAGI (1st)' : 'MALAM (2nd)'}
              </span>
            </div>
            <h1 className="text-xl font-bold text-[#1A1A2E] tracking-tight mt-0.5">
              {data.form_name}
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          {!isAcknowledged ? (
            <button
              onClick={handleAcknowledge}
              disabled={acknowledging}
              className="inline-flex items-center space-x-1.5 bg-[#16A34A] hover:bg-green-700 text-white px-4 py-2 rounded-md text-xs font-semibold shadow-sm transition-colors"
            >
              <CheckIcon className="w-4 h-4" />
              <span>{acknowledging ? 'Memproses...' : 'Setujui / Acknowledge'}</span>
            </button>
          ) : (
            <span className="inline-flex items-center space-x-1 bg-blue-50 border border-blue-200 text-[#1E4B8E] px-3 py-1.5 rounded-md text-xs font-semibold">
              <CheckCircleIcon className="w-4 h-4 text-[#1E4B8E]" />
              <span>Sudah Disetujui ({data.acknowledged_by_name || 'Admin'})</span>
            </span>
          )}

          <button
            onClick={() => setShowPrintModal(true)}
            className="inline-flex items-center space-x-1.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 px-3.5 py-2 rounded-md text-xs font-semibold shadow-sm transition-colors"
          >
            <PrintIcon className="w-4 h-4 text-gray-600" />
            <span>Cetak Hardfile</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-[11px] font-medium text-gray-500 uppercase">Unit Kendaraan</span>
          <p className="text-base font-bold text-[#1E4B8E] mt-1">{data.vehicle_number || data.sn_engine}</p>
          <span className="text-[10px] text-gray-400">{data.vehicle_type || data.model || 'Alat Berat'}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-[11px] font-medium text-gray-500 uppercase">Nama Operator</span>
          <p className="text-base font-bold text-gray-900 mt-1">{data.operator_name || 'Operator Lapangan'}</p>
          <span className="text-[10px] text-gray-400">{data.department || 'Operasional'}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-[11px] font-medium text-gray-500 uppercase">Tanggal & Jam</span>
          <p className="text-base font-bold text-gray-900 mt-1">{data.inspection_date}</p>
          <span className="text-[10px] text-gray-400">{data.inspection_time || 'Jam tidak tercatat'}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-[11px] font-medium text-gray-500 uppercase">Kondisi Checklist</span>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded">
              {goodItems.length} Bagus
            </span>
            <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">
              {brokenItems.length} Rusak
            </span>
            <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
              {naItems.length} N/A
            </span>
          </div>
        </div>
      </div>

      {/* Alert Jika Ada Kerusakan */}
      {brokenItems.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl shadow-sm">
          <div className="flex items-center space-x-2 text-red-800 font-bold text-sm mb-2">
            <WarningIcon className="w-5 h-5 text-red-600" />
            <span>PERINGATAN: DITEMUKAN {brokenItems.length} ITEM RUSAK PADA UNIT INI</span>
          </div>
          <div className="space-y-2">
            {brokenItems.map((item, idx) => (
              <div key={idx} className="bg-white p-3 rounded-lg border border-red-200 text-xs">
                <span className="font-bold text-red-900">{item.description}</span>
                <p className="text-gray-700 mt-1 italic">
                  Catatan Operator: "{item.notes || 'Tidak ada catatan tertulis.'}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detail Header & Personal Documents */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Header Data Card */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <h3 className="font-bold text-sm text-[#1A1A2E] mb-3 pb-2 border-b border-gray-100">
            Parameter Data Unit
          </h3>
          <dl className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <dt className="text-gray-500">Nomor Registrasi / SN:</dt>
              <dd className="font-semibold">{data.vehicle_number || data.sn_engine || '-'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Tipe / Model:</dt>
              <dd className="font-semibold">{data.vehicle_type || data.model || '-'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Departemen / Rig:</dt>
              <dd className="font-semibold">{data.department || '-'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Lokasi:</dt>
              <dd className="font-semibold">{data.location || '-'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Status Asset:</dt>
              <dd className="font-semibold">{data.asset_status || 'Operasional'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Odometer / Jam Mesin:</dt>
              <dd className="font-semibold">
                {data.km_reading_value ? `${data.km_reading_value} KM` : ''}
                {data.running_hours ? `${data.running_hours} Hours` : ''}
                {!data.km_reading_value && !data.running_hours ? '-' : ''}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Masa Berlaku Pajak:</dt>
              <dd className="font-semibold">{data.exp_pajak || '-'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Masa Berlaku KIUR:</dt>
              <dd className="font-semibold">{data.exp_kiur || '-'}</dd>
            </div>
          </dl>
        </div>

        {/* Personal Documents Card */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <h3 className="font-bold text-sm text-[#1A1A2E] mb-3 pb-2 border-b border-gray-100">
            Dokumen Legalitas Pengemudi
          </h3>
          {data.documents && data.documents.length > 0 ? (
            <div className="space-y-3 text-xs">
              {data.documents.map((doc, idx) => (
                <div key={idx} className="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="font-bold text-[#1E4B8E]">{doc.doc_type?.replace('_', ' ')}</div>
                  <div className="flex justify-between mt-1 text-gray-700">
                    <span>No (1st): <strong>{doc.doc_number_1st || '-'}</strong></span>
                    <span>Exp: <strong>{doc.expiry_date_1st || '-'}</strong></span>
                  </div>
                  {doc.doc_number_2nd && (
                    <div className="flex justify-between mt-1 text-gray-500 text-[11px]">
                      <span>No (2nd): {doc.doc_number_2nd}</span>
                      <span>Exp: {doc.expiry_date_2nd || '-'}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-gray-400 py-6 text-center">
              Tidak ada dokumen pengemudi yang dilampirkan (alat berat / formulir dozer).
            </div>
          )}
        </div>
      </div>

      {/* Categorized Checklist Results */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-bold text-sm text-[#1A1A2E]">
            Detail Lembar Checklist Pemeriksaan
          </h3>
          <span className="text-xs text-gray-500">
            Total {results.length} Item Diperiksa
          </span>
        </div>

        <div className="divide-y divide-gray-200">
          {Object.entries(groupedResults).map(([catName, items], catIdx) => (
            <div key={catIdx} className="p-5">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#1E4B8E] mb-3">
                {catName}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border text-xs flex flex-col justify-between ${
                      item.condition === 'broken'
                        ? 'bg-red-50/60 border-red-200'
                        : item.condition === 'good'
                        ? 'bg-white border-gray-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="font-medium text-gray-900 pr-2">{item.description}</span>
                      {item.condition === 'good' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 flex-shrink-0">
                          <CheckIcon className="w-3 h-3 mr-1" /> BAGUS
                        </span>
                      )}
                      {item.condition === 'broken' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 flex-shrink-0">
                          <WarningIcon className="w-3 h-3 mr-1" /> RUSAK
                        </span>
                      )}
                      {item.condition === 'na' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-200 text-gray-700 flex-shrink-0">
                          <MinusIcon className="w-3 h-3 mr-1" /> N/A
                        </span>
                      )}
                    </div>
                    {item.condition === 'broken' && item.notes && (
                      <p className="mt-2 text-[11px] text-red-800 bg-white/80 p-2 rounded border border-red-100 font-medium">
                        Catatan: {item.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Print Preview */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-200 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="font-bold text-sm text-[#1A1A2E]">
                Format Cetak Resmi Hardfile PT. BESMINDO
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="bg-[#1E4B8E] hover:bg-[#2E6BC4] text-white px-3.5 py-1.5 rounded text-xs font-semibold flex items-center space-x-1"
                >
                  <PrintIcon className="w-3.5 h-3.5" />
                  <span>Cetak Sekarang</span>
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="text-gray-500 hover:text-gray-800 px-2 py-1 text-xs"
                >
                  Tutup
                </button>
              </div>
            </div>

            <div className="p-4 bg-gray-100/50">
              <PrintableInspectionForm
                ref={printComponentRef}
                inspection={data}
                results={data.results}
                documents={data.documents}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InspectionDetail;

