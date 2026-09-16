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
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-lg text-center space-y-6">
        {/* Success Icon */}
        <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center shadow-inner">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Success Message */}
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#1A1A2E]">
            Formulir Inspeksi Berhasil Disubmit!
          </h1>

          <p className="text-xs sm:text-sm text-gray-600 mt-1.5">
            Data inspeksi untuk armada <strong>{vehicleNumber}</strong> telah tercatat secara resmi di sistem PT. BESMINDO.
          </p>
        </div>

        {/* Details & Next Steps Grid on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          {/* Details */}
          <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-4 text-xs space-y-1.5">
            <h3 className="font-extrabold text-[#1E4B8E] text-xs uppercase tracking-wider mb-2">Detail Inspeksi:</h3>
            <div className="text-blue-900 space-y-1 font-medium">
              <div>• Jenis: <strong>{formType}</strong></div>
              <div>• Armada: <strong>{vehicleNumber}</strong></div>
              <div>• Tanggal: {new Date().toLocaleDateString('id-ID')}</div>
              <div>• Jam: {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-green-50/80 border border-green-200 rounded-xl p-4 text-xs space-y-1.5">
            <h3 className="font-extrabold text-green-800 text-xs uppercase tracking-wider mb-2">Langkah Selanjutnya:</h3>
            <div className="text-green-900 space-y-1 font-medium">
              <div>• Tersimpan di database HSE</div>
              <div>• Tim Admin menerima notifikasi</div>
              <div>• Laporan siap dicetak PDF</div>
              <div>• Item rusak diteruskan ke tim mekanik</div>
            </div>
          </div>
        </div>

        {/* Terima Kasih Message */}
        <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 font-semibold">
          🙏 Terima kasih, Pak! Inspeksi Anda telah tercatat. Silakan tutup halaman ini atau isi form baru.
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <Link
            to="/operator"
            className="block w-full py-4 bg-[#1E4B8E] hover:bg-[#163A6E] text-white rounded-xl font-bold text-sm sm:text-base shadow-md transition-all text-center"
          >
            Isi Formulir Inspeksi Baru →
          </Link>
        </div>

        {/* Footer Note */}
        <div className="pt-4 border-t border-gray-100 text-[11px] text-gray-400 font-mono">
          Inspeksi ID #{new Date().getTime().toString().slice(-6)} • {new Date().toLocaleString('id-ID')}
        </div>
      </div>
    </div>
  );
};

export default SubmissionSuccess;