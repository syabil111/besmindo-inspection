import React, { forwardRef } from 'react';

const PrintableInspectionForm = forwardRef(({ inspection, results = [], documents = [] }, ref) => {
  if (!inspection) return null;

  const isDozer = inspection.form_type_key === 'dozer' || inspection.type_key === 'dozer';
  const is1stShift = inspection.shift === '1st';
  const is2ndShift = inspection.shift === '2nd';

  // Group results by category
  const groupedResults = results.reduce((acc, curr) => {
    const cat = curr.category_name || 'Checklist Pemeriksaan';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(curr);
    return acc;
  }, {});

  const renderStatusMark = (condition, forShift) => {
    // If the record was submitted for this shift, show condition mark
    if ((forShift === '1st' && is1stShift) || (forShift === '2nd' && is2ndShift)) {
      if (condition === 'good') return <span className="font-bold text-black">✓</span>;
      if (condition === 'broken') return <span className="font-bold text-red-600">X</span>;
      if (condition === 'na') return <span className="font-bold text-gray-500">-</span>;
    }
    return <span className="text-gray-300">-</span>;
  };

  return (
    <div ref={ref} className="p-8 bg-white text-black text-xs font-sans max-w-5xl mx-auto print:p-4 print:max-w-none print:w-full">
      {/* Header Kop Surat */}
      <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 flex items-center justify-center print:border print:border-black">
            <img src="/logo.png" alt="BESMINDO" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-[#1E4B8E] print:text-black">
              PT. BESMINDO
            </h1>
            <p className="text-[10px] text-gray-600 print:text-black uppercase font-medium">
              Drilling & Work Over Rig Services
            </p>
          </div>
        </div>

        <div className="text-center flex-1 mx-4">
          <h2 className="text-sm font-bold uppercase tracking-wide underline">
            {inspection.form_name || 'LEMBAR PEMERIKSAAN HARIAN KENDARAAN'}
          </h2>
          <p className="text-[10px] text-gray-500 font-mono mt-0.5">
            Shift Pemeriksaan: {inspection.shift === '1st' ? 'Pagi (1st Shift)' : 'Malam (2nd Shift)'}
          </p>
        </div>

        <div className="text-right text-[11px] font-mono border border-black px-2.5 py-1">
          <div className="text-[9px] text-gray-500">NO. FORMULIR:</div>
          <div className="font-bold text-black">{inspection.form_code || 'BMSD/01/FO/TRN/11/22'}</div>
        </div>
      </div>

      {/* Info Kendaraan & Header Details */}
      <div className="border border-black mb-4">
        <div className="bg-gray-100 print:bg-gray-200 px-3 py-1 font-bold text-[11px] border-b border-black uppercase">
          Informasi Unit & Operasional
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-3 text-[11px]">
          <div>
            <span className="text-gray-600 block text-[9px] uppercase">Nomor Kendaraan / SN:</span>
            <span className="font-bold">{inspection.vehicle_number || inspection.sn_engine || '-'}</span>
          </div>
          <div>
            <span className="text-gray-600 block text-[9px] uppercase">Jenis Kendaraan / Tipe:</span>
            <span className="font-semibold">{inspection.vehicle_type || inspection.model || '-'}</span>
          </div>
          <div>
            <span className="text-gray-600 block text-[9px] uppercase">Rig / Departemen:</span>
            <span className="font-semibold">{inspection.department || '-'}</span>
          </div>
          <div>
            <span className="text-gray-600 block text-[9px] uppercase">Tanggal & Jam Inspeksi:</span>
            <span className="font-semibold">{inspection.inspection_date} {inspection.inspection_time || ''}</span>
          </div>

          {isDozer ? (
            <>
              <div>
                <span className="text-gray-600 block text-[9px] uppercase">Lokasi Unit:</span>
                <span className="font-semibold">{inspection.location || '-'}</span>
              </div>
              <div>
                <span className="text-gray-600 block text-[9px] uppercase">Status Asset:</span>
                <span className="font-semibold">{inspection.asset_status || 'Operasional'}</span>
              </div>
              <div>
                <span className="text-gray-600 block text-[9px] uppercase">Running Hours 1st:</span>
                <span className="font-semibold">{inspection.running_hours ? `${inspection.running_hours} Jam` : '-'}</span>
              </div>
              <div>
                <span className="text-gray-600 block text-[9px] uppercase">Running Hours 2nd:</span>
                <span className="font-semibold">{is2ndShift && inspection.running_hours ? `${inspection.running_hours} Jam` : '-'}</span>
              </div>
            </>
          ) : (
            <>
              <div>
                <span className="text-gray-600 block text-[9px] uppercase">KM Reading (Odometer):</span>
                <span className="font-semibold">{inspection.km_reading_value ? `${inspection.km_reading_value} KM` : '-'}</span>
              </div>
              <div>
                <span className="text-gray-600 block text-[9px] uppercase">Masa Berlaku Pajak:</span>
                <span className="font-semibold">{inspection.exp_pajak || '-'}</span>
              </div>
              <div>
                <span className="text-gray-600 block text-[9px] uppercase">Masa Berlaku KIUR:</span>
                <span className="font-semibold">{inspection.exp_kiur || '-'}</span>
              </div>
              <div>
                <span className="text-gray-600 block text-[9px] uppercase">Exp COI / K3:</span>
                <span className="font-semibold">{inspection.exp_coi || (inspection.tahun_k3 ? `K3 Th ${inspection.tahun_k3}` : '-')}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Dokumen Personal (SIM, Permit, Kartu Pengemudi) jika ada */}
      {documents && documents.length > 0 && (
        <div className="border border-black mb-4">
          <div className="bg-gray-100 print:bg-gray-200 px-3 py-1 font-bold text-[11px] border-b border-black uppercase">
            Pemeriksaan Dokumen Pengemudi / Operator
          </div>
          <table className="w-full border-collapse text-[10px]">
            <thead>
              <tr className="border-b border-black bg-gray-50">
                <th className="border-r border-black p-1 text-left w-1/4">Jenis Dokumen</th>
                <th className="border-r border-black p-1 text-left w-1/4">Nomor (1st Shift)</th>
                <th className="border-r border-black p-1 text-left w-1/4">Masa Berlaku 1st</th>
                <th className="p-1 text-left w-1/4">Nomor (2nd Shift) / Berlaku</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc, idx) => (
                <tr key={idx} className="border-b border-black last:border-b-0">
                  <td className="border-r border-black p-1 font-semibold">{doc.doc_type?.replace('_', ' ')}</td>
                  <td className="border-r border-black p-1">{doc.doc_number_1st || '-'}</td>
                  <td className="border-r border-black p-1">{doc.expiry_date_1st || '-'}</td>
                  <td className="p-1">{doc.doc_number_2nd || '-'}{doc.expiry_date_2nd ? ` (Exp: ${doc.expiry_date_2nd})` : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Checklist Pemeriksaan Fisik */}
      <div className="border border-black mb-4">
        <div className="flex items-center justify-between bg-gray-100 print:bg-gray-200 px-3 py-1 font-bold text-[11px] border-b border-black">
          <span className="uppercase">Daftar Item Pemeriksaan Harian</span>
          <span className="text-[9px] font-normal">Keterangan: [✓ = Bagus] [X = Rusak] [- = N/A]</span>
        </div>

        <table className="w-full border-collapse text-[10px]">
          <thead>
            <tr className="border-b-2 border-black bg-gray-50 font-bold">
              <th className="border-r border-black p-1 w-8 text-center">No</th>
              <th className="border-r border-black p-1 text-left">Deskripsi Item Pemeriksaan</th>
              <th className="border-r border-black p-1 w-12 text-center">1st</th>
              <th className="border-r border-black p-1 w-12 text-center">2nd</th>
              <th className="p-1 text-left w-1/3">Catatan Kerusakan / Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupedResults).map(([categoryName, items], catIdx) => (
              <React.Fragment key={catIdx}>
                <tr className="bg-gray-100 border-b border-black font-bold">
                  <td colSpan="5" className="p-1 px-2 text-[10px] uppercase text-[#1E4B8E] print:text-black">
                    {categoryName}
                  </td>
                </tr>
                {items.map((item, itemIdx) => (
                  <tr key={itemIdx} className="border-b border-gray-300 last:border-b-black hover:bg-gray-50">
                    <td className="border-r border-black p-1 text-center font-mono">{itemIdx + 1}</td>
                    <td className="border-r border-black p-1">{item.description}</td>
                    <td className="border-r border-black p-1 text-center font-mono">
                      {renderStatusMark(item.condition, '1st')}
                    </td>
                    <td className="border-r border-black p-1 text-center font-mono">
                      {renderStatusMark(item.condition, '2nd')}
                    </td>
                    <td className={`p-1 ${item.condition === 'broken' ? 'text-red-700 font-semibold' : 'text-gray-600'}`}>
                      {item.notes || (item.condition === 'broken' ? 'Rusak - Perlu perbaikan' : '-')}
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Catatan Khusus Sesuai PRD */}
      {isDozer && (
        <div className="border border-black p-2 mb-3 bg-yellow-50 text-[10px] font-semibold">
          <span className="font-bold">PERINGATAN KESELAMATAN KHUSUS:</span> Pastikan Wire Winch and Tail Chain/Hock tidak ada yang rusak & Terpasang dengan benar sebelum mengoperasikan alat.
        </div>
      )}

      <div className="border border-black p-2 mb-4 bg-gray-50 text-[10px] flex justify-between items-center">
        <div>
          <span className="font-bold">Catatan Umum Formulir: </span>
          <span>{inspection.problem_notes || 'Kondisi umum kendaraan telah diperiksa sesuai checklist di atas.'}</span>
        </div>
        <div className="italic text-[9px] text-gray-600 font-semibold">
          * Laporan agar dikumpulkan max. Per 5 hari di dept. transport
        </div>
      </div>

      {/* Footer Tanda Tangan */}
      <div className="border border-black grid grid-cols-3 text-center text-[10px]">
        <div className="border-r border-black p-2">
          <div className="font-bold mb-10 uppercase">Pengemudi / Operator 1st</div>
          <div className="font-semibold underline uppercase">{is1stShift ? (inspection.operator_name || 'Operator 1st') : '................................'}</div>
          <div className="text-[8px] text-gray-500">Tanda Tangan & Nama Terang</div>
        </div>
        <div className="border-r border-black p-2">
          <div className="font-bold mb-10 uppercase">Pengemudi / Operator 2nd</div>
          <div className="font-semibold underline uppercase">{is2ndShift ? (inspection.operator_name || 'Operator 2nd') : '................................'}</div>
          <div className="text-[8px] text-gray-500">Tanda Tangan & Nama Terang</div>
        </div>
        <div className="p-2">
          <div className="font-bold mb-10 uppercase">Atasan Langsung / HSE</div>
          <div className="font-semibold underline uppercase">
            {inspection.acknowledged_by_name ? inspection.acknowledged_by_name : (inspection.acknowledged_at ? 'ADMIN VERIFIED' : '................................')}
          </div>
          <div className="text-[8px] text-gray-500">
            {inspection.acknowledged_at 
              ? `Disetujui: ${new Date(inspection.acknowledged_at).toLocaleDateString('id-ID')}`
              : 'Tanda Tangan & Tanggal'}
          </div>
        </div>
      </div>
    </div>
  );
});

export default PrintableInspectionForm;
