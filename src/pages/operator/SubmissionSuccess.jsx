import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

// ============================================================================
// HALAMAN SUKSES SUBMIT — Setelah operator berhasil mengirim form inspeksi
// ============================================================================

const SubmissionSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { vehicleNumber, formType } = location.state || {};

  useEffect(() => {
    // Redirect jika tidak ada state (akses langsung)
    if (!vehicleNumber || !formType) {
      navigate('/operator', { replace: true });
    }
  }, [vehicleNumber, formType, navigate]);

  return (
    <div className="max-w-xl mx-auto py-4 sm:py-8">
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/70 border border-slate-200/80 overflow-hidden text-center">
        
        {/* Curved Header Banner with Emerald & Royal Blue */}
        <div className="relative bg-gradient-to-r from-[#0F5132] via-[#1E4B8E] to-[#162F5C] pt-10 pb-12 px-6 text-white overflow-hidden">
          {/* Ambient Glows */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-emerald-400/20 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-blue-300/20 blur-2xl pointer-events-none" />

          {/* Success Icon with Ripple Ring */}
          <div className="relative z-10 mx-auto w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl shadow-black/20 mb-3 group">
            <div className="absolute inset-0 rounded-full bg-emerald-400/30 animate-ping" />
            <svg className="w-10 h-10 text-emerald-600 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white relative z-10">
            Formulir Inspeksi Berhasil Disubmit!
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-md mx-auto relative z-10">
            Data inspeksi armada <strong>{vehicleNumber}</strong> telah resmi diverifikasi dan tercatat ke database HSE.
          </p>

          {/* Bottom Wave Divider */}
          <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none pointer-events-none">
            <svg
              viewBox="0 0 1200 60"
              preserveAspectRatio="none"
              className="w-full h-7 sm:h-9 text-white fill-current"
            >
              <path d="M0,0 C300,55 900,55 1200,0 L1200,60 L0,60 Z" />
            </svg>
          </div>
        </div>

        <div className="p-6 sm:p-8 pt-4 space-y-6">
          {/* Details & Next Steps Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            {/* Details Card */}
            <div className="bg-gradient-to-br from-blue-50/90 to-blue-50/40 border border-blue-200/80 rounded-2xl p-4 text-xs space-y-2 shadow-xs">
              <div className="flex items-center gap-1.5 text-[#1E4B8E] font-black text-xs uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1E4B8E]" />
                Detail Inspeksi
              </div>
              <div className="text-slate-700 space-y-1 font-medium">
                <div>• Form: <strong className="text-slate-900">{formType}</strong></div>
                <div>• Unit: <strong className="text-slate-900">{vehicleNumber}</strong></div>
                <div>• Tanggal: <span className="font-semibold">{new Date().toLocaleDateString('id-ID')}</span></div>
                <div>• Waktu: <span className="font-semibold">{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span></div>
              </div>
            </div>

            {/* Next Steps Card */}
            <div className="bg-gradient-to-br from-emerald-50/90 to-emerald-50/40 border border-emerald-200/80 rounded-2xl p-4 text-xs space-y-2 shadow-xs">
              <div className="flex items-center gap-1.5 text-emerald-800 font-black text-xs uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                Langkah Sistem
              </div>
              <div className="text-slate-700 space-y-1 font-medium">
                <div>• Tersimpan di database HSE</div>
                <div>• Tim Admin menerima notifikasi</div>
                <div>• Laporan siap cetak PDF resmi</div>
                <div>• Flag kerusakan dialirkan ke mekanik</div>
              </div>
            </div>
          </div>

          {/* Terima Kasih Message */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 font-semibold flex items-center justify-center gap-2">
            <span>🙏</span>
            <span>Terima kasih, Pak! Inspeksi Anda telah tuntas. Anda dapat menutup halaman ini atau mengisi form baru.</span>
          </div>

          {/* Action Button */}
          <div className="pt-1">
            <Link
              to="/operator"
              className="w-full py-3.5 bg-gradient-to-r from-[#162F5C] via-[#1E4B8E] to-[#2A5BAD] hover:from-[#112347] hover:to-[#1E4B8E] text-white rounded-2xl font-bold text-sm sm:text-base shadow-lg shadow-blue-900/25 transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <span>Isi Formulir Inspeksi Baru</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>

          {/* Footer Note */}
          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-mono">
            Inspeksi #{new Date().getTime().toString().slice(-6)} • {new Date().toLocaleString('id-ID')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionSuccess;