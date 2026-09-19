import { useState, useEffect, useRef, useCallback } from 'react';
import { adminAPI } from '../../services/api';
import ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
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
  const [liveTime, setLiveTime] = useState(new Date());
  const [exportingExcel, setExportingExcel] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  const [filters, setFilters] = useState({
    date_from: '',
    date_to: '',
    form_type: '',
    vehicle_id: '',
  });

  const printRef = useRef();

  // Live clock — update every second
  useEffect(() => {
    const clockInterval = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(clockInterval);
  }, []);

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

  // Helper: Ambil logo BESMINDO sebagai Base64 untuk disisipkan ke PDF & Excel
  const getLogoBase64 = async () => {
    try {
      const response = await fetch('/logo.png');
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.warn('Failed to load logo for export:', err);
      return null;
    }
  };

  // Export to Excel using ExcelJS — Desain Modern, Berwarna, Logo & Rapi
  const handleExportExcel = async () => {
    if (!reportsData?.inspections || reportsData.inspections.length === 0) {
      alert('Tidak ada data inspeksi untuk diexport.');
      return;
    }

    try {
      setExportingExcel(true);
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'PT. BESMINDO';
      workbook.lastModifiedBy = 'PT. BESMINDO HSE System';
      workbook.created = new Date();

      const logoBase64 = await getLogoBase64();
      let logoImageId = null;
      if (logoBase64) {
        try {
          logoImageId = workbook.addImage({
            base64: logoBase64,
            extension: 'png',
          });
        } catch (e) {
          console.warn('Gagal menambahkan logo ke Excel:', e);
        }
      }

      // Palette Warna Resmi BESMINDO & Status
      const NAVY_DARK = 'FF162F5C';
      const NAVY_BLUE = 'FF1E4B8E';
      const WHITE = 'FFFFFFFF';
      const GRAY_LIGHT = 'FFF8FAFC';
      const GRAY_BORDER = 'FFCBD5E1';
      const GREEN_BG = 'FFDCFCE7';
      const GREEN_TEXT = 'FF166534';
      const RED_BG = 'FFFEE2E2';
      const RED_TEXT = 'FF991B1B';
      const SKY_BG = 'FFE0F2FE';
      const SKY_TEXT = 'FF075985';
      const AMBER_BG = 'FFFEF3C7';
      const AMBER_TEXT = 'FF92400E';
      const PURPLE_BG = 'FFEDE9FE';
      const PURPLE_TEXT = 'FF5B21B6';

      const thinBorder = {
        top: { style: 'thin', color: { argb: GRAY_BORDER } },
        left: { style: 'thin', color: { argb: GRAY_BORDER } },
        bottom: { style: 'thin', color: { argb: GRAY_BORDER } },
        right: { style: 'thin', color: { argb: GRAY_BORDER } },
      };

      const formTypeMap = {
        'dozer': 'Unit Dozer (BMSD/04/FO/HSE/02/17)',
        'lv_bus': 'LV & Bus (BMSD/01/FO/TRN/11/22)',
        'vacum': 'Vacum Truck (BMSD/12/FO/TRN/11/22)',
        'tandem': 'Tandem & Lowbad (BMSD/10/FO/TRN/11/22)',
        'forklift': 'Forklift (BMSD/20/FO/HSE/01/24)'
      };
      const filterFormLabel = filters.form_type ? (formTypeMap[filters.form_type] || filters.form_type) : 'Semua Jenis Formulir';
      const selectedVehicle = vehicles.find(v => v.id === filters.vehicle_id);
      const filterVehicleLabel = selectedVehicle ? `${selectedVehicle.vehicle_number} (${selectedVehicle.vehicle_type || ''})` : 'Semua Unit Kendaraan';
      const periodeStr = (filters.date_from || filters.date_to)
        ? `${filters.date_from || 'Awal'} s/d ${filters.date_to || 'Hari ini'}`
        : 'Semua Periode (Keseluruhan)';
      const exportNow = new Date();
      const exportDateStr = exportNow.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
      const exportTimeStr = exportNow.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
      const approvedCount = reportsData.inspections.filter(i => i.acknowledged_by || i.status === 'acknowledged').length;
      const pendingCount = reportsData.inspections.length - approvedCount;

      // ==========================================
      // SHEET 1: REKAP LAPORAN INSPEKSI
      // ==========================================
      const ws1 = workbook.addWorksheet('Rekap Laporan Inspeksi', {
        views: [{ showGridLines: true }]
      });

      // Sisipkan Logo jika tersedia
      if (logoImageId !== null) {
        ws1.addImage(logoImageId, {
          tl: { col: 0.15, row: 0.15 },
          ext: { width: 55, height: 55 }
        });
      }

      // Baris Kop Surat (Row 1-3)
      ws1.mergeCells('C1:P1');
      const r1 = ws1.getCell('C1');
      r1.value = 'PT. BESMINDO';
      r1.font = { name: 'Arial', size: 16, bold: true, color: { argb: NAVY_DARK } };
      r1.alignment = { vertical: 'middle' };

      ws1.mergeCells('C2:P2');
      const r2 = ws1.getCell('C2');
      r2.value = 'DIVISI HSE & TRANSPORT — SISTEM DIGITALISASI INSPEKSI KENDARAAN & ALAT BERAT';
      r2.font = { name: 'Arial', size: 9.5, bold: true, color: { argb: 'FF475569' } };
      r2.alignment = { vertical: 'middle' };

      ws1.mergeCells('C3:P3');
      const r3 = ws1.getCell('C3');
      r3.value = 'LAPORAN REKAPITULASI INSPEKSI HARIAN ARMADA OPERASIONAL';
      r3.font = { name: 'Arial', size: 11, bold: true, color: { argb: NAVY_BLUE } };
      r3.alignment = { vertical: 'middle' };

      ws1.getRow(1).height = 24;
      ws1.getRow(2).height = 18;
      ws1.getRow(3).height = 20;

      // Garis aksen pemisah (Row 4)
      ws1.mergeCells('A4:P4');
      const accentLine = ws1.getCell('A4');
      accentLine.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY_BLUE } };
      ws1.getRow(4).height = 4;

      // Kotak Info & Ringkasan Statistik (Row 6-11)
      ws1.mergeCells('A6:E6');
      const infoHeaderL = ws1.getCell('A6');
      infoHeaderL.value = 'INFORMASI FILTER & DOKUMEN';
      infoHeaderL.font = { name: 'Arial', size: 9, bold: true, color: { argb: NAVY_DARK } };
      infoHeaderL.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
      infoHeaderL.alignment = { vertical: 'middle' };

      ws1.mergeCells('G6:K6');
      const infoHeaderR = ws1.getCell('G6');
      infoHeaderR.value = 'RINGKASAN STATISTIK LAPORAN';
      infoHeaderR.font = { name: 'Arial', size: 9, bold: true, color: { argb: NAVY_DARK } };
      infoHeaderR.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
      infoHeaderR.alignment = { vertical: 'middle' };
      ws1.getRow(6).height = 20;

      const summaryRows = [
        ['Periode Inspeksi', `: ${periodeStr}`, '', '', '', '', 'Total Formulir Diinspeksi', `: ${reportsData.total_inspections || 0} Formulir`],
        ['Filter Jenis Formulir', `: ${filterFormLabel}`, '', '', '', '', 'Total Item Kondisi Baik (Laik)', `: ${reportsData.total_good || 0} Item`],
        ['Filter Unit Kendaraan', `: ${filterVehicleLabel}`, '', '', '', '', 'Total Temuan Item Rusak', `: ${reportsData.total_broken || 0} Item`],
        ['Tanggal Unduh Laporan', `: ${exportDateStr}, ${exportTimeStr}`, '', '', '', '', 'Status Disetujui (Approved)', `: ${approvedCount} Inspeksi`],
        ['Status Filter', ': Sesuai kriteria aktif', '', '', '', '', 'Status Menunggu Review', `: ${pendingCount} Inspeksi`],
      ];

      summaryRows.forEach((vals, sIdx) => {
        const rowNum = 7 + sIdx;
        ws1.getRow(rowNum).values = vals;
        ws1.getCell(`A${rowNum}`).font = { name: 'Arial', size: 8.5, bold: true, color: { argb: 'FF475569' } };
        ws1.getCell(`B${rowNum}`).font = { name: 'Arial', size: 8.5, color: { argb: 'FF0F172A' } };
        ws1.getCell(`G${rowNum}`).font = { name: 'Arial', size: 8.5, bold: true, color: { argb: 'FF475569' } };
        ws1.getCell(`H${rowNum}`).font = { name: 'Arial', size: 8.5, color: { argb: 'FF0F172A' } };
        ws1.getRow(rowNum).height = 18;
      });

      // Header Kolom Tabel (Row 13)
      const tableHeaders = [
        'NO', 'TANGGAL INSPEKSI', 'WAKTU', 'JENIS FORMULIR', 'NOMOR POLISI / UNIT',
        'TIPE / MODEL KENDARAAN', 'DEPARTEMEN', 'LOKASI OPERASIONAL', 'NAMA OPERATOR',
        'SHIFT KERJA', 'ODOMETER / JAM KERJA', 'KONDISI KELAYAKAN', 'JUMLAH ITEM RUSAK',
        'CATATAN / TEMUAN KENDALA', 'STATUS REVIEW', 'DISETUJUI OLEH'
      ];

      const headerRow = ws1.getRow(13);
      headerRow.values = tableHeaders;
      headerRow.height = 26;
      headerRow.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY_BLUE } };
        cell.font = { name: 'Arial', size: 9, bold: true, color: { argb: WHITE } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = thinBorder;
      });

      // Data Rows
      reportsData.inspections.forEach((i, idx) => {
        const isBroken = (i.broken_count || 0) > 0;
        const shiftLabel = i.shift === '1st' ? 'Shift 1 (Pagi)' : (i.shift === '2nd' ? 'Shift 2 (Malam)' : (i.shift || '-'));
        const kmOrHours = i.km_reading_value ? `${Number(i.km_reading_value).toLocaleString('id-ID')} KM` : (i.running_hours ? `${Number(i.running_hours).toLocaleString('id-ID')} Hours` : '-');
        const conditionStatus = isBroken ? 'ADA KERUSAKAN' : 'LAIK OPERASI';
        const isApproved = i.acknowledged_by || i.status === 'acknowledged';
        const approvalStatus = isApproved ? 'DISETUJUI' : 'MENUNGGU REVIEW';

        const row = ws1.addRow([
          idx + 1,
          i.inspection_date || '-',
          i.inspection_time || '-',
          i.form_name || '-',
          i.vehicle_number || '-',
          i.vehicle_type || i.model || '-',
          i.department || '-',
          i.location || '-',
          i.operator_name || '-',
          shiftLabel,
          kmOrHours,
          conditionStatus,
          i.broken_count || 0,
          i.problem_notes || 'Tidak ada catatan kerusakan',
          approvalStatus,
          i.acknowledged_by || '-'
        ]);

        row.height = 20;
        const isEven = idx % 2 === 1;
        const defaultBg = isEven ? GRAY_LIGHT : WHITE;

        row.eachCell((cell, colNumber) => {
          cell.font = { name: 'Arial', size: 8.5, color: { argb: 'FF1E293B' } };
          cell.border = thinBorder;
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: defaultBg } };
          cell.alignment = { vertical: 'middle', horizontal: 'left' };

          // Kolom yang dipusatkan
          if ([1, 2, 3, 5, 10, 12, 13, 15, 16].includes(colNumber)) {
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
          }
          if (colNumber === 11) {
            cell.alignment = { vertical: 'middle', horizontal: 'right' };
          }

          // Bold Nomor Unit
          if (colNumber === 5) {
            cell.font = { name: 'Arial', size: 9, bold: true, color: { argb: NAVY_DARK } };
          }

          // Warna Shift
          if (colNumber === 10) {
            if (i.shift === '1st') {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: AMBER_BG } };
              cell.font = { name: 'Arial', size: 8.5, bold: true, color: { argb: AMBER_TEXT } };
            } else if (i.shift === '2nd') {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: PURPLE_BG } };
              cell.font = { name: 'Arial', size: 8.5, bold: true, color: { argb: PURPLE_TEXT } };
            }
          }

          // Warna Kondisi Kelayakan
          if (colNumber === 12) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isBroken ? RED_BG : GREEN_BG } };
            cell.font = { name: 'Arial', size: 8.5, bold: true, color: { argb: isBroken ? RED_TEXT : GREEN_TEXT } };
          }

          // Warna Item Rusak
          if (colNumber === 13 && isBroken) {
            cell.font = { name: 'Arial', size: 8.5, bold: true, color: { argb: RED_TEXT } };
          }

          // Warna Status Review
          if (colNumber === 15) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isApproved ? SKY_BG : AMBER_BG } };
            cell.font = { name: 'Arial', size: 8.5, bold: true, color: { argb: isApproved ? SKY_TEXT : AMBER_TEXT } };
          }
        });
      });

      // Lebar kolom rapi
      ws1.columns = [
        { width: 6 },  // NO
        { width: 16 }, // TANGGAL INSPEKSI
        { width: 10 }, // WAKTU
        { width: 42 }, // JENIS FORMULIR
        { width: 22 }, // NOMOR POLISI / UNIT
        { width: 28 }, // TIPE / MODEL KENDARAAN
        { width: 24 }, // DEPARTEMEN
        { width: 24 }, // LOKASI OPERASIONAL
        { width: 22 }, // NAMA OPERATOR
        { width: 18 }, // SHIFT KERJA
        { width: 24 }, // ODOMETER / JAM KERJA
        { width: 22 }, // KONDISI KELAYAKAN
        { width: 20 }, // JUMLAH ITEM RUSAK
        { width: 50 }, // CATATAN / TEMUAN KENDALA
        { width: 20 }, // STATUS REVIEW
        { width: 22 }, // DISETUJUI OLEH
      ];

      // ==========================================
      // SHEET 2: DAFTAR TEMUAN ITEM RUSAK
      // ==========================================
      const brokenList = reportsData.inspections.filter(i => (i.broken_count || 0) > 0 || (i.problem_notes && i.problem_notes.trim() !== ''));
      if (brokenList.length > 0) {
        const ws2 = workbook.addWorksheet('Temuan Item Rusak', {
          views: [{ showGridLines: true }]
        });

        if (logoImageId !== null) {
          ws2.addImage(logoImageId, {
            tl: { col: 0.15, row: 0.15 },
            ext: { width: 48, height: 48 }
          });
        }

        ws2.mergeCells('C1:L1');
        const ws2R1 = ws2.getCell('C1');
        ws2R1.value = 'PT. BESMINDO';
        ws2R1.font = { name: 'Arial', size: 14, bold: true, color: { argb: RED_TEXT } };

        ws2.mergeCells('C2:L2');
        const ws2R2 = ws2.getCell('C2');
        ws2R2.value = 'DIVISI HSE & TRANSPORT — TIM PEMELIHARAAN & WORKSHOP';
        ws2R2.font = { name: 'Arial', size: 9.5, bold: true, color: { argb: 'FF475569' } };

        ws2.mergeCells('C3:L3');
        const ws2R3 = ws2.getCell('C3');
        ws2R3.value = 'DAFTAR TEMUAN KENDALA & ITEM RUSAK (TINDAK LANJUT PERBAIKAN)';
        ws2R3.font = { name: 'Arial', size: 11, bold: true, color: { argb: RED_TEXT } };

        ws2.mergeCells('A4:L4');
        ws2.getCell('A4').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDC2626' } };
        ws2.getRow(4).height = 4;

        const brokenHeaders = [
          'NO', 'TANGGAL', 'NO. KENDARAAN', 'TIPE / MODEL UNIT', 'DEPARTEMEN',
          'LOKASI UNIT', 'OPERATOR PELAPOR', 'SHIFT', 'JUMLAH RUSAK',
          'RINCIAN TEMUAN KERUSAKAN / KENDALA', 'STATUS APPROVAL', 'DISETUJUI OLEH'
        ];
        const hRow2 = ws2.getRow(6);
        hRow2.values = brokenHeaders;
        hRow2.height = 26;
        hRow2.eachCell((cell) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDC2626' } };
          cell.font = { name: 'Arial', size: 9, bold: true, color: { argb: WHITE } };
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.border = thinBorder;
        });

        brokenList.forEach((i, idx) => {
          const row = ws2.addRow([
            idx + 1,
            i.inspection_date || '-',
            i.vehicle_number || '-',
            i.vehicle_type || i.model || '-',
            i.department || '-',
            i.location || '-',
            i.operator_name || '-',
            i.shift === '1st' ? 'Shift 1 (Pagi)' : 'Shift 2 (Malam)',
            `${i.broken_count || 0} Item`,
            i.problem_notes || 'Item checklist dilaporkan rusak',
            (i.acknowledged_by || i.status === 'acknowledged') ? 'DISETUJUI' : 'MENUNGGU REVIEW',
            i.acknowledged_by || '-'
          ]);
          row.height = 22;
          row.eachCell((cell, colNum) => {
            cell.font = { name: 'Arial', size: 8.5, color: { argb: 'FF1E293B' } };
            cell.border = thinBorder;
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: idx % 2 === 1 ? 'FFFFF5F5' : WHITE } };
            cell.alignment = { vertical: 'middle', horizontal: 'left' };
            if ([1, 2, 3, 8, 9, 11, 12].includes(colNum)) {
              cell.alignment = { vertical: 'middle', horizontal: 'center' };
            }
            if (colNum === 3) {
              cell.font = { name: 'Arial', size: 9, bold: true, color: { argb: RED_TEXT } };
            }
            if (colNum === 9) {
              cell.font = { name: 'Arial', size: 8.5, bold: true, color: { argb: RED_TEXT } };
            }
          });
        });

        ws2.columns = [
          { width: 6 },  // NO
          { width: 14 }, // TANGGAL
          { width: 22 }, // NO. KENDARAAN
          { width: 28 }, // TIPE / MODEL UNIT
          { width: 24 }, // DEPARTEMEN
          { width: 24 }, // LOKASI UNIT
          { width: 22 }, // OPERATOR PELAPOR
          { width: 18 }, // SHIFT
          { width: 16 }, // JUMLAH RUSAK
          { width: 55 }, // RINCIAN TEMUAN KERUSAKAN
          { width: 20 }, // STATUS APPROVAL
          { width: 22 }, // DISETUJUI OLEH
        ];
      }

      // Download file Excel
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      const dateFormatted = new Date().toISOString().split('T')[0];
      anchor.download = `Laporan_Inspeksi_BESMINDO_${dateFormatted}.xlsx`;
      anchor.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error saat export excel:', err);
      alert('Terjadi kesalahan saat membuat file Excel.');
    } finally {
      setExportingExcel(false);
    }
  };

  // Export to PDF using jsPDF & autoTable — Desain Elegan, Logo Resmi, Warna & Lengkap
  const handleExportPDF = async () => {
    if (!reportsData?.inspections || reportsData.inspections.length === 0) {
      alert('Tidak ada data inspeksi untuk diexport.');
      return;
    }

    try {
      setExportingPdf(true);
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const logoBase64 = await getLogoBase64();

      // 1. KOP SURAT RESMI BESMINDO
      if (logoBase64) {
        try {
          doc.addImage(logoBase64, 'PNG', 14, 9, 17, 17);
        } catch (e) {
          console.warn('Gagal menambahkan logo ke PDF:', e);
        }
      }

      // Teks Kop Surat
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(22, 47, 92); // #162F5C Navy
      doc.text('PT. BESMINDO', 35, 15);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(75, 85, 99);
      doc.text('DRILLING & WORK OVER RIG SERVICES — DIVISI HSE & TRANSPORT', 35, 20);

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(107, 114, 128);
      doc.text('Sistem Digitalisasi Formulir Pemeriksaan Harian Kendaraan & Alat Berat Operasional', 35, 24);

      // Garis aksen pemisah kop surat (Navy & Gold)
      doc.setDrawColor(30, 75, 142); // #1E4B8E
      doc.setLineWidth(0.8);
      doc.line(14, 28, 283, 28);
      doc.setDrawColor(201, 162, 39); // #C9A227 Gold accent
      doc.setLineWidth(0.3);
      doc.line(14, 29.2, 283, 29.2);

      // 2. JUDUL DOKUMEN & INFO FILTER
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(26, 26, 46);
      doc.text('LAPORAN REKAPITULASI INSPEKSI HARIAN ARMADA', 14, 35);

      const periodeStr = (filters.date_from || filters.date_to)
        ? `${filters.date_from || 'Awal'} s/d ${filters.date_to || 'Hari ini'}`
        : 'Semua Periode';
      const formTypeMap = {
        'dozer': 'Unit Dozer',
        'lv_bus': 'LV & Bus',
        'vacum': 'Vacum Truck',
        'tandem': 'Tandem & Lowbad',
        'forklift': 'Forklift'
      };
      const filterFormLabel = filters.form_type ? (formTypeMap[filters.form_type] || filters.form_type) : 'Semua Formulir';
      const selectedVehicle = vehicles.find(v => v.id === filters.vehicle_id);
      const filterVehicleLabel = selectedVehicle ? selectedVehicle.vehicle_number : 'Semua Unit';

      // Summary Info Box
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(14, 38, 269, 14, 2, 2, 'FD');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      doc.text(`Periode: ${periodeStr}`, 18, 43);
      doc.text(`Jenis Formulir: ${filterFormLabel}`, 18, 48);

      doc.text(`Filter Unit: ${filterVehicleLabel}`, 100, 43);
      doc.text(`Waktu Cetak: ${new Date().toLocaleString('id-ID')} WIB`, 100, 48);

      // Stat badges
      doc.setFont('helvetica', 'bold');
      doc.text(`Total Form: ${reportsData.total_inspections || 0}`, 195, 43);
      doc.setTextColor(22, 163, 74);
      doc.text(`Laik Operasi: ${reportsData.total_good || 0} Item`, 195, 48);
      doc.setTextColor(220, 38, 38);
      doc.text(`Item Rusak: ${reportsData.total_broken || 0} Item`, 240, 48);

      // 3. TABEL DATA UTAMA (AUTOTABLE)
      const tableColumns = [
        { header: 'No', dataKey: 'no' },
        { header: 'Tgl & Jam', dataKey: 'date_time' },
        { header: 'No. Unit', dataKey: 'vehicle_number' },
        { header: 'Tipe / Model', dataKey: 'vehicle_type' },
        { header: 'Jenis Formulir', dataKey: 'form_name' },
        { header: 'Operator', dataKey: 'operator_name' },
        { header: 'Shift', dataKey: 'shift' },
        { header: 'Kondisi', dataKey: 'condition' },
        { header: 'Rusak', dataKey: 'broken' },
        { header: 'Status Review', dataKey: 'status' },
      ];

      const tableRows = reportsData.inspections.map((i, idx) => {
        const isBroken = (i.broken_count || 0) > 0;
        const shiftStr = i.shift === '1st' ? '1 (Pagi)' : (i.shift === '2nd' ? '2 (Malam)' : (i.shift || '-'));
        const isApproved = i.acknowledged_by || i.status === 'acknowledged';

        return {
          no: idx + 1,
          date_time: `${i.inspection_date || '-'}\n${i.inspection_time || ''}`,
          vehicle_number: i.vehicle_number || '-',
          vehicle_type: i.vehicle_type || i.model || '-',
          form_name: i.form_name || '-',
          operator_name: i.operator_name || '-',
          shift: shiftStr,
          condition: isBroken ? 'ADA KERUSAKAN' : 'LAIK OPERASI',
          broken: i.broken_count > 0 ? `${i.broken_count} Item` : '-',
          status: isApproved ? 'DISETUJUI' : 'MENUNGGU',
          rawBroken: isBroken,
          rawApproved: isApproved,
        };
      });

      autoTable(doc, {
        startY: 55,
        columns: tableColumns,
        body: tableRows,
        theme: 'grid',
        styles: {
          fontSize: 7.5,
          cellPadding: 2,
          textColor: [30, 41, 59],
          lineColor: [226, 232, 240],
          lineWidth: 0.2,
        },
        headStyles: {
          fillColor: [30, 75, 142], // Navy #1E4B8E
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center',
          fontSize: 8,
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        columnStyles: {
          no: { halign: 'center', cellWidth: 10 },
          date_time: { halign: 'center', cellWidth: 22 },
          vehicle_number: { fontStyle: 'bold', halign: 'center', cellWidth: 25 },
          vehicle_type: { cellWidth: 32 },
          form_name: { cellWidth: 55 },
          operator_name: { cellWidth: 30 },
          shift: { halign: 'center', cellWidth: 20 },
          condition: { halign: 'center', fontStyle: 'bold', cellWidth: 28 },
          broken: { halign: 'center', cellWidth: 18 },
          status: { halign: 'center', fontStyle: 'bold', cellWidth: 25 },
        },
        didParseCell: function(data) {
          if (data.section === 'body') {
            const rowData = tableRows[data.row.index];
            if (data.column.dataKey === 'condition') {
              if (rowData.rawBroken) {
                data.cell.styles.textColor = [220, 38, 38]; // Merah
                data.cell.styles.fillColor = [254, 242, 242];
              } else {
                data.cell.styles.textColor = [22, 163, 74]; // Hijau
                data.cell.styles.fillColor = [240, 253, 244];
              }
            }
            if (data.column.dataKey === 'status') {
              if (rowData.rawApproved) {
                data.cell.styles.textColor = [3, 105, 161]; // Biru Langit
                data.cell.styles.fillColor = [240, 249, 255];
              } else {
                data.cell.styles.textColor = [180, 83, 9]; // Amber
                data.cell.styles.fillColor = [254, 252, 232];
              }
            }
            if (data.column.dataKey === 'broken' && rowData.rawBroken) {
              data.cell.styles.textColor = [220, 38, 38];
              data.cell.styles.fontStyle = 'bold';
            }
          }
        },
        didDrawPage: function(data) {
          const pageCount = doc.internal.getNumberOfPages();
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7);
          doc.setTextColor(156, 163, 175);
          doc.setDrawColor(229, 231, 235);
          doc.line(14, 200, 283, 200);
          doc.text('PT. BESMINDO • Dokumen Laporan Hasil Inspeksi Kendaraan & Alat Berat Operasional Lapangan', 14, 204);
          doc.text(`Halaman ${data.pageNumber} dari ${pageCount}`, 260, 204);
        }
      });

      // 4. TABEL RINCIAN ITEM RUSAK JIKA ADA
      const brokenUnits = reportsData.inspections.filter(i => (i.broken_count || 0) > 0 || (i.problem_notes && i.problem_notes.trim() !== ''));
      if (brokenUnits.length > 0) {
        let nextY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : 120) + 10;
        if (nextY > 150) {
          doc.addPage();
          nextY = 20;
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(185, 28, 28);
        doc.text('DAFTAR RINCIAN TEMUAN KERUSAKAN & CATATAN KENDALA (TINDAK LANJUT HSE / WORKSHOP)', 14, nextY);

        const brokenColumns = [
          { header: 'No', dataKey: 'no' },
          { header: 'Tanggal', dataKey: 'date' },
          { header: 'No. Unit', dataKey: 'unit' },
          { header: 'Tipe Kendaraan', dataKey: 'type' },
          { header: 'Operator', dataKey: 'operator' },
          { header: 'Shift', dataKey: 'shift' },
          { header: 'Item Rusak', dataKey: 'broken_count' },
          { header: 'Rincian Temuan / Catatan Kendala', dataKey: 'notes' },
        ];

        const brokenRows = brokenUnits.map((item, idx) => ({
          no: idx + 1,
          date: item.inspection_date || '-',
          unit: item.vehicle_number || '-',
          type: item.vehicle_type || item.model || '-',
          operator: item.operator_name || '-',
          shift: item.shift === '1st' ? '1 (Pagi)' : '2 (Malam)',
          broken_count: `${item.broken_count || 0} Item`,
          notes: item.problem_notes || 'Item checklist dilaporkan rusak',
        }));

        autoTable(doc, {
          startY: nextY + 3,
          columns: brokenColumns,
          body: brokenRows,
          theme: 'grid',
          styles: {
            fontSize: 7.5,
            cellPadding: 2,
            textColor: [30, 41, 59],
            lineColor: [254, 202, 202],
            lineWidth: 0.2,
          },
          headStyles: {
            fillColor: [185, 28, 28], // Dark Red
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'center',
            fontSize: 8,
          },
          alternateRowStyles: {
            fillColor: [255, 245, 245],
          },
          columnStyles: {
            no: { halign: 'center', cellWidth: 10 },
            date: { halign: 'center', cellWidth: 22 },
            unit: { fontStyle: 'bold', halign: 'center', cellWidth: 25 },
            type: { cellWidth: 32 },
            operator: { cellWidth: 30 },
            shift: { halign: 'center', cellWidth: 18 },
            broken_count: { halign: 'center', fontStyle: 'bold', textColor: [220, 38, 38], cellWidth: 22 },
            notes: { fontStyle: 'italic', cellWidth: 110 },
          },
          didDrawPage: function(data) {
            const pageCount = doc.internal.getNumberOfPages();
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7);
            doc.setTextColor(156, 163, 175);
            doc.setDrawColor(229, 231, 235);
            doc.line(14, 200, 283, 200);
            doc.text('PT. BESMINDO • Dokumen Laporan Hasil Inspeksi Kendaraan & Alat Berat Operasional Lapangan', 14, 204);
            doc.text(`Halaman ${data.pageNumber} dari ${pageCount}`, 260, 204);
          }
        });
      }

      const dateFormatted = new Date().toISOString().split('T')[0];
      doc.save(`Laporan_Inspeksi_BESMINDO_${dateFormatted}.pdf`);
    } catch (err) {
      console.error('Error saat export PDF:', err);
      alert('Terjadi kesalahan saat membuat file PDF.');
    } finally {
      setExportingPdf(false);
    }
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
          <h1 className="text-3xl font-extrabold text-[#162F5C] dark:text-white tracking-tight">Laporan & Cetak Hardfile</h1>
          <p className="text-xs text-[#6B7280] dark:text-gray-400 mt-0.5">
            Rekap statistik inspeksi, export format Excel/PDF, dan cetak fisik formulir asli PT. BESMINDO
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">


          {/* Export Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportExcel}
              disabled={exportingExcel}
              className="inline-flex items-center space-x-1.5 bg-[#16A34A] hover:bg-green-700 disabled:bg-green-400 text-white px-3.5 py-2 rounded-md text-xs font-semibold shadow-sm transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              <ExcelIcon className="w-4 h-4" />
              <span>{exportingExcel ? 'Membuat Excel...' : 'Export Excel (.xlsx)'}</span>
            </button>
            <button
              onClick={handleExportPDF}
              disabled={exportingPdf}
              className="inline-flex items-center space-x-1.5 bg-[#DC2626] hover:bg-red-700 disabled:bg-red-400 text-white px-3.5 py-2 rounded-md text-xs font-semibold shadow-sm transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              <PdfIcon className="w-4 h-4" />
              <span>{exportingPdf ? 'Membuat PDF...' : 'Export Ringkasan PDF'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-slate-200/80 dark:border-gray-800 shadow-xs">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 dark:text-white mb-4 uppercase tracking-widest">
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
              className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-slate-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#1E4B8E]/20 focus:border-[#1E4B8E] transition-all focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium text-gray-600 block mb-1">Tanggal Sampai</label>
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-slate-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#1E4B8E]/20 focus:border-[#1E4B8E] transition-all focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium text-gray-600 block mb-1">Jenis Formulir</label>
            <select
              value={filters.form_type}
              onChange={(e) => setFilters({ ...filters, form_type: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-slate-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#1E4B8E]/20 focus:border-[#1E4B8E] transition-all focus:outline-none"
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
              className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-slate-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#1E4B8E]/20 focus:border-[#1E4B8E] transition-all focus:outline-none"
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
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300">
          <span className="text-[11px] font-medium text-gray-500 uppercase">Total Inspeksi Terlaksana</span>
          <p className="text-2xl font-bold text-[#1E4B8E] mt-1 font-mono">{reportsData?.total_inspections || 0}</p>
          <span className="text-[10px] text-gray-400">Sesuai filter terpilih</span>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300">
          <span className="text-[11px] font-medium text-gray-500 uppercase">Kondisi Bagus</span>
          <p className="text-2xl font-bold text-[#16A34A] mt-1 font-mono">{reportsData?.total_good || 0}</p>
          <span className="text-[10px] text-gray-400">Item checklist laik pakai</span>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300">
          <span className="text-[11px] font-medium text-gray-500 uppercase">Kondisi Rusak</span>
          <p className="text-2xl font-bold text-[#DC2626] mt-1 font-mono">{reportsData?.total_broken || 0}</p>
          <span className="text-[10px] text-gray-400">Memerlukan service / ganti</span>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300">
          <span className="text-[11px] font-medium text-gray-500 uppercase">Item Tidak Tersedia (N/A)</span>
          <p className="text-2xl font-bold text-gray-600 mt-1 font-mono">{reportsData?.total_na || 0}</p>
          <span className="text-[10px] text-gray-400">Bukan fitur unit terkait</span>
        </div>
      </div>

      {/* Top 5 Item Paling Sering Rusak */}
      {reportsData?.top_broken_items && reportsData.top_broken_items.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-[#E5E7EB] dark:border-gray-800 shadow-sm">
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
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-slate-200/80 dark:border-gray-800 shadow-xs overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#1A1A2E]">
            Daftar Formulir Siap Cetak Fisik
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Klik ikon cetak untuk preview format kertas fisik PT. BESMINDO
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 text-[#6B7280] font-semibold border-b border-gray-200 dark:border-gray-700">
                <th className="py-3.5 px-5">Tanggal & Jam</th>
                <th className="py-3.5 px-5">No. Kendaraan</th>
                <th className="py-3.5 px-5">Jenis Formulir</th>
                <th className="py-3.5 px-5">Operator</th>
                <th className="py-3.5 px-5">Shift</th>
                <th className="py-3.5 px-5">Kondisi</th>
                <th className="py-3.5 px-5">Status Review</th>
                <th className="py-3 px-4 text-center">Aksi Cetak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-10 text-center text-gray-500 dark:text-gray-400">
                    Memuat data laporan...
                  </td>
                </tr>
              ) : !reportsData?.inspections || reportsData.inspections.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-10 text-center text-gray-500 dark:text-gray-400">
                    Tidak ada data inspeksi yang sesuai.
                  </td>
                </tr>
              ) : (
                reportsData.inspections.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-800 text-[11px]">
                          {item.inspection_date
                            ? new Date(item.inspection_date).toLocaleDateString('id-ID', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
                            : '-'}
                        </span>
                        <span className="text-[10px] text-gray-500 font-mono mt-0.5">
                          {item.inspection_time ? `⏰ ${item.inspection_time}` : ''}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-[#1E4B8E]">{item.vehicle_number}</td>
                    <td className="py-3 px-4 text-gray-700">{item.form_name}</td>
                    <td className="py-3 px-4 text-gray-800">{item.operator_name}</td>
                    <td className="py-3.5 px-5">
                      <div className="flex flex-col gap-1">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold inline-block w-fit ${
                          item.shift === '1st'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                        }`}>
                          {item.shift === '1st' ? 'Pagi (1st)' : 'Malam (2nd)'}
                        </span>
                        {item.hasMorningAndEvening && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-gradient-to-r from-amber-500 to-indigo-500 text-white inline-block w-fit">
                            Pagi & Malam
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      {item.broken_count > 0 ? (
                        <span className="text-red-600 font-bold">{item.broken_count} Rusak</span>
                      ) : (
                        <span className="text-green-600 font-bold">Bagus</span>
                      )}
                    </td>
                    <td className="py-3.5 px-5">
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
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-200 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="font-bold text-sm text-[#1A1A2E] dark:text-white">
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

