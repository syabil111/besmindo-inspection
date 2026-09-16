import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { operatorAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  DozerIcon,
  BusIcon,
  TruckIcon,
  LowbadIcon,
  CheckCircleIcon,
  ClockIcon,
  WarningIcon,
  SunIcon,
  MoonIcon,
  ChevronRightIcon
} from '../../components/Icons';

const OperatorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [todayStatus, setTodayStatus] = useState(null);
  const [recentInspections, setRecentInspections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statusRes, historyRes] = await Promise.all([
        operatorAPI.getTodayStatus(),
        operatorAPI.getInspections()
      ]);
      setTodayStatus(statusRes.data.data);
      setRecentInspections((historyRes.data.data || []).slice(0, 3));
    } catch (err) {
      console.error('Failed to load operator dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formCards = [
    {
      type: 'dozer',
      title: 'Unit Dozer',
      desc: 'Heavy Duty Equipment (BMSD/04/FO/HSE/02/17)',
      icon: DozerIcon,
      bgColor: 'bg-amber-500',
      tag: 'Alat Berat'
    },
    {
      type: 'lv_bus',
      title: 'LV & Bus',
      desc: 'Kendaraan Ringan & Bus Crew (BMSD/01/FO/TRN/11/22)',
      icon: BusIcon,
      bgColor: 'bg-blue-600',
      tag: 'Transport'
    },
    {
      type: 'vacum',
      title: 'Vacum Truck',
      desc: 'Truk Tangki Vacum & Pompa (BMSD/12/FO/TRN/11/22)',
      icon: TruckIcon,
      bgColor: 'bg-emerald-600',
      tag: 'Rig Support'
    },
    {
      type: 'tandem',
      title: 'Tandem & Lowbad',
      desc: 'Trailer Angkut Berat 40T (BMSD/10/FO/TRN/11/22)',
      icon: LowbadIcon,
      bgColor: 'bg-indigo-600',
      tag: 'Heavy Move'
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E4B8E]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Section: Banner Sapaan & Status Pemeriksaan Hari Ini */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Banner Sapaan (Span 2 Kolom di Desktop) */}
        <div className="lg:col-span-2 bg-gradient-to-r from-[#1E4B8E] via-[#245BB0] to-[#2E6BC4] text-white p-5 sm:p-6 rounded-2xl shadow-md flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
          <div>
            <span className="text-[11px] uppercase tracking-wider text-blue-200 font-bold bg-white/15 px-2.5 py-1 rounded-full border border-white/20 inline-block mb-2">
              Selamat Bertugas
            </span>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Pak {user?.name || 'Operator'}
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 mt-1.5 leading-relaxed max-w-xl">
              Lakukan inspeksi pra-operasi sebelum mengemudi atau mengoperasikan unit armada PT. BESMINDO.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-xs text-blue-100">
            <span>Sistem Digitalisasi Formulir HSE & Transport</span>
            <span className="font-semibold text-white">Versi 2.0</span>
          </div>
        </div>

        {/* STATUS INSPEKSI HARI INI */}
        <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800">
                Status Inspeksi Hari Ini
              </h3>
              <span className="text-[10px] text-[#1E4B8E] bg-blue-50 font-mono px-2 py-0.5 rounded-md border border-blue-100">
                {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
              {/* Shift Pagi */}
              <div className={`p-3.5 rounded-xl border flex items-center space-x-3 transition-colors ${
                todayStatus?.pagi_done
                  ? 'bg-green-50/80 border-green-200 text-green-900'
                  : 'bg-amber-50/70 border-amber-200 text-amber-900'
              }`}>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 shadow-xs ${
                  todayStatus?.pagi_done ? 'bg-green-600 text-white' : 'bg-amber-500 text-white'
                }`}>
                  <SunIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-bold">Shift Pagi (1st)</div>
                  <div className="text-xs font-semibold flex items-center mt-0.5">
                    {todayStatus?.pagi_done ? (
                      <span className="text-green-700 font-bold flex items-center">
                        <CheckCircleIcon className="w-3.5 h-3.5 mr-1" /> Sudah Terisi
                      </span>
                    ) : (
                      <span className="text-amber-700 font-medium flex items-center">
                        <ClockIcon className="w-3.5 h-3.5 mr-1" /> Belum Diisi
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Shift Malam */}
              <div className={`p-3.5 rounded-xl border flex items-center space-x-3 transition-colors ${
                todayStatus?.malam_done
                  ? 'bg-green-50/80 border-green-200 text-green-900'
                  : 'bg-gray-50 border-gray-200 text-gray-800'
              }`}>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 shadow-xs ${
                  todayStatus?.malam_done ? 'bg-green-600 text-white' : 'bg-indigo-700 text-white'
                }`}>
                  <MoonIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-bold">Shift Malam (2nd)</div>
                  <div className="text-xs font-semibold flex items-center mt-0.5">
                    {todayStatus?.malam_done ? (
                      <span className="text-green-700 font-bold flex items-center">
                        <CheckCircleIcon className="w-3.5 h-3.5 mr-1" /> Sudah Terisi
                      </span>
                    ) : (
                      <span className="text-gray-500 font-medium flex items-center">
                        <ClockIcon className="w-3.5 h-3.5 mr-1" /> Belum Diisi
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PILIH FORMULIR INSPEKSI (4 Form Types Grid) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-gray-900">
              Pilih Jenis Formulir Inspeksi
            </h3>
            <p className="text-xs text-gray-500">Pilih kategori armada yang akan diinspeksi sebelum pengoperasian</p>
          </div>
          <span className="text-xs text-[#1E4B8E] font-semibold bg-blue-50 px-3 py-1 rounded-full border border-blue-100 hidden sm:inline-block">
            4 Kategori Armada
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {formCards.map((form) => {
            const Icon = form.icon;
            return (
              <button
                key={form.type}
                onClick={() => navigate(`/select-form?type=${form.type}`)}
                className="bg-white hover:bg-blue-50/40 p-4 sm:p-5 rounded-2xl border border-[#E5E7EB] hover:border-[#1E4B8E] shadow-xs hover:shadow-md flex flex-col justify-between text-left transition-all duration-200 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-12 h-12 rounded-xl ${form.bgColor} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-semibold bg-gray-100 group-hover:bg-blue-100 group-hover:text-[#1E4B8E] text-gray-600 px-2.5 py-0.5 rounded-full transition-colors">
                      {form.tag}
                    </span>
                  </div>
                  <h4 className="font-bold text-base text-[#1A1A2E] group-hover:text-[#1E4B8E] transition-colors">{form.title}</h4>
                  <p className="text-xs text-[#6B7280] mt-1 leading-relaxed line-clamp-2">{form.desc}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#1E4B8E]">
                  <span>Pilih Form Ini</span>
                  <div className="w-7 h-7 rounded-full bg-blue-50 group-hover:bg-[#1E4B8E] group-hover:text-white flex items-center justify-center transition-colors">
                    <ChevronRightIcon className="w-4 h-4" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* RIWAYAT SINGKAT (3 Pengisian Terakhir) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-gray-900">
              Riwayat Pengisian Terakhir
            </h3>
            <p className="text-xs text-gray-500">Formulir inspeksi yang telah Anda kirimkan baru-baru ini</p>
          </div>
          <Link to="/history" className="text-xs font-bold text-[#1E4B8E] hover:underline flex items-center">
            Lihat Semua Riwayat →
          </Link>
        </div>

        {recentInspections.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-[#E5E7EB] text-center text-xs text-gray-500 shadow-xs">
            Anda belum pernah mengisi formulir inspeksi.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {recentInspections.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/history/${item.id}`)}
                className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-xs hover:border-[#1E4B8E] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#1A1A2E]">{item.vehicle_number}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-gray-100 text-gray-700 font-semibold rounded-md border border-gray-200">
                      Shift {item.shift}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {item.form_name}
                  </div>
                  <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                    {item.inspection_date}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] text-gray-500 font-medium">Status Hasil:</span>
                  {item.broken_count > 0 ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                      <WarningIcon className="w-3 h-3 mr-1" />
                      {item.broken_count} Rusak
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 border border-green-200">
                      <CheckCircleIcon className="w-3 h-3 mr-1" />
                      Semua Bagus
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OperatorDashboard;