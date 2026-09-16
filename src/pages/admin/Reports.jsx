import { useState, useEffect, useRef } from 'react';
import { adminAPI } from '../../services/api';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import {
  ReportIcon,
  ExcelIcon,
  PdfIcon,
  PrintIcon,
  FilterIcon,
  WarningIcon,
  CheckCircleIcon,
  EyeIcon,
  SearchIcon
} from '../../components/Icons';
import PrintableInspectionForm from '../../components/PrintableInspectionForm';

const Reports = () => {
  const [reportsData, setReportsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState([]);
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const [filters, setFilters] = useState({
    date_from: '',
    date_to: '',
    form_type: '',
    vehicle_id: '',
  });

  const printRef = useRef();

  useEffect(() => {
    loadVehicles();
  }, []);

  useEffect(() => {
    loadReports();
  }, [filters]);

  const loadVehicles = async () => {
    try {
      const res = await adminAPI.getVehicles();
      setVehicles(res.data.data || []);
    } catch (err) {
      console.error('Failed to load vehicles for reports:', err);
    }
  };

  const loadReports = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.date_from) params.date_from = filters.date_from;
      if (filters.date_to) params.date_to = filters.date_to;
      if (filters.form_type) params.form_type = filters.form_type;
      if (filters.vehicle_id) params.vehicle_id = filters.vehicle_id;

      const res = await adminAPI.getReports(params);
      setReportsData(res.data.data);
    } catch (err) {
      console.error('Failed to load reports data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Export to Excel using SheetJS
  const handleExportExcel = () => {
    if (!reportsData?.inspections || reportsData.inspections.length === 0) {
      alert('Tidak ada data inspeksi untuk diexport.');
      return;
    }

    const excelRows = reportsData.inspections.map((i, idx) => ({
      No: idx + 1,
      Tanggal: i.inspection_date,
      Jam: i.inspection_time || '-',
      Jenis_Formulir: i.form_name,
      No_Kendaraan: i.vehicle_number,
      Tipe_Kendaraan: i.vehicle_type || i.model || '-',
      Operator: i.operator_name,
      Shift: i.shift === '1st' ? 'Pagi (1st)' : 'Malam (2nd)',
      Status_Persetujuan: i.acknowledged_by ? 'Disetujui' : 'Menunggu',
      Item_Rusak: i.broken_count || 0,
      KM_Atau_Jam: i.km_reading_value || i.running_hours || '-'
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Inspeksi');
    XLSX.writeFile(workbook, `Laporan_Inspeksi_BESMINDO_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Export to PDF using jsPDF
  const handleExportPDF = () => {
    if (!reportsData?.inspections || reportsData.inspections.length === 0) {
      alert('Tidak ada data inspeksi untuk diexport.');
      return;
    }

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('PT. BESMINDO — DRILLING & WORK OVER RIG SERVICES', 14, 15);
    doc.setFontSize(11);
    doc.text('REKAPITULASI LAPORAN INSPEKSI HARIAN KENDARAAN & ALAT BERAT', 14, 22);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Periode: ${filters.date_from || 'Awal'} s/d ${filters.date_to || 'Hari ini'} | Dicetak: ${new Date().toLocaleString('id-ID')}`, 14, 28);

    // Summary text
    doc.text(`Total Inspeksi: ${reportsData.total_inspections} | Total Item Rusak: ${reportsData.total_broken}`, 14, 34);

    // Simple Table
    let y = 42;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setFillColor(240, 240, 240);
    doc.rect(14, y - 4, 268, 6, 'F');
    doc.text('No', 16, y);
    doc.text('Tanggal', 25, y);
    doc.text('No. Kendaraan', 50, y);
    doc.text('Jenis Formulir', 85, y);
    doc.text('Operator', 145, y);
    doc.text('Shift', 185, y);
    doc.text('Rusak', 205, y);
    doc.text('Status Approval', 225, y);

    y += 6;
    doc.setFont('helvetica', 'normal');
    reportsData.inspections.slice(0, 35).forEach((item, index) => {
      if (y > 190) {
        doc.addPage();
        y = 20;
      }
      doc.text(String(index + 1), 16, y);
      doc.text(String(item.inspection_date), 25, y);
      doc.text(String(item.vehicle_number || '-'), 50, y);
      doc.text(String(item.form_name?.substring(0, 28) || '-'), 85, y);
      doc.text(String(item.operator_name || '-'), 145, y);
      doc.text(item.shift === '1st' ? 'Pagi' : 'Malam', 185, y);
      doc.text(String(item.broken_count || 0), 205, y);
      doc.text(item.acknowledged_by ? 'Disetujui' : 'Menunggu', 225, y);
      y += 5;
    });

    doc.save(`Rekap_Inspeksi_BESMINDO_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleOpenPrintPreview = async (inspection) => {
    try {
      const res = await adminAPI.getPrintData(inspection.id);
      setSelectedInspection(res.data.data);
      setShowPrintModal(true);
    } catch (err) {
      alert('Gagal mengambil data cetak.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E] tracking-tight">Laporan & Cetak Hardfile</h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Rekap statistik inspeksi, export format Excel/PDF, dan cetak fisik formulir asli PT. BESMINDO
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center space-x-1.5 bg-[#16A34A] hover:bg-green-700 text-white px-3.5 py-2 rounded-md text-xs font-semibold shadow-sm transition-colors"
          >
            <ExcelIcon className="w-4 h-4" />
            <span>Export Excel (.xlsx)</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="inline-flex items-center space-x-1.5 bg-[#DC2626] hover:bg-red-700 text-white px-3.5 py-2 rounded-md text-xs font-semibold shadow-sm transition-colors"
          >
            <PdfIcon className="w-4 h-4" />
            <span>Export Ringkasan PDF</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl p-4 border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        <div className="flex items-center space-x-2 text-xs font-bold text-[#1A1A2E] mb-3 uppercase tracking-wider">
          <FilterIcon className="w-3.5 h-3.5 text-[#1E4B8E]" />
          <span>Kriteria Filter Laporan</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="text-[11px] font-medium text-gray-600 block mb-1">Tanggal Mulai</label>
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E4B8E]/20 focus:border-[#1E4B8E] transition-all focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium text-gray-600 block mb-1">Tanggal Sampai</label>
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E4B8E]/20 focus:border-[#1E4B8E] transition-all focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium text-gray-600 block mb-1">Jenis Formulir</label>
            <select
              value={filters.form_type}
              onChange={(e) => setFilters({ ...filters, form_type: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E4B8E]/20 focus:border-[#1E4B8E] transition-all focus:outline-none"
            >
              <option value="">Semua Formulir</option>
              <option value="dozer">Unit Dozer</option>
              <option value="lv_bus">LV & Bus</option>
              <option value="vacum">Vacum Truck</option>
              <option value="tandem">Tandem & Lowbad</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] font-medium text-gray-600 block mb-1">Pilih Unit Kendaraan</label>
            <select
              value={filters.vehicle_id}
              onChange={(e) => setFilters({ ...filters, vehicle_id: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E4B8E]/20 focus:border-[#1E4B8E] transition-all focus:outline-none"
            >
              <option value="">Semua Kendaraan</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.vehicle_number} ({v.vehicle_type})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Rekap Statistik KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300">
          <span className="text-[11px] font-medium text-gray-500 uppercase">Total Inspeksi Terlaksana</span>
          <p className="text-2xl font-bold text-[#1E4B8E] mt-1 font-mono">{reportsData?.total_inspections || 0}</p>
          <span className="text-[10px] text-gray-400">Sesuai filter terpilih</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300">
          <span className="text-[11px] font-medium text-gray-500 uppercase">Kondisi Bagus</span>
          <p className="text-2xl font-bold text-[#16A34A] mt-1 font-mono">{reportsData?.total_good || 0}</p>
          <span className="text-[10px] text-gray-400">Item checklist laik pakai</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300">
          <span className="text-[11px] font-medium text-gray-500 uppercase">Kondisi Rusak</span>
          <p className="text-2xl font-bold text-[#DC2626] mt-1 font-mono">{reportsData?.total_broken || 0}</p>
          <span className="text-[10px] text-gray-400">Memerlukan service / ganti</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300">
          <span className="text-[11px] font-medium text-gray-500 uppercase">Item Tidak Tersedia (N/A)</span>
          <p className="text-2xl font-bold text-gray-600 mt-1 font-mono">{reportsData?.total_na || 0}</p>
          <span className="text-[10px] text-gray-400">Bukan fitur unit terkait</span>
        </div>
      </div>

      {/* Top 5 Item Paling Sering Rusak */}
      {reportsData?.top_broken_items && reportsData.top_broken_items.length > 0 && (
        <div className="bg-white rounded-xl p-5 border border-[#E5E7EB] shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-red-800 mb-3 flex items-center space-x-1.5">
            <WarningIcon className="w-4 h-4 text-red-600" />
            <span>5 Item Checklist Paling Sering Dilaporkan Rusak</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {reportsData.top_broken_items.map((item, idx) => (
              <div key={idx} className="p-3 bg-red-50/70 rounded-lg border border-red-100 text-xs">
                <span className="text-[10px] font-mono text-red-600 font-bold block">Peringkat #{idx + 1}</span>
                <span className="font-semibold text-[#1A1A2E] mt-0.5 block">{item.name}</span>
                <span className="text-xs font-bold text-red-700 mt-1 block font-mono">{item.count} Kali Dilaporkan</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabel Data Rekap & Cetak Hardfile */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#1A1A2E]">
            Daftar Formulir Siap Cetak Fisik
          </h3>
          <span className="text-xs text-gray-500">
            Klik ikon cetak untuk preview format kertas fisik PT. BESMINDO
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 text-[#6B7280] font-semibold border-b border-gray-200">
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">No. Kendaraan</th>
                <th className="py-3 px-4">Jenis Formulir</th>
                <th className="py-3 px-4">Operator</th>
                <th className="py-3 px-4">Shift</th>
                <th className="py-3 px-4">Kondisi</th>
                <th className="py-3 px-4">Status Review</th>
                <th className="py-3 px-4 text-center">Aksi Cetak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-10 text-center text-gray-500">
                    Memuat data laporan...
                  </td>
                </tr>
              ) : !reportsData?.inspections || reportsData.inspections.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-10 text-center text-gray-500">
                    Tidak ada data inspeksi yang sesuai.
                  </td>
                </tr>
              ) : (
                reportsData.inspections.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-3 px-4 font-mono text-gray-800">{item.inspection_date}</td>
                    <td className="py-3 px-4 font-bold text-[#1E4B8E]">{item.vehicle_number}</td>
                    <td className="py-3 px-4 text-gray-700">{item.form_name}</td>
                    <td className="py-3 px-4 text-gray-800">{item.operator_name}</td>
                    <td className="py-3 px-4">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-gray-100">
                        {item.shift === '1st' ? '1st Pagi' : '2nd Malam'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {item.broken_count > 0 ? (
                        <span className="text-red-600 font-bold">{item.broken_count} Rusak</span>
                      ) : (
                        <span className="text-green-600 font-bold">Bagus</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {item.acknowledged_by ? (
                        <span className="text-blue-700 font-medium">Disetujui</span>
                      ) : (
                        <span className="text-amber-700 font-medium">Menunggu</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleOpenPrintPreview(item)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 bg-[#1E4B8E] hover:bg-[#2E6BC4] text-white rounded text-[11px] font-semibold transition-colors"
                      >
                        <PrintIcon className="w-3.5 h-3.5" />
                        <span>Cetak Hardfile</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Cetak Hardfile */}
      {showPrintModal && selectedInspection && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-200 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="font-bold text-sm text-[#1A1A2E]">
                Format Cetak Formulir Asli PT. BESMINDO (Siap Cetak Fisik)
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="bg-[#1E4B8E] hover:bg-[#2E6BC4] text-white px-3.5 py-1.5 rounded text-xs font-semibold flex items-center space-x-1"
                >
                  <PrintIcon className="w-3.5 h-3.5" />
                  <span>Cetak (Landscape)</span>
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
                ref={printRef}
                inspection={selectedInspection.inspection}
                results={selectedInspection.results}
                documents={selectedInspection.documents}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;

