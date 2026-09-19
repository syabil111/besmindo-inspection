import { useState, useEffect, useRef } from 'react';
import { adminAPI } from '../../services/api';
import { Link, useNavigate } from 'react-router-dom';
import {
  SearchIcon,
  FilterIcon,
  PrintIcon,
  EyeIcon,
  CheckCircleIcon,
  WarningIcon,
  CheckIcon
} from '../../components/Icons';
import PrintableInspectionForm from '../../components/PrintableInspectionForm';

const InspectionList = () => {
  const navigate = useNavigate();
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [printData, setPrintData] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const [filters, setFilters] = useState({
    date_from: '',
    date_to: '',
    form_type: '',
    shift: '',
    has_broken: '',
    status: '',
    search: '',
  });

  const printComponentRef = useRef();

  useEffect(() => {
    loadInspections();
  }, [filters]);

  const loadInspections = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.date_from) params.date_from = filters.date_from;
      if (filters.date_to) params.date_to = filters.date_to;
      if (filters.form_type) params.form_type = filters.form_type;
      if (filters.shift) params.shift = filters.shift;
      if (filters.has_broken) params.has_broken = filters.has_broken;
      if (filters.status) params.status = filters.status;
      if (filters.search) params.search = filters.search;

      const response = await adminAPI.getInspections(params);
      setInspections(response.data.data || []);
    } catch (error) {
      console.error('Failed to load inspections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Setujui dan acknowledge formulir inspeksi ini?')) return;
    try {
      await adminAPI.acknowledgeInspection(id);
      alert('Formulir berhasil di-acknowledge!');
      loadInspections();
    } catch (err) {
      alert('Gagal acknowledge: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleQuickPrint = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await adminAPI.getPrintData(id);
      setPrintData(res.data.data);
      setShowPrintModal(true);
    } catch (err) {
      alert('Gagal memuat data cetak.');
    }
  };

  const triggerBrowserPrint = () => {
    window.print();
  };

  const resetFilters = () => {
    setFilters({
      date_from: '',
      date_to: '',
      form_type: '',
      shift: '',
      has_broken: '',
      status: '',
      search: '',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#162F5C] dark:text-white tracking-tight">Data Inspeksi Kendaraan</h1>
          <p className="text-xs text-[#6B7280] dark:text-gray-400 mt-0.5">
            Daftar seluruh formulir inspeksi harian yang telah disubmit operator lapangan
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={resetFilters}
            className="text-xs text-slate-600 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-slate-50 dark:hover:bg-gray-800 border border-slate-200/80 dark:border-gray-700 px-4 py-2 rounded-full font-bold transition-all"
          >
            Reset Filter
          </button>
          <button
            onClick={loadInspections}
            className="text-xs bg-[#162F5C] hover:bg-[#1E4B8E] text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-sm transition-all"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-slate-200/80 dark:border-gray-800 shadow-xs">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 dark:text-white mb-4 uppercase tracking-widest">
          <FilterIcon className="w-4 h-4 text-[#1E4B8E]" />
          <span>Filter & Pencarian Lanjutan</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1 block">Cari No. Kendaraan / Operator</label>
            <div className="relative">
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Contoh: BK 1234, Dozer, Budi..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-slate-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#1E4B8E]/20 focus:border-[#1E4B8E] transition-all focus:outline-none"
              />
              <SearchIcon className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Date From */}
          <div>
            <label className="text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1 block">Tanggal Dari</label>
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-slate-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#1E4B8E]/20 focus:border-[#1E4B8E] transition-all focus:outline-none"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1 block">Tanggal Sampai</label>
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-slate-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#1E4B8E]/20 focus:border-[#1E4B8E] transition-all focus:outline-none"
            />
          </div>

          {/* Form Type */}
          <div>
            <label className="text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1 block">Jenis Formulir</label>
            <select
              value={filters.form_type}
              onChange={(e) => setFilters({ ...filters, form_type: e.target.value })}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-slate-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#1E4B8E]/20 focus:border-[#1E4B8E] transition-all focus:outline-none"
            >
              <option value="">Semua Formulir</option>
              <option value="dozer">Unit Dozer</option>
              <option value="lv_bus">LV & Bus</option>
              <option value="vacum">Vacum Truck</option>
              <option value="tandem">Tandem & Lowbad</option>
            </select>
          </div>

          {/* Shift */}
          <div>
            <label className="text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1 block">Shift Kerja</label>
            <select
              value={filters.shift}
              onChange={(e) => setFilters({ ...filters, shift: e.target.value })}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-slate-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#1E4B8E]/20 focus:border-[#1E4B8E] transition-all focus:outline-none"
            >
              <option value="">Semua Shift</option>
              <option value="1st">Pagi (1st)</option>
              <option value="2nd">Malam (2nd)</option>
            </select>
          </div>

          {/* Item Rusak */}
          <div>
            <label className="text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1 block">Kondisi Rusak</label>
            <select
              value={filters.has_broken}
              onChange={(e) => setFilters({ ...filters, has_broken: e.target.value })}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-slate-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#1E4B8E]/20 focus:border-[#1E4B8E] transition-all focus:outline-none"
            >
              <option value="">Semua Kondisi</option>
              <option value="true">Ada Item Rusak</option>
              <option value="false">Semua Bagus</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Data Inspeksi */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-slate-200/80 dark:border-gray-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-gray-800 text-slate-400 dark:text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-5">Tanggal & Jam</th>
                <th className="py-3.5 px-5">Jenis Formulir</th>
                <th className="py-3.5 px-5">No. Kendaraan / SN</th>
                <th className="py-3.5 px-5">Nama Operator</th>
                <th className="py-3.5 px-5">Shift</th>
                <th className="py-3.5 px-5">Item Rusak</th>
                <th className="py-3.5 px-5">Status Approval</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-gray-500 dark:text-gray-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E4B8E] mx-auto"></div>
                    <p className="mt-2 text-xs">Memuat data inspeksi...</p>
                  </td>
                </tr>
              ) : inspections.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-gray-500 dark:text-gray-400">
                    Tidak ditemukan data inspeksi yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                inspections.map((item) => {
                  const isAcknowledged = !!item.acknowledged_by || !!item.acknowledged_at;
                  return (
                    <tr
                      key={item.id}
                      onClick={() => navigate(`/admin/inspections/${item.id}`)}
                      className="hover:bg-slate-50/80 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-5 font-mono text-slate-600 dark:text-gray-300">
                        <div>{item.inspection_date}</div>
                        <div className="text-[10px] text-gray-400">{item.inspection_time || '-'}</div>
                      </td>
                      <td className="py-3.5 px-5 font-medium text-slate-800 dark:text-white">
                        {item.form_name}
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="font-bold text-[#1E4B8E]">{item.vehicle_number}</div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-400">{item.vehicle_type || item.model || '-'}</div>
                      </td>
                      <td className="py-3.5 px-5 font-medium text-slate-800 dark:text-white">
                        {item.operator_name}
                      </td>
                      <td className="py-3.5 px-5">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          item.shift === '1st' ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          {item.shift === '1st' ? 'Pagi (1st)' : 'Malam (2nd)'}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        {item.broken_count > 0 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                            <WarningIcon className="w-3 h-3 mr-1" />
                            {item.broken_count} Rusak
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                            <CheckCircleIcon className="w-3 h-3 mr-1" />
                            Bagus
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5">
                        {isAcknowledged ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-[#1E4B8E]">
                            <CheckIcon className="w-3 h-3 mr-1" /> Disetujui
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-800">
                            Menunggu Review
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <div className="flex items-center justify-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
                          <Link
                            to={`/admin/inspections/${item.id}`}
                            className="p-1.5 text-[#1E4B8E] hover:bg-blue-50 rounded"
                            title="Lihat Detail Form"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </Link>

                          {!isAcknowledged && (
                            <button
                              onClick={(e) => handleAcknowledge(item.id, e)}
                              className="px-2 py-1 text-[10px] bg-green-600 hover:bg-green-700 text-white rounded font-medium transition-colors"
                              title="Setujui/Acknowledge"
                            >
                              Setujui
                            </button>
                          )}

                          <button
                            onClick={(e) => handleQuickPrint(item.id, e)}
                            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                            title="Cetak Formulir Mirip Kertas Asli"
                          >
                            <PrintIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Quick Print Preview */}
      {showPrintModal && printData && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-200 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="font-bold text-sm text-[#1A1A2E] dark:text-white">
                Preview Cetak Formulir Fisik (Standar Dokumen PT. BESMINDO)
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={triggerBrowserPrint}
                  className="bg-[#1E4B8E] hover:bg-[#2E6BC4] text-white px-3 py-1.5 rounded text-xs font-semibold flex items-center space-x-1"
                >
                  <PrintIcon className="w-3.5 h-3.5" />
                  <span>Cetak Dokumen</span>
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
                inspection={printData.inspection}
                results={printData.results}
                documents={printData.documents}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InspectionList;
