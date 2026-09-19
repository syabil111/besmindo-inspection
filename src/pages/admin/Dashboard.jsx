import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
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
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    loadDashboard();
    const clockTimer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(clockTimer);
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
      <div className="flex items-center justify-center h-80">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-200 border-t-[#1E4B8E]"></div>
      </div>
    );
  }

  const conditionColors = {
    'Bagus': '#16A34A',
    'Rusak': '#DC2626',
    'N/A': '#94A3B8'
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

  // Calculate compliance / good rate
  const conditionStats = stats?.condition_stats || [
    { name: 'Bagus', value: 85, color: '#16A34A' },
    { name: 'Rusak', value: 3, color: '#DC2626' },
    { name: 'N/A', value: 12, color: '#94A3B8' }
  ];
  const totalConditionItems = conditionStats.reduce((acc, c) => acc + (c.value || 0), 0);
  const goodItemCount = conditionStats.find(c => c.name === 'Bagus')?.value || 0;
  const goodRate = totalConditionItems > 0 ? Math.round((goodItemCount / totalConditionItems) * 100) : 95;

  // Active shift logic based on current hour
  const currentHour = currentTime.getHours();
  const isMorningShift = currentHour >= 7 && currentHour < 17;
  const activeShiftName = isMorningShift ? 'Shift 1st (Pagi)' : 'Shift 2nd (Malam)';
  const activeShiftHours = isMorningShift ? '07:00 - 15:30 WIB' : '19:00 - 03:30 WIB';

  // Sample or recent operators for Team Collaboration widget
  const teamMembers = [
    {
      name: stats?.recent_inspections?.[0]?.operator_name || 'Budi Santoso',
      role: 'Inspector Senior',
      unit: stats?.recent_inspections?.[0]?.vehicle_number || 'BK 8192 XA',
      status: 'Selesai',
      statusColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
    },
    {
      name: stats?.recent_inspections?.[1]?.operator_name || 'Ahmad Rifai',
      role: 'Operator Heavy Equipment',
      unit: stats?.recent_inspections?.[1]?.vehicle_number || 'FL-04 Workshop',
      status: 'Bertugas',
      statusColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
    },
    {
      name: stats?.recent_inspections?.[2]?.operator_name || 'Hendra Wijaya',
      role: 'Operator Mobile Crane',
      unit: stats?.recent_inspections?.[2]?.vehicle_number || 'CR-02 Yard A',
      status: 'Selesai',
      statusColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
    },
    {
      name: stats?.recent_inspections?.[3]?.operator_name || 'Dedi Kurniawan',
      role: 'Operator LV Driver',
      unit: stats?.recent_inspections?.[3]?.vehicle_number || 'Hilux Operasional',
      status: 'Standby',
      statusColor: 'bg-slate-100 text-slate-700 dark:bg-gray-800 dark:text-gray-300'
    }
  ];



  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      {/* Top Header matching Dribbble (Big title, subtitle, pill buttons) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
        <div>
          <h1 className="text-3xl font-extrabold text-[#162F5C] dark:text-white tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs text-slate-400 dark:text-gray-400 mt-1">
            Pantau, tindak lanjuti, dan pastikan kelaikan operasional seluruh armada PT. BESMINDO.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/admin/inspections"
            className="inline-flex items-center space-x-2 bg-[#162F5C] hover:bg-[#1E4B8E] text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <span>+ Form Inspeksi</span>
          </Link>
          <Link
            to="/admin/reports"
            className="inline-flex items-center space-x-2 bg-white dark:bg-gray-900 hover:bg-slate-50 dark:hover:bg-gray-800 text-slate-700 dark:text-gray-200 border border-slate-200/80 dark:border-gray-700 px-5 py-2.5 rounded-full text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <span>Rekap &amp; Cetak</span>
          </Link>
        </div>
      </div>

      {/* Row 1: 4 KPI Cards (Dribbble Style with 1 Dark Highlight Card + Top-right arrow buttons) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Highlight Card (Deep Navy) - Total Inspeksi */}
        <div className="bg-gradient-to-br from-[#162F5C] via-[#1A3668] to-[#1E4B8E] rounded-3xl p-5 text-white shadow-lg shadow-blue-950/15 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -right-8 -bottom-8 w-28 h-28 rounded-full bg-white/5 blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200">Total Inspeksi</span>
            <Link
              to="/admin/inspections"
              className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-all shadow-xs"
              title="Lihat Semua Inspeksi"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            </Link>
          </div>
          <div className="my-3">
            <span className="text-4xl font-extrabold font-mono tracking-tight block">
              {stats?.inspections_today || 0}
            </span>
          </div>
          <div className="pt-1">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-[#F0E5CF] text-[11px] font-medium">
              <svg className="w-3 h-3 text-[#F0E5CF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Shift Pagi &amp; Malam</span>
            </span>
          </div>
        </div>

        {/* Card 2: Item Rusak */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-slate-200/80 dark:border-gray-800 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-gray-400">Item Rusak Hari Ini</span>
            <Link
              to="/admin/inspections?has_broken=true"
              className="w-8 h-8 rounded-full border border-slate-200 dark:border-gray-800 hover:border-slate-300 dark:hover:border-gray-700 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white transition-all"
              title="Lihat Temuan Rusak"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            </Link>
          </div>
          <div className="my-3">
            <span className={`text-4xl font-extrabold font-mono tracking-tight block ${(stats?.broken_items_today || 0) > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>
              {stats?.broken_items_today || 0}
            </span>
          </div>
          <div className="pt-1">
            <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-semibold ${
              (stats?.broken_items_today || 0) > 0
                ? 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${(stats?.broken_items_today || 0) > 0 ? 'bg-red-600' : 'bg-emerald-600'}`} />
              <span>{(stats?.broken_items_today || 0) > 0 ? 'Perlu Perbaikan Segera' : 'Semua Kondisi Normal'}</span>
            </span>
          </div>
        </div>

        {/* Card 3: Operator Aktif */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-slate-200/80 dark:border-gray-800 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-gray-400">Operator Aktif</span>
            <Link
              to="/admin/users"
              className="w-8 h-8 rounded-full border border-slate-200 dark:border-gray-800 hover:border-slate-300 dark:hover:border-gray-700 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white transition-all"
              title="Kelola Tim Operator"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            </Link>
          </div>
          <div className="my-3">
            <span className="text-4xl font-extrabold font-mono tracking-tight text-slate-900 dark:text-white block">
              {stats?.active_operators || 0}
            </span>
          </div>
          <div className="pt-1">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#1E4B8E] dark:bg-blue-950/40 dark:text-blue-300 text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1E4B8E]" />
              <span>Sedang Bertugas Lapangan</span>
            </span>
          </div>
        </div>

        {/* Card 4: Belum Diinspeksi */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-slate-200/80 dark:border-gray-800 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-gray-400">Belum Diinspeksi</span>
            <button
              onClick={() => {
                const el = document.getElementById('vehicle-table-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                setShiftFilter('completely_uninspected');
              }}
              className="w-8 h-8 rounded-full border border-slate-200 dark:border-gray-800 hover:border-slate-300 dark:hover:border-gray-700 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white transition-all cursor-pointer"
              title="Filter Unit Belum Cek"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            </button>
          </div>
          <div className="my-3">
            <span className="text-4xl font-extrabold font-mono tracking-tight text-slate-900 dark:text-white block">
              {stats?.shift_tracking_stats?.completely_uninspected ?? stats?.vehicles_not_inspected?.length ?? 0}
            </span>
          </div>
          <div className="pt-1">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 text-[11px] font-semibold">
              <span>Pagi: {stats?.shift_tracking_stats?.missing_morning ?? 0} • Malam: {stats?.shift_tracking_stats?.missing_evening ?? 0}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Row 2: Middle 2-Column Grid (Project Analytics, Reminders) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Col 1: Project Analytics (7-Day Bar Chart) - 8 Cols */}
        <div className="lg:col-span-8 bg-white dark:bg-gray-900 rounded-3xl p-6 border border-slate-200/80 dark:border-gray-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Aktivitas Inspeksi</h3>
              <p className="text-[11px] text-slate-400 dark:text-gray-400 mt-0.5">Tren submit form 7 hari terakhir</p>
            </div>
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-gray-800 text-slate-500">
              Mingguan
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.trend_7_days || []} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#162F5C',
                    borderRadius: '16px',
                    color: '#fff',
                    fontSize: '11px',
                    border: 'none',
                    padding: '8px 12px'
                  }}
                  labelStyle={{ color: '#F0E5CF', fontWeight: 'bold' }}
                />
                <Bar
                  dataKey="total"
                  fill="#1E4B8E"
                  radius={[16, 16, 16, 16]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Col 2: Reminders Card - 4 Cols */}
        <div className="lg:col-span-4 bg-white dark:bg-gray-900 rounded-3xl p-6 border border-slate-200/80 dark:border-gray-800 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Agenda &amp; Shift</h3>
            <p className="text-[11px] text-slate-400 dark:text-gray-400 mt-0.5">Jadwal operasional lapangan</p>

            <div className="mt-5 space-y-3">
              <div className="p-4 rounded-2xl bg-[#F4F5F7] dark:bg-gray-800/60 border border-slate-200/60 dark:border-gray-700/60">
                <div className="flex items-center space-x-2 text-[#162F5C] dark:text-blue-400 font-bold text-xs">
                  <span className="w-2 h-2 rounded-full bg-[#1E4B8E]" />
                  <span>Handover &amp; Audit HSE</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-gray-400 mt-1 font-medium">
                  {activeShiftHours}
                </p>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                    {activeShiftName}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Link
            to="/admin/reports"
            className="mt-5 w-full py-2.5 bg-[#162F5C] hover:bg-[#1E4B8E] text-white rounded-full text-xs font-bold transition-all shadow-xs flex items-center justify-center space-x-2"
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Rekap Inspeksi Hari Ini</span>
          </Link>
        </div>
      </div>

      {/* Row 3: Lower 3-Column Grid (Team Collaboration, Project Progress, Time Tracker) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Col 1: Team Collaboration (Operator Lapangan Aktif) - 4 Cols */}
        <div className="lg:col-span-4 bg-white dark:bg-gray-900 rounded-3xl p-6 border border-slate-200/80 dark:border-gray-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Operator Lapangan</h3>
              <p className="text-[11px] text-slate-400 dark:text-gray-400 mt-0.5">Personel inspeksi bertugas</p>
            </div>
            <Link
              to="/admin/users"
              className="px-3 py-1 rounded-full border border-slate-200 dark:border-gray-700 text-xs font-bold text-slate-600 dark:text-gray-300 hover:border-[#1E4B8E] transition-all"
            >
              + Tim
            </Link>
          </div>

          <div className="space-y-3">
            {teamMembers.map((member, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-gray-800/60 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#162F5C] to-[#1E4B8E] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 dark:text-white leading-snug">{member.name}</h5>
                    <p className="text-[10px] text-slate-400 font-medium">{member.unit}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${member.statusColor}`}>
                  {member.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Col 2: Project Progress (Semi-Donut Gauge Chart) - 4 Cols */}
        <div className="lg:col-span-4 bg-white dark:bg-gray-900 rounded-3xl p-6 border border-slate-200/80 dark:border-gray-800 shadow-xs flex flex-col items-center justify-between">
          <div className="w-full flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Kondisi Kelaikan Armada</h3>
              <p className="text-[11px] text-slate-400 dark:text-gray-400 mt-0.5">Rasio hasil pemeriksaan checklist</p>
            </div>
          </div>

          {/* Semi-Circle Arch Gauge */}
          <div className="relative w-full flex items-center justify-center my-2">
            <div className="h-44 w-full max-w-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={conditionStats}
                    startAngle={180}
                    endAngle={0}
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {conditionStats.map((entry, index) => (
                      <Cell key={`gauge-${index}`} fill={entry.color || conditionColors[entry.name]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="absolute top-24 text-center">
              <span className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
                {goodRate}%
              </span>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wide uppercase mt-0.5">
                Laik Jalan
              </p>
            </div>
          </div>

          {/* Legend Pills */}
          <div className="flex items-center justify-center gap-4 text-xs font-semibold pt-1">
            <span className="flex items-center space-x-1.5 text-slate-600 dark:text-gray-300">
              <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]" />
              <span>Bagus</span>
            </span>
            <span className="flex items-center space-x-1.5 text-slate-600 dark:text-gray-300">
              <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]" />
              <span>Rusak</span>
            </span>
            <span className="flex items-center space-x-1.5 text-slate-600 dark:text-gray-300">
              <span className="w-2.5 h-2.5 rounded-full bg-[#94A3B8]" />
              <span>N/A</span>
            </span>
          </div>
        </div>

        {/* Col 3: Time Tracker (Live Digital Shift Clock Card) - 4 Cols */}
        <div className="lg:col-span-4 bg-gradient-to-br from-[#162F5C] via-[#1A3668] to-[#122244] rounded-3xl p-6 text-white shadow-lg shadow-blue-950/20 flex flex-col justify-between relative overflow-hidden">
          {/* Abstract wavy lines background */}
          <div className="absolute -right-12 -top-12 w-36 h-36 rounded-full bg-white/5 blur-2xl pointer-events-none" />
          <div className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full bg-white/5 blur-xl pointer-events-none" />

          <div>
            <span className="text-xs font-semibold text-slate-300">Waktu Operasional Shift</span>
            <div className="mt-1 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] text-[#F0E5CF] font-medium">{activeShiftName}</span>
            </div>
          </div>

          {/* Big Live Digital Clock Display */}
          <div className="my-6 text-center">
            <div className="text-4xl font-extrabold font-mono tracking-wider text-white">
              {currentTime.toLocaleTimeString('id-ID', { hour12: false })}
            </div>
            <p className="text-[11px] text-slate-300 mt-1 font-mono">
              WIB • {currentTime.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
            </p>
          </div>

          {/* Quick Shift Handover Control */}
          <div className="flex items-center justify-center space-x-3 pt-2">
            <Link
              to="/admin/inspections"
              className="px-4 py-2 bg-white/15 hover:bg-white/25 rounded-full text-xs font-bold text-white transition-all backdrop-blur-xs flex items-center space-x-1.5"
            >
              <InspectionIcon className="w-3.5 h-3.5" />
              <span>Input Checklist</span>
            </Link>
            <button
              onClick={() => loadDashboard()}
              className="w-9 h-9 rounded-full bg-white text-[#162F5C] hover:bg-[#F0E5CF] flex items-center justify-center transition-all shadow-xs cursor-pointer"
              title="Refresh Data"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Row 4: Peringatan Unit Rusak (Alert Panel if any) */}
      {stats?.broken_items_alert && stats.broken_items_alert.length > 0 && (
        <div className="bg-red-50/70 dark:bg-red-950/20 border border-red-200/80 dark:border-red-900/50 rounded-3xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div className="flex items-center space-x-2 text-red-800 dark:text-red-300 font-bold text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
              <WarningIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span>
                Peringatan Unit Rusak ({stats.broken_items_alert.length} Unit Kendaraan • {stats.total_broken_items_count || stats.broken_items_today || stats.broken_items_alert.length} Item)
              </span>
            </div>
            <Link
              to="/admin/inspections?has_broken=true"
              className="text-xs text-red-700 dark:text-red-400 hover:underline font-bold"
            >
              Lihat Semua Temuan Rusak →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.broken_items_alert.map((alert, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-red-200/90 dark:border-red-900/40 shadow-xs text-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between font-semibold mb-2 pb-2 border-b border-red-100 dark:border-gray-800">
                    <div>
                      <span className="text-sm font-bold text-slate-900 dark:text-white block">
                        {alert.vehicle_number}
                      </span>
                      {alert.vehicle_type && (
                        <span className="text-[10px] text-slate-400 font-normal">
                          {alert.vehicle_type}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1.5 flex-shrink-0">
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 font-bold">
                        {alert.items?.length || 1} Rusak
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono ${
                        alert.shift === '1st' ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {alert.shift === '1st' ? 'Pagi' : 'Malam'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 mt-2.5">
                    {alert.items && alert.items.length > 0 ? (
                      alert.items.map((item, itemIdx) => (
                        <div
                          key={itemIdx}
                          className="bg-red-50/50 dark:bg-gray-800/50 p-2.5 rounded-xl border border-red-100 dark:border-gray-700"
                        >
                          <div className="font-semibold text-slate-800 dark:text-white text-xs flex items-center space-x-1.5">
                            <span className="text-red-500 font-bold">•</span>
                            <span>{item.item_description}</span>
                          </div>
                          {item.notes && (
                            <p className="text-slate-500 dark:text-gray-400 italic text-[11px] mt-1 pl-2.5 border-l-2 border-red-300">
                              "{item.notes}"
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="bg-red-50/50 dark:bg-gray-800/50 p-2.5 rounded-xl">
                        <div className="font-semibold text-slate-800 dark:text-white text-xs">{alert.item_description}</div>
                        {alert.notes && <p className="text-slate-500 text-[11px] mt-1">"{alert.notes}"</p>}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-gray-800 text-[10px] text-slate-400 flex justify-between items-center">
                  <span>Operator: <strong className="text-slate-700 dark:text-gray-300">{alert.operator_name}</strong></span>
                  <Link
                    to={`/admin/inspections/${alert.inspection_id}`}
                    className="inline-flex items-center px-3 py-1 rounded-full bg-[#162F5C] hover:bg-[#1E4B8E] text-white font-bold text-[11px] transition-all"
                  >
                    Periksa →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Row 5: Monitoring Ketersediaan Master Kendaraan Hari Ini (Dribbble styled table container) */}
      <div id="vehicle-table-section" className="bg-white dark:bg-gray-900 rounded-3xl border border-slate-200/80 dark:border-gray-800 shadow-xs overflow-hidden">
        {/* Header with Search & Filter Pills */}
        <div className="p-6 border-b border-slate-100 dark:border-gray-800 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              Ketersediaan Master Kendaraan Hari Ini
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-gray-400 mt-0.5">
              Monitoring unit yang belum diinspeksi shift pagi, shift malam, atau belum ada laporan
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
            {/* Search Input Pill */}
            <div className="relative">
              <input
                type="text"
                placeholder="Cari No. Polisi / Tipe..."
                value={searchVehicle}
                onChange={(e) => setSearchVehicle(e.target.value)}
                className="w-full sm:w-56 text-xs pl-8 pr-7 py-2 bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-full focus:outline-none focus:border-[#1E4B8E] placeholder-slate-400 dark:text-white"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              {searchVehicle && (
                <button
                  onClick={() => setSearchVehicle('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <button
                onClick={() => setShiftFilter('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  shiftFilter === 'all'
                    ? 'bg-[#162F5C] text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-300 hover:bg-slate-200'
                }`}
              >
                Semua ({stats?.shift_tracking_stats?.total_vehicles || stats?.vehicle_shift_status?.length || 0})
              </button>
              <button
                onClick={() => setShiftFilter('completely_uninspected')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  shiftFilter === 'completely_uninspected'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-300 hover:bg-slate-200'
                }`}
              >
                Belum Cek ({stats?.shift_tracking_stats?.completely_uninspected || 0})
              </button>
              <button
                onClick={() => setShiftFilter('missing_morning')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  shiftFilter === 'missing_morning'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-300 hover:bg-slate-200'
                }`}
              >
                Belum Pagi ({stats?.shift_tracking_stats?.missing_morning || 0})
              </button>
              <button
                onClick={() => setShiftFilter('missing_evening')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  shiftFilter === 'missing_evening'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-300 hover:bg-slate-200'
                }`}
              >
                Belum Malam ({stats?.shift_tracking_stats?.missing_evening || 0})
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-gray-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-6">No. Unit / Polisi</th>
                <th className="py-3.5 px-4">Tipe Kendaraan</th>
                <th className="py-3.5 px-4">Departemen</th>
                <th className="py-3.5 px-4 text-center">Shift Pagi (1st)</th>
                <th className="py-3.5 px-4 text-center">Shift Malam (2nd)</th>
                <th className="py-3.5 px-4">Status Ketersediaan</th>
                <th className="py-3.5 px-6 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
              {filteredVehicles.length > 0 ? (
                filteredVehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/80 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="py-3.5 px-6 font-bold text-slate-800 dark:text-white">
                      {v.vehicle_number}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-gray-300">
                      {v.vehicle_type}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {v.department}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {v.has_morning ? (
                        <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold text-[11px]">
                          Sudah ({v.morning_inspection?.time || '07:30'})
                        </span>
                      ) : (
                        <span className="inline-block px-3 py-1 rounded-full bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 font-medium text-[11px]">
                          Belum Diisi
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {v.has_evening ? (
                        <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold text-[11px]">
                          Sudah ({v.evening_inspection?.time || '19:30'})
                        </span>
                      ) : (
                        <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-500 dark:bg-gray-800 dark:text-gray-400 font-medium text-[11px]">
                          Belum Diisi
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {v.is_completely_uninspected ? (
                        <span className="inline-block px-3 py-1 rounded-full bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 font-bold text-[11px] border border-amber-200/80">
                          Tersedia Penuh (Belum Ada Form)
                        </span>
                      ) : v.has_morning && !v.has_evening ? (
                        <span className="inline-block px-3 py-1 rounded-full bg-yellow-50 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300 font-semibold text-[11px]">
                          Tersedia Shift Malam
                        </span>
                      ) : !v.has_morning && v.has_evening ? (
                        <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 font-semibold text-[11px]">
                          Tersedia Shift Pagi
                        </span>
                      ) : (
                        <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-gray-800 dark:text-gray-300 font-semibold text-[11px]">
                          Sudah Lengkap (Pagi &amp; Malam)
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      {v.morning_inspection || v.evening_inspection ? (
                        <Link
                          to={`/admin/inspections/${v.morning_inspection?.id || v.evening_inspection?.id}`}
                          className="text-[#1E4B8E] hover:underline font-bold text-[11px]"
                        >
                          Lihat Form
                        </Link>
                      ) : (
                        <span className="text-slate-300 text-[11px]">-</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    Tidak ada kendaraan pada filter ini
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row 6: 5 Pengisian Form Terbaru Hari Ini */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-slate-200/80 dark:border-gray-800 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">5 Pengisian Form Terbaru Hari Ini</h3>
            <p className="text-[11px] text-slate-400 dark:text-gray-400 mt-0.5">Status kiriman formulir inspeksi real-time</p>
          </div>
          <Link
            to="/admin/inspections"
            className="text-xs font-bold text-[#1E4B8E] hover:underline flex items-center"
          >
            <span>Lihat Semua Riwayat</span>
            <ChevronRightIcon className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-gray-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-6">Tanggal &amp; Jam</th>
                <th className="py-3.5 px-4">Unit / No. Polisi</th>
                <th className="py-3.5 px-4">Operator</th>
                <th className="py-3.5 px-4">Shift</th>
                <th className="py-3.5 px-4">Kondisi Item</th>
                <th className="py-3.5 px-6 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
              {stats?.recent_inspections && stats.recent_inspections.length > 0 ? (
                stats.recent_inspections.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="py-3.5 px-6 font-mono text-slate-600 dark:text-gray-300">
                      {item.inspection_date} {item.inspection_time ? `• ${item.inspection_time}` : ''}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800 dark:text-white">{item.vehicle_number}</div>
                      <div className="text-[10px] text-slate-400">{item.form_name}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-gray-300">
                      {item.operator_name}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                        item.shift === '1st' ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {item.shift === '1st' ? 'PAGI (1st)' : 'MALAM (2nd)'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {item.broken_count > 0 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
                          <WarningIcon className="w-3 h-3 mr-1" />
                          {item.broken_count} Rusak
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                          <CheckCircleIcon className="w-3 h-3 mr-1" />
                          Semua Bagus
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <Link
                        to={`/admin/inspections/${item.id}`}
                        className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 hover:bg-[#162F5C] hover:text-white text-slate-700 font-bold text-[11px] transition-all"
                      >
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
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
