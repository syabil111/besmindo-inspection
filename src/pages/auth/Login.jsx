import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

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

    if (!formData.username || !formData.password) {
      setError('Username dan password wajib diisi.');
      setLoading(false);
      return;
    }

    const result = await login(formData);
    if (!result.success) {
      setError(result.message || 'Username atau password salah.');
      setLoading(false);
    }
  };

  // Quick helper to fill admin credentials
  const fillAdminCredentials = () => {
    setFormData({
      username: 'admin',
      password: 'admin123'
    });
    setError('');
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 font-sans text-slate-800 overflow-hidden">
      {/* Background Foto Gedung PT. BESMINDO Seimbang & User Friendly */}
      <div className="absolute inset-0 bg-[#0d2242] pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-[center_55%] bg-no-repeat transition-all duration-300"
          style={{ 
            backgroundImage: "url('/bg-login.jpg')",
            filter: "contrast(105%) brightness(96%) saturate(104%)"
          }}
        />
        {/* Overlay lembut proporsional agar foto tampak jelas dan teks login mudah dibaca */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/25 to-black/45" />
      </div>

      <div className="w-full max-w-md relative z-10 my-auto">
        {/* Card Login Sederhana & Bersih */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">

          {/* Header Sederhana — Warna Senada Sidebar Admin & Header Operator (#162F5C) */}
          <div className="bg-[#162F5C] text-white p-6 sm:p-7 text-center relative">
            {/* Garis Aksen Emas/Biru Khas Besmindo di Bawah Header Card */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-400 via-amber-400/80 to-blue-400" />
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-xl shadow p-2 mb-3">
              <img
                src="/logo-besmindo.png"
                alt="PT BESMINDO MATERI SEWATAMA"
                className="h-full w-auto object-contain"
              />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              PT. BESMINDO
            </h1>
            <p className="text-xs text-blue-200 mt-0.5 font-semibold tracking-wide uppercase">
              MATERI SEWATAMA
            </p>
          </div>

          {/* Form Login */}
          <div className="p-6 sm:p-7 space-y-5">
            <div className="text-center">
              <h2 className="text-base font-semibold text-slate-800">Login Administrator</h2>
              <p className="text-xs text-slate-500 mt-0.5">Silakan masukkan akun Anda untuk mengelola sistem</p>
            </div>

            {/* Pesan Error */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" />
                  <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Masukkan username"
                    required
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#162F5C]/30 focus:border-[#162F5C] focus:outline-none transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Masukkan password"
                    required
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#162F5C]/30 focus:border-[#162F5C] focus:outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                    aria-label="Lihat password"
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Ingat Saya & Quick Auto-fill Demo */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 text-[#162F5C] border-slate-300 rounded focus:ring-[#162F5C]"
                  />
                  <span className="text-slate-600">Ingat saya</span>
                </label>

                <button
                  type="button"
                  onClick={fillAdminCredentials}
                  className="text-xs text-[#162F5C] hover:underline font-semibold cursor-pointer"
                >
                  Isi Akun Demo
                </button>
              </div>

              {/* Tombol Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#162F5C] hover:bg-[#112447] active:bg-[#0c1a33] text-white rounded-lg font-semibold text-sm shadow transition duration-150 disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Memproses...</span>
                  </>
                ) : (
                  <span>Masuk</span>
                )}
              </button>
            </form>

            {/* Quick Link ke Halaman Operator */}
            <div className="pt-3 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500 mb-2">
                Operator Lapangan tidak perlu login:
              </p>
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-[#162F5C] bg-slate-100 hover:bg-slate-200/80 px-3.5 py-2 rounded-lg border border-slate-200 transition"
              >
                <span>Buka Formulir Inspeksi Operator</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Sederhana */}
        <p className="text-center text-[11px] text-blue-200/80 font-medium mt-4">
          © {new Date().getFullYear()} PT. Besmindo Materi Sewatama
        </p>
      </div>
    </div>
  );
};

export default Login;
