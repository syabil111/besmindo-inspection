import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  InspectionIcon,
  WarningIcon,
  UsersIcon,
  VehicleIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ClockIcon
} from '../../components/Icons';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shiftFilter, setShiftFilter] = useState('all');
  const [searchVehicle, setSearchVehicle] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await adminAPI.getDashboard();
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-72">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1E4B8E]"></div>
      </div>
    );
  }

  const conditionColors = {
    'Bagus': '#16A34A',
    'Rusak': '#DC2626',
    'N/A': '#9CA3AF'
  };

  const vehicleList = stats?.vehicle_shift_status || [];
  const filteredVehicles = vehicleList.filter(v => {
    if (shiftFilter === 'completely_uninspected' && !v.is_completely_uninspected) return false;
    if (shiftFilter === 'missing_morning' && v.has_morning) return false;
    if (shiftFilter === 'missing_evening' && v.has_evening) return false;
    if (shiftFilter === 'complete_both' && (!v.has_morning || !v.has_evening)) return false;

    if (searchVehicle.trim()) {
      const q = searchVehicle.toLowerCase();
      const matchNumber = (v.vehicle_number || '').toLowerCase().includes(q);
      const matchType = (v.vehicle_type || '').toLowerCase().includes(q);
      const matchDept = (v.department || '').toLowerCase().includes(q);
      if (!matchNumber && !matchType && !matchDept) return false;
    }

    return true;
  });

  return (
    <div className="space-y-7">
      {/* Top Welcome & Summary Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E] dark:text-white dark:text-white tracking-tight">
            Ringkasan Operasional Lapangan
          </h1>
          <p className="text-xs text-[#6B7280] dark:text-gray-400 mt-1">
            Monitoring formulir inspeksi harian armada dan alat berat PT. BESMINDO secara real-time.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/admin/inspections"
            className="inline-flex items-center space-x-2 bg-[#1E4B8E] hover:bg-[#163A6E] dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <InspectionIcon className="w-4 h-4" />
            <span>Lihat Semua Inspeksi</span>
          </Link>
          <Link
            to="/admin/reports"
            className="inline-flex items-center space-x-2 bg-[#F0E5CF] hover:bg-[#e4d7be] dark:bg-gray-700 dark:hover:bg-gray-600 text-[#1E4B8E] dark:text-gray-200 border border-[#C8C6C6] dark:border-gray-600 px-4 py-2 rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <span>Rekap &amp; Cetak</span>
          </Link>
        </div>
      </div>

      {/* 4 Stats Cards (Row Atas) - Clean & Basic */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Inspeksi Hari Ini */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-slate-200 dark:border-gray-700 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-gray-400">
              Inspeksi Hari Ini
            </p>
            <p className="text-2xl font-bold text-[#1E4B8E] mt-1 font-mono">
              {stats?.inspections_today || 0}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Shift Pagi &amp; Malam
            </p>
          </div>
          <div className="w-11 h-11 bg-blue-50 text-[#1E4B8E] rounded-lg flex items-center justify-center">
            <InspectionIcon className="w-6 h-6" />
          </div>
        </div>

        {/* Total Item Rusak Hari Ini */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-slate-200 dark:border-gray-700 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-gray-400">
              Item Rusak Hari Ini
            </p>
            <p className="text-2xl font-bold text-red-600 mt-1 font-mono">
              {stats?.broken_items_today || 0}
            </p>
            <p className="text-[11px] text-red-600 mt-1 font-medium">
              {(stats?.broken_items_today || 0) > 0 ? 'Perlu Perbaikan' : 'Semua Normal'}
            </p>
          </div>
          <div className="w-11 h-11 bg-red-50 text-red-600 rounded-lg flex items-center justify-center">
            <WarningIcon className="w-6 h-6" />
          </div>
        </div>

        {/* Operator Aktif */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-slate-200 dark:border-gray-700 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-gray-400">
              Operator Aktif
            </p>
            <p className="text-2xl font-bold text-green-600 mt-1 font-mono">
              {stats?.active_operators || 0}
            </p>
            <p className="text-[11px] text-green-600 mt-1 font-medium">
              Sedang Bertugas
            </p>
          </div>
          <div className="w-11 h-11 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
            <UsersIcon className="w-6 h-6" />
          </div>
        </div>

        {/* Kendaraan Belum Diinspeksi */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-slate-200 dark:border-gray-700 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-gray-400">
              Belum Diinspeksi Hari Ini
            </p>
            <p className="text-2xl font-bold text-amber-600 mt-1 font-mono">
              {stats?.shift_tracking_stats?.completely_uninspected ?? stats?.vehicles_not_inspected?.length ?? 0}
              <span className="text-xs text-slate-400 font-normal ml-1">unit</span>
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Pagi: {stats?.shift_tracking_stats?.missing_morning ?? 0} | Malam: {stats?.shift_tracking_stats?.missing_evening ?? 0}
            </p>
          </div>
          <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
            <VehicleIcon className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ALERT PANEL: Item Rusak Dilaporkan (Grouped by Master Vehicle) - Clean Version */}
      {stats?.broken_items_alert && stats.broken_items_alert.length > 0 && (
        <div className="bg-red-50/70 border border-red-200 rounded-xl p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center space-x-2 text-red-800 font-bold text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
              <WarningIcon className="w-4 h-4 text-red-600" />
              <span>
                Peringatan Unit Rusak ({stats.broken_items_alert.length} Unit Kendaraan • {stats.total_broken_items_count || stats.broken_items_today || stats.broken_items_alert.length} Item)
              </span>
            </div>
            <Link
              to="/admin/inspections?has_broken=true"
              className="text-xs text-red-700 hover:text-red-900 font-semibold hover:underline"
            >
              Lihat Semua Temuan Rusak →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.broken_items_alert.map((alert, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-red-200/90 shadow-sm text-xs hover:shadow-md hover:border-red-300 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Header: Master Kendaraan, Total Rusak & Shift */}
                  <div className="flex items-start justify-between font-semibold text-red-900 dark:text-red-300 mb-2 pb-2 border-b border-red-100/80 dark:border-gray-700">
                    <div>
                      <span className="text-sm font-bold tracking-tight text-[#1A1A2E] dark:text-white block">
                        {alert.vehicle_number}
                      </span>
                      {alert.vehicle_type && (
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 font-normal">
                          {alert.vehicle_type}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1.5 flex-shrink-0">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold border border-red-200/80 shadow-xs">
                        {alert.items?.length || 1} Rusak
                      </span>
                      <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded font-mono font-bold ${
                        alert.shift === '1st' ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {alert.shift === '1st' ? '1st (Pagi)' : '2nd (Malam)'}
                      </span>
                    </div>
                  </div>

                  {/* List Item Rusak dalam 1 Master Kendaraan */}
                  <div className="space-y-2 mt-2.5">
                    {alert.items && alert.items.length > 0 ? (
                      alert.items.map((item, itemIdx) => (
                        <div
                          key={itemIdx}
                          className="bg-red-50/50 dark:bg-gray-700/50 p-2.5 rounded-lg border border-red-100/70 dark:border-gray-600/60"
                        >
                          <div className="flex items-start space-x-1.5 font-semibold text-[#1A1A2E] dark:text-white text-xs">
                            <span className="text-red-500 font-bold leading-none mt-0.5">•</span>
                            <span className="leading-snug">{item.item_description}</span>
                          </div>
                          {item.notes && (
                            <p className="text-[#6B7280] dark:text-gray-300 italic text-[11px] mt-1 pl-2.5 border-l-2 border-red-300 dark:border-red-500">
                              "{item.notes}"
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="bg-red-50/50 dark:bg-gray-700/50 p-2.5 rounded-lg border border-red-100/70 dark:border-gray-600/60">
                        <div className="font-semibold text-[#1A1A2E] dark:text-white text-xs">
                          {alert.item_description}
                        </div>
                        {alert.notes && (
                          <p className="text-[#6B7280] dark:text-gray-300 italic text-[11px] mt-1">
                            "{alert.notes}"
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer: Operator & Tombol Periksa */}
                <div className="mt-3.5 pt-2.5 border-t border-gray-100 dark:border-gray-700 text-[10px] text-gray-500 flex justify-between items-center">
                  <div>
                    <span>Operator: <strong className="text-gray-700 dark:text-gray-300">{alert.operator_name}</strong></span>
                    {alert.inspection_date && (
                      <span className="block text-[9px] text-gray-400 font-mono mt-0.5">
                        Tgl: {alert.inspection_date}
                      </span>
                    )}
                  </div>
                  <Link
                    to={`/admin/inspections/${alert.inspection_id}`}
                    className="inline-flex items-center px-2.5 py-1 rounded bg-[#1E4B8E]/10 hover:bg-[#1E4B8E] text-[#1E4B8E] hover:text-white font-bold text-[11px] transition-colors"
                  >
                    Periksa &amp; Setujui →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts Section: Bar Chart & Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grafik Bar: Inspeksi 7 Hari Terakhir (Span 2) */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 border border-slate-200 dark:border-gray-700/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-[#1A1A2E] dark:text-white tracking-tight">
                Tren Inspeksi Harian (7 Hari Terakhir)
              </h3>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">Jumlah formulir inspeksi yang berhasil disubmit operator</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.trend_7_days || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" stroke="#6B7280" fontSize={11} tickLine={false} />
                <YAxis stroke="#6B7280" fontSize={11} allowDecimals={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#162F5C', borderRadius: '8px', color: '#fff', fontSize: '11px', border: 'none' }}
                  labelStyle={{ color: '#F0E5CF' }}
                />
                <Bar dataKey="total" fill="#1E4B8E" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grafik Donut: Persentase Kondisi Bagus vs Rusak vs N/A */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-slate-200 dark:border-gray-700/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-[#1A1A2E] dark:text-white tracking-tight">
              Kondisi Hasil Checklist
            </h3>
            <p className="text-xs text-[#6B7280] mt-0.5">Rasio pemeriksaan Bagus vs Rusak vs N/A</p>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.condition_stats || [
                    { name: 'Bagus', value: 85, color: '#16A34A' },
                    { name: 'Rusak', value: 3, color: '#DC2626' },
                    { name: 'N/A', value: 12, color: '#9CA3AF' }
                  ]}
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {(stats?.condition_stats || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || conditionColors[entry.name]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#162F5C', borderRadius: '8px', color: '#fff', fontSize: '11px', border: 'none' }}
                />
                <Legend
                  formatter={(value) => <span className="text-xs text-gray-700 font-medium">{value}</span>}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SECTION: Status Ketersediaan Kendaraan Hari Ini (Tabel Sederhana & Mudah Dipahami) */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
        {/* Header Bersih dengan Pencarian & Filter */}
        <div className="p-5 border-b border-slate-200 dark:border-gray-700/80 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 bg-slate-50/60">
          <div>
            <h3 className="text-sm font-bold text-[#1A1A2E] dark:text-white">
              Ketersediaan Master Kendaraan Hari Ini
            </h3>
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
              Monitoring unit yang belum diinspeksi pagi, malam, atau sama sekali belum ada formulir
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            {/* Kolom Pencarian Cepat */}
            <div className="relative">
              <input
                type="text"
                placeholder="Cari No. Polisi / Tipe..."
                value={searchVehicle}
                onChange={(e) => setSearchVehicle(e.target.value)}
                className="w-full sm:w-52 text-xs px-3 py-1.5 bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-[#1E4B8E] placeholder-gray-400 dark:text-white"
              />
              {searchVehicle && (
                <button
                  onClick={() => setSearchVehicle('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
                  title="Hapus pencarian"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Tombol Sederhana */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <button
                onClick={() => setShiftFilter('all')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                  shiftFilter === 'all'
                    ? 'bg-[#1E4B8E] text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                Semua ({stats?.shift_tracking_stats?.total_vehicles || stats?.vehicle_shift_status?.length || 0})
              </button>
              <button
                onClick={() => setShiftFilter('completely_uninspected')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                  shiftFilter === 'completely_uninspected'
                    ? 'bg-amber-600 text-white'
                    : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
                }`}
              >
                Belum Diinspeksi ({stats?.shift_tracking_stats?.completely_uninspected || 0})
              </button>
              <button
                onClick={() => setShiftFilter('missing_morning')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                  shiftFilter === 'missing_morning'
                    ? 'bg-orange-600 text-white'
                    : 'bg-white text-orange-700 border border-orange-200 hover:bg-orange-50'
                }`}
              >
                Belum Pagi ({stats?.shift_tracking_stats?.missing_morning || 0})
              </button>
              <button
                onClick={() => setShiftFilter('missing_evening')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                  shiftFilter === 'missing_evening'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50'
                }`}
              >
                Belum Malam ({stats?.shift_tracking_stats?.missing_evening || 0})
              </button>
            </div>
          </div>
        </div>

        {/* Tabel Sederhana */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F7F6F2] border-b border-[#C8C6C6] text-slate-700 font-bold">
                <th className="py-3 px-4">No. Unit / Polisi</th>
                <th className="py-3 px-4">Tipe Kendaraan</th>
                <th className="py-3 px-4">Departemen</th>
                <th className="py-3 px-4 text-center">Shift Pagi (1st)</th>
                <th className="py-3 px-4 text-center">Shift Malam (2nd)</th>
                <th className="py-3 px-4">Status Ketersediaan</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredVehicles.length > 0 ? (
                filteredVehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-800 dark:text-white">
                      {v.vehicle_number}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-gray-300">
                      {v.vehicle_type}
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {v.department}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {v.has_morning ? (
                        <span className="inline-block px-2.5 py-1 rounded bg-green-100 text-green-800 font-semibold text-[11px]">
                          Sudah ({v.morning_inspection?.time || '07:30'})
                        </span>
                      ) : (
                        <span className="inline-block px-2.5 py-1 rounded bg-red-50 text-red-700 font-medium text-[11px]">
                          Belum Diisi
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {v.has_evening ? (
                        <span className="inline-block px-2.5 py-1 rounded bg-green-100 text-green-800 font-semibold text-[11px]">
                          Sudah ({v.evening_inspection?.time || '19:30'})
                        </span>
                      ) : (
                        <span className="inline-block px-2.5 py-1 rounded bg-gray-100 text-gray-600 font-medium text-[11px]">
                          Belum Diisi
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {v.is_completely_uninspected ? (
                        <span className="inline-block px-2.5 py-1 rounded bg-amber-100 text-amber-900 font-bold text-[11px] border border-amber-200">
                          Tersedia Penuh (Belum Ada Form)
                        </span>
                      ) : v.has_morning && !v.has_evening ? (
                        <span className="inline-block px-2.5 py-1 rounded bg-yellow-50 text-yellow-800 font-semibold text-[11px] border border-yellow-200">
                          Tersedia Shift Malam
                        </span>
                      ) : !v.has_morning && v.has_evening ? (
                        <span className="inline-block px-2.5 py-1 rounded bg-blue-50 text-blue-800 font-semibold text-[11px] border border-blue-200">
                          Tersedia Shift Pagi
                        </span>
                      ) : (
                        <span className="inline-block px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-semibold text-[11px]">
                          Sudah Lengkap (Pagi &amp; Malam)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {v.morning_inspection || v.evening_inspection ? (
                        <Link
                          to={`/admin/inspections/${v.morning_inspection?.id || v.evening_inspection?.id}`}
                          className="text-[#1E4B8E] hover:underline font-semibold text-[11px]"
                        >
                          Lihat Form
                        </Link>
                      ) : (
                        <span className="text-slate-400 text-[11px]">-</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-6 text-center text-gray-500">
                    Tidak ada kendaraan pada filter ini
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5 Pengisian Form Terbaru (Full Width) */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-gray-700/80 flex items-center justify-between bg-gradient-to-r from-white to-slate-50/30">
          <div>
            <h3 className="text-sm font-bold text-[#1A1A2E] dark:text-white">5 Pengisian Form Terbaru Hari Ini</h3>
            <p className="text-xs text-slate-500">Status kiriman formulir inspeksi real-time dari operator lapangan</p>
          </div>
          <Link
            to="/admin/inspections"
            className="text-xs font-bold text-[#1E4B8E] hover:underline flex items-center"
          >
            <span>Lihat Semua Riwayat</span>
            <ChevronRightIcon className="w-3.5 h-3.5 ml-0.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F7F6F2] border-b border-[#C8C6C6] text-slate-700 font-bold">
                <th className="py-3 px-4">Tanggal & Jam</th>
                <th className="py-3 px-4">Unit / No. Polisi</th>
                <th className="py-3 px-4">Operator</th>
                <th className="py-3 px-4">Shift</th>
                <th className="py-3 px-4">Kondisi Item</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats?.recent_inspections && stats.recent_inspections.length > 0 ? (
                stats.recent_inspections.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-3 px-4 font-mono text-gray-700">
                      {item.inspection_date} {item.inspection_time ? `• ${item.inspection_time}` : ''}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#1A1A2E] dark:text-white">{item.vehicle_number}</div>
                      <div className="text-[10px] text-[#6B7280]">{item.form_name}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-800">
                      {item.operator_name}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        item.shift === '1st' ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {item.shift === '1st' ? 'PAGI (1st)' : 'MALAM (2nd)'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {item.broken_count > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-[#DC2626]">
                          <WarningIcon className="w-3 h-3 mr-1" />
                          {item.broken_count} Rusak
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-[#16A34A]">
                          <CheckCircleIcon className="w-3 h-3 mr-1" />
                          Semua Bagus
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Link
                        to={`/admin/inspections/${item.id}`}
                        className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#F0E5CF] hover:bg-[#1E4B8E] text-[#1E4B8E] hover:text-white font-bold text-[11px] border border-[#C8C6C6] transition-colors"
                      >
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">
                    Belum ada data inspeksi hari ini
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
