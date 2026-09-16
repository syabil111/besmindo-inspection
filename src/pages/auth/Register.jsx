import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validasi
    if (!formData.name || !formData.username || !formData.password) {
      setError('Nama, username, dan password wajib diisi.');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok.');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password minimal 6 karakter.');
      setLoading(false);
      return;
    }

    const result = await register({
      name: formData.name,
      username: formData.username,
      password: formData.password,
      phone: formData.phone || null,
    });

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4 font-sans antialiased text-[#1A1A2E] overflow-hidden">
        <div className="absolute inset-0 bg-[#0d2242] pointer-events-none">
          <div
            className="absolute inset-0 bg-cover bg-[center_16%] bg-no-repeat"
            style={{ backgroundImage: "url('/bg-login.jpg')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#091830]/55 via-[#1E4B8E]/30 to-[#091830]/65" />
        </div>
        <div className="w-full max-w-md relative z-10">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center border border-[#C8C6C6]">
            <div className="mb-4">
              <div className="mx-auto w-16 h-16 bg-[#F0E5CF] border border-[#C8C6C6] rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-[#1E4B8E]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-black text-[#1E4B8E] mb-2">Pendaftaran Berhasil!</h2>
            <p className="text-slate-600 mb-4 text-sm">
              Akun operator Anda telah terdaftar dan menunggu persetujuan admin HSE.
            </p>
            <p className="text-xs text-slate-500 font-medium">
              Mengalihkan ke halaman login dalam 3 detik...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 font-sans antialiased text-[#1A1A2E] overflow-hidden">
      <div className="absolute inset-0 bg-[#0d2242] pointer-events-none">
        <div
          className="absolute inset-0 bg-cover bg-[center_16%] bg-no-repeat"
          style={{ backgroundImage: "url('/bg-login.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#091830]/55 via-[#1E4B8E]/30 to-[#091830]/65" />
      </div>

      <div className="w-full max-w-[460px] relative z-10 my-auto py-6">
        <div className="bg-white rounded-2xl shadow-2xl p-7 sm:p-8 border border-[#C8C6C6]">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-3">
              <img src="/logo.png" alt="BESMINDO Logo" className="h-14 w-auto object-contain drop-shadow-sm" />
            </div>
            <h1 className="text-2xl font-black text-[#1E4B8E] tracking-tight">Daftar Operator</h1>
            <div className="inline-flex items-center mt-1 px-3 py-0.5 bg-[#F0E5CF]/80 border border-[#C8C6C6]/60 rounded-full">
              <p className="text-[10px] text-[#1E4B8E] font-bold uppercase tracking-wider">
                PT. BESMINDO MATERIL ENJINIRING
              </p>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-medium flex items-center gap-2">
              <svg className="w-4 h-4 text-red-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label htmlFor="name" className="block text-slate-700 font-bold text-xs mb-1">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-[#F7F6F2] border border-[#C8C6C6] rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#1E4B8E]/25 focus:border-[#1E4B8E] focus:outline-none transition-all"
                placeholder="Masukkan nama lengkap Anda"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-slate-700 font-bold text-xs mb-1">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-[#F7F6F2] border border-[#C8C6C6] rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#1E4B8E]/25 focus:border-[#1E4B8E] focus:outline-none transition-all"
                placeholder="Pilih username"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-slate-700 font-bold text-xs mb-1">
                No. Handphone (Opsional)
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-[#F7F6F2] border border-[#C8C6C6] rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#1E4B8E]/25 focus:border-[#1E4B8E] focus:outline-none transition-all"
                placeholder="08xxxxxxxxxx"
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="password" className="block text-slate-700 font-bold text-xs mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#F7F6F2] border border-[#C8C6C6] rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#1E4B8E]/25 focus:border-[#1E4B8E] focus:outline-none transition-all"
                  placeholder="Min 6 karakter"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-slate-700 font-bold text-xs mb-1">
                  Konfirmasi <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#F7F6F2] border border-[#C8C6C6] rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#1E4B8E]/25 focus:border-[#1E4B8E] focus:outline-none transition-all"
                  placeholder="Ulangi password"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#1E4B8E] hover:bg-[#163A6E] active:bg-[#112D57] text-white rounded-xl font-bold text-sm shadow-md shadow-[#1E4B8E]/25 transition-all active:scale-[0.99] disabled:opacity-60 cursor-pointer mt-2"
            >
              {loading ? 'Memproses Pendaftaran...' : 'Daftar Sekarang'}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-5 text-center text-xs text-slate-600">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-[#1E4B8E] hover:underline font-bold">
              Login Disini
            </Link>
          </div>

          {/* Info Box */}
          <div className="mt-5 p-3 bg-[#F0E5CF]/60 border border-[#C8C6C6] rounded-xl text-xs text-slate-700">
            <p className="font-semibold text-[#1E4B8E] mb-0.5">Catatan Penting:</p>
            <p className="text-[11px] leading-relaxed">
              Setelah mendaftar, akun operator akan diverifikasi &amp; disetujui oleh Admin HSE sebelum dapat digunakan untuk inspeksi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
