import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { SearchIcon, FilterIcon, CheckIcon, WarningIcon, ClockIcon } from '../../components/Icons';

const RepairTracking = () => {
  const [brokenItems, setBrokenItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    repair_status: '',
    date_from: '',
    date_to: '',
  });

  useEffect(() => {
    loadBrokenItems();
  }, [filters]);

  const loadBrokenItems = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getBrokenItems(filters);
      setBrokenItems(response.data.data || []);
    } catch (error) {
      console.error('Failed to load broken items:', error);
      alert('Gagal memuat data item rusak.');
    } finally {
      setLoading(false);
    }
  };

  const getRepairStatusBadge = (status) => {
    const configs = {
      pending: {
        label: 'Belum Diperbaiki',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        textColor: 'text-red-700 dark:text-red-300',
        icon: '🔴'
      },
      in_progress: {
        label: 'Sedang Diperbaiki',
        bgColor: 'bg-amber-100 dark:bg-amber-900/30',
        textColor: 'text-amber-800 dark:text-amber-300',
        icon: '🟡'
      },
      repaired: {
        label: 'Sudah Diperbaiki',
        bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
        textColor: 'text-emerald-700 dark:text-emerald-300',
        icon: '🟢'
      }
    };
    return configs[status] || configs.pending;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const countByStatus = (status) => {
    return brokenItems.filter(item => item.repair_status === status).length;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#162F5C] dark:text-white tracking-tight">
            Tracking Perbaikan Item Rusak
          </h1>
          <p className="text-xs text-[#6B7280] dark:text-gray-400 mt-0.5">
            Monitor status perbaikan komponen rusak dari inspeksi kendaraan PT. BESMINDO
          </p>
        </div>
        <button
          onClick={loadBrokenItems}
          className="text-xs bg-[#162F5C] hover:bg-[#1E4B8E] text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-sm transition-all"
        >
          Refresh Data
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-slate-200/80 dark:border-gray-800 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-gray-400">Belum Diperbaiki</p>
              <h2 className="text-3xl font-bold text-red-600 dark:text-red-400 mt-1">
                {countByStatus('pending')}
              </h2>
            </div>
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <span className="text-xl">🔴</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-slate-200/80 dark:border-gray-800 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-gray-400">Sedang Diperbaiki</p>
              <h2 className="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                {countByStatus('in_progress')}
              </h2>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <span className="text-xl">🟡</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-slate-200/80 dark:border-gray-800 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-gray-400">Sudah Diperbaiki</p>
              <h2 className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {countByStatus('repaired')}
              </h2>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <span className="text-xl">🟢</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-slate-200/80 dark:border-gray-800 shadow-xs">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 dark:text-white mb-4 uppercase tracking-widest">
          <FilterIcon className="w-4 h-4 text-[#1E4B8E]" />
          <span>Filter Tracking Perbaikan</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1 block">
              Status Perbaikan
            </label>
            <select
              value={filters.repair_status}
              onChange={(e) => setFilters({ ...filters, repair_status: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-[#1E4B8E]/20 focus:border-[#1E4B8E] transition-all focus:outline-none"
            >
              <option value="">Semua Status</option>
              <option value="pending">Belum Diperbaiki</option>
              <option value="in_progress">Sedang Diperbaiki</option>
              <option value="repaired">Sudah Diperbaiki</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1 block">
              Tanggal Dari
            </label>
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-[#1E4B8E]/20 focus:border-[#1E4B8E] transition-all focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1 block">
              Tanggal Sampai
            </label>
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-[#1E4B8E]/20 focus:border-[#1E4B8E] transition-all focus:outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setFilters({ repair_status: '', date_from: '', date_to: '' })}
              className="w-full px-4 py-2 text-xs text-slate-600 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-slate-50 dark:hover:bg-gray-800 border border-slate-200/80 dark:border-gray-700 rounded-full font-bold transition-all"
            >
              Reset Filter
            </button>
          </div>
        </div>
      </div>

      {/* Broken Items Table */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-slate-200/80 dark:border-gray-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-gray-800 text-slate-400 dark:text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-5">Item / Komponen</th>
                <th className="py-3.5 px-5">Kendaraan</th>
                <th className="py-3.5 px-5">Tanggal Inspeksi</th>
                <th className="py-3.5 px-5">Operator</th>
                <th className="py-3.5 px-5">Catatan Rusak</th>
                <th className="py-3.5 px-5">Status Perbaikan</th>
                <th className="py-3.5 px-5">Catatan Perbaikan</th>
                <th className="py-3.5 px-5">Tanggal Perbaikan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-gray-500 dark:text-gray-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E4B8E] mx-auto"></div>
                    <p className="mt-2 text-xs">Memuat data item rusak...</p>
                  </td>
                </tr>
              ) : brokenItems.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-gray-500 dark:text-gray-400">
                    Tidak ditemukan data item rusak.
                  </td>
                </tr>
              ) : (
                brokenItems.map((item) => {
                  const statusConfig = getRepairStatusBadge(item.repair_status);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-3.5 px-5 font-medium text-slate-800 dark:text-white">
                        {item.item_description || '-'}
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="font-bold text-[#162F5C] dark:text-blue-300">
                          {item.vehicle_number}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-gray-400">
                          {item.vehicle_type || '-'}
                        </div>
                      </td>
                      <td className="py-3.5 px-5 font-mono text-[11px] text-slate-600 dark:text-gray-300">
                        {formatDate(item.inspection_date)}
                      </td>
                      <td className="py-3.5 px-5 font-medium text-slate-700 dark:text-gray-300">
                        {item.operator_name || '-'}
                      </td>
                      <td className="py-3.5 px-5 text-[11px] text-red-700 dark:text-red-300 max-w-xs">
                        {item.notes || '-'}
                      </td>
                      <td className="py-3.5 px-5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${statusConfig.bgColor} ${statusConfig.textColor}`}>
                          <span className="mr-1.5">{statusConfig.icon}</span>
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-[11px] text-slate-600 dark:text-gray-400 max-w-xs">
                        {item.repair_notes || '-'}
                      </td>
                      <td className="py-3.5 px-5 font-mono text-[11px] text-slate-500 dark:text-gray-400">
                        {item.repaired_at ? formatDate(item.repaired_at) : '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RepairTracking;
