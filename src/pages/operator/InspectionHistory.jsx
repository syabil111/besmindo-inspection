import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { operatorAPI } from '../../services/api';
import {
  InspectionIcon,
  WarningIcon,
  CheckCircleIcon,
  SunIcon,
  MoonIcon,
  FilterIcon,
  ChevronRightIcon
} from '../../components/Icons';

const InspectionHistory = () => {
  const navigate = useNavigate();
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('');

  useEffect(() => {
    loadInspections();
  }, []);

  const loadInspections = async () => {
    try {
      setLoading(true);
      const res = await operatorAPI.getInspections();
      setInspections(res.data.data || []);
    } catch (err) {
      console.error('Failed to load operator history:', err);
    } finally {
      setLoading(false);
    }
  };

  const months = [...new Set(inspections.map(i => i.inspection_date?.substring(0, 7)).filter(Boolean))];

  const filtered = selectedMonth
    ? inspections.filter(i => i.inspection_date?.startsWith(selectedMonth))
    : inspections;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E4B8E]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-[#1A1A2E] tracking-tight">Riwayat Inspeksi Saya</h1>
          <p className="text-xs sm:text-sm text-[#6B7280]">Catatan seluruh formulir inspeksi yang pernah Anda kirimkan</p>
        </div>

        {/* Filter Bulan */}
        {months.length > 0 && (
          <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-xl border border-gray-200">
            <FilterIcon className="w-4 h-4 text-[#1E4B8E]" />
            <span className="text-xs font-bold text-gray-700">Filter Bulan:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-xs font-bold border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-[#1E4B8E] focus:outline-none bg-white"
            >
              <option value="">Semua Bulan</option>
              {months.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* List Submissions */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 border border-gray-200 text-center text-xs sm:text-sm text-gray-500 space-y-3 shadow-xs">
          <InspectionIcon className="w-12 h-12 mx-auto text-gray-400" />
          <p className="font-semibold">Belum ada catatan inspeksi pada periode ini.</p>
          <Link
            to="/select-form"
            className="inline-block px-5 py-2.5 bg-[#1E4B8E] text-white rounded-xl font-bold text-xs shadow-md hover:bg-[#163A6E] transition-colors"
          >
            Mulai Isi Formulir Sekarang
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(`/history/${item.id}`)}
              className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5E7EB] shadow-xs hover:border-[#1E4B8E] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="flex items-start space-x-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-xs ${
                  item.shift === '1st' ? 'bg-amber-500' : 'bg-indigo-700'
                }`}>
                  {item.shift === '1st' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-sm text-[#1A1A2E] group-hover:text-[#1E4B8E] transition-colors">{item.vehicle_number}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-gray-100 text-gray-700 font-semibold rounded-md border border-gray-200">
                      Shift {item.shift === '1st' ? 'Pagi' : 'Malam'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1 font-medium">
                    {item.form_name}
                  </div>
                  <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                    {item.inspection_date} {item.inspection_time ? `• ${item.inspection_time}` : ''}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                {item.broken_count > 0 ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                    <WarningIcon className="w-3.5 h-3.5 mr-1" />
                    {item.broken_count} Rusak
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 border border-green-200">
                    <CheckCircleIcon className="w-3.5 h-3.5 mr-1" />
                    Semua Bagus
                  </span>
                )}
                <div className="w-7 h-7 rounded-full bg-gray-50 group-hover:bg-[#1E4B8E] group-hover:text-white text-gray-400 flex items-center justify-center transition-colors">
                  <ChevronRightIcon className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InspectionHistory;