import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { operatorAPI } from '../../services/api';
import {
  ArrowLeftIcon,
  CheckIcon,
  CrossIcon,
  MinusIcon,
  WarningIcon,
  CheckCircleIcon,
  SunIcon,
  MoonIcon
} from '../../components/Icons';

const OperatorInspectionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDetail();
  }, [id]);

  const loadDetail = async () => {
    try {
      setLoading(true);
      const res = await operatorAPI.getInspectionDetail(id);
      setData(res.data.data);
    } catch (err) {
      console.error('Failed to load operator inspection detail:', err);
      alert('Gagal memuat detail inspeksi.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E4B8E]"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-center text-xs text-gray-500">
        Data inspeksi tidak ditemukan.
      </div>
    );
  }

  const results = data.results || [];
  const brokenItems = results.filter(r => r.condition === 'broken');
  const goodItems = results.filter(r => r.condition === 'good');
  const naItems = results.filter(r => r.condition === 'na');

  const groupedResults = results.reduce((acc, curr) => {
    const cat = curr.category_name || 'Checklist Pemeriksaan';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(curr);
    return acc;
  }, {});

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header Bar */}
      <div className="flex items-center space-x-3 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs">
        <button
          onClick={() => navigate('/history')}
          className="p-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 hover:text-[#1E4B8E] hover:bg-blue-50 transition-colors cursor-pointer"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-lg sm:text-xl font-black text-[#1A1A2E] leading-tight">Detail Hasil Inspeksi Armada</h2>
          <span className="text-xs text-gray-500 font-mono">{data.form_name}</span>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-md text-xs sm:text-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-3 gap-2">
          <div>
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Unit Kendaraan Armada</span>
            <div className="text-xl sm:text-2xl font-black text-[#1E4B8E] mt-0.5">{data.vehicle_number || data.sn_engine}</div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold font-mono ${
              data.shift === '1st' ? 'bg-amber-100 text-amber-900 border border-amber-200' : 'bg-indigo-100 text-indigo-900 border border-indigo-200'
            }`}>
              {data.shift === '1st' ? <SunIcon className="w-4 h-4 mr-1.5" /> : <MoonIcon className="w-4 h-4 mr-1.5" />}
              Shift {data.shift === '1st' ? 'Pagi (1st)' : 'Malam (2nd)'}
            </span>
            <div className="text-xs text-gray-500 font-mono font-semibold bg-gray-100 px-3 py-1 rounded-xl border border-gray-200">{data.inspection_date}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-200">
          <div>
            <span className="text-gray-400 text-[10px] font-bold uppercase block">Departemen</span>
            <strong className="text-gray-900">{data.department || '-'}</strong>
          </div>
          <div>
            <span className="text-gray-400 text-[10px] font-bold uppercase block">Lokasi Unit</span>
            <strong className="text-gray-900">{data.location || '-'}</strong>
          </div>
          <div>
            <span className="text-gray-400 text-[10px] font-bold uppercase block">Status Review HSE</span>
            <strong className={data.acknowledged_by ? 'text-green-700' : 'text-amber-700'}>
              {data.acknowledged_by ? 'Disetujui Admin' : 'Menunggu Review'}
            </strong>
          </div>
          <div>
            <span className="text-gray-400 text-[10px] font-bold uppercase block">KM / Jam Mesin</span>
            <strong className="text-gray-900">{data.km_reading_value || data.running_hours || '-'}</strong>
          </div>
        </div>

        {/* Breakdown KPI */}
        <div className="grid grid-cols-3 gap-3 pt-2 text-center font-bold text-xs sm:text-sm">
          <div className="p-3 bg-green-50 text-green-700 rounded-xl border border-green-200 shadow-xs">
            <div className="text-xl font-black">{goodItems.length}</div>
            <div className="text-[10px] uppercase tracking-wider font-bold">Kondisi Bagus</div>
          </div>
          <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 shadow-xs">
            <div className="text-xl font-black">{brokenItems.length}</div>
            <div className="text-[10px] uppercase tracking-wider font-bold">Item Rusak</div>
          </div>
          <div className="p-3 bg-gray-50 text-gray-700 rounded-xl border border-gray-200 shadow-xs">
            <div className="text-xl font-black">{naItems.length}</div>
            <div className="text-[10px] uppercase tracking-wider font-bold">N / A</div>
          </div>
        </div>
      </div>

      {/* Kerusakan yang dilaporkan */}
      {brokenItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-xs sm:text-sm space-y-2.5 shadow-xs">
          <div className="flex items-center space-x-2 text-red-800 font-extrabold text-sm">
            <WarningIcon className="w-5 h-5 text-red-600" />
            <span>{brokenItems.length} Item Rusak Dilaporkan Ke Tim HSE:</span>
          </div>
          <ul className="space-y-1.5 pl-3 text-xs sm:text-sm">
            {brokenItems.map((item, idx) => (
              <li key={idx} className="text-red-900 list-disc">
                <strong>{item.description}</strong>: <em>"{item.notes}"</em>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Checklist items read only */}
      <div className="space-y-4">
        <h3 className="text-sm sm:text-base font-bold text-gray-900 px-1">
          Daftar Lengkap Hasil Item Pemeriksaan (Read-Only)
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Object.entries(groupedResults).map(([catName, items], catIdx) => (
            <div key={catIdx} className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-xs space-y-3">
              <h4 className="font-extrabold text-xs sm:text-sm text-[#1E4B8E] border-b border-gray-100 pb-2 uppercase tracking-wide">
                {catName}
              </h4>
              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-start justify-between text-xs sm:text-sm py-1.5 border-b border-gray-50 last:border-none">
                    <span className="text-gray-800 font-medium pr-2">{idx + 1}. {item.description}</span>
                    <div className="flex-shrink-0">
                      {item.condition === 'good' && (
                        <span className="inline-flex items-center text-[10px] font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-lg border border-green-200">
                          <CheckIcon className="w-3.5 h-3.5 mr-1" /> Bagus
                        </span>
                      )}
                      {item.condition === 'broken' && (
                        <span className="inline-flex items-center text-[10px] font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-lg border border-red-200">
                          <CrossIcon className="w-3.5 h-3.5 mr-1" /> Rusak
                        </span>
                      )}
                      {item.condition === 'na' && (
                        <span className="inline-flex items-center text-[10px] font-bold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg border border-gray-200">
                          <MinusIcon className="w-3.5 h-3.5 mr-1" /> N/A
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OperatorInspectionDetail;
