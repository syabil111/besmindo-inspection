import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

// ============================================================================
// HALAMAN SUKSES SUBMIT — Sederhana & Bersih
// ============================================================================

const SubmissionSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { vehicleNumber, formType } = location.state || {};

  useEffect(() => {
    if (!vehicleNumber || !formType) {
      navigate('/', { replace: true });
    }
  }, [vehicleNumber, formType, navigate]);

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden text-center">
        
        {/* Header Sukses Sederhana */}
        <div className="bg-[#1E4B8E] text-white p-6 sm:p-7">
          <div className="mx-auto w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center shadow mb-3">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Inspeksi Berhasil Disimpan!
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 mt-1">
            Data inspeksi armada <strong>{vehicleNumber}</strong> telah resmi tercatat ke dalam sistem HSE.
          </p>
        </div>

        <div className="p-6 space-y-5">
          {/* Ringkasan */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left text-xs space-y-2">
            <div className="text-slate-800 font-bold uppercase tracking-wide text-[11px]">
              Ringkasan Data:
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-600">
              <div>Jenis Form: <span className="font-semibold text-slate-800">{formType}</span></div>
              <div>Nomor Unit: <span className="font-semibold text-slate-800">{vehicleNumber}</span></div>
              <div>Tanggal: <span className="font-semibold text-slate-800">{new Date().toLocaleDateString('id-ID')}</span></div>
              <div>Waktu: <span className="font-semibold text-slate-800">{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span></div>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs text-left flex items-start gap-2">
            <svg className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Terima kasih telah menjalankan prosedur keselamatan HSE. Kendaraan dinyatakan siap setelah verifikasi.</span>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <Link
              to="/"
              className="w-full py-2.5 bg-[#1E4B8E] hover:bg-[#163A6E] active:bg-[#102C55] text-white rounded-lg font-semibold text-sm shadow transition duration-150 flex items-center justify-center gap-2"
            >
              <span>Isi Formulir Baru</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionSuccess;