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
      setError(result.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 font-sans antialiased text-[#1A1A2E] overflow-hidden">
      {/* Background Foto Gedung PT. BESMINDO (Zoom Out, Jernih) */}
      <div className="absolute inset-0 bg-[#0d2242] pointer-events-none">
        <div
          className="absolute inset-0 bg-cover bg-[center_16%] bg-no-repeat"
          style={{ backgroundImage: "url('/bg-login.jpg')" }}
        />
        {/* Lapisan overlay warna transparan halus (Bukan blur) agar teks & card terbaca tegas */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#091830]/55 via-[#1E4B8E]/30 to-[#091830]/65" />
      </div>

      {/* MAIN LOGIN CARD CONTAINER - Solid White Murni (Tanpa Efek Blur) */}
      <div className="w-full max-w-[460px] relative z-10 my-auto py-6">
        <div className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.35)] border border-[#C8C6C6] p-7 sm:p-9">
          
          {/* Logo & Header PT. Besmindo - ADMIN LOGIN */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-3.5">
              <img
                src="/logo.png"
                alt="BESMINDO Logo"
                className="h-16 w-auto object-contain drop-shadow-sm"
              />
            </div>
            
            <h1 className="text-2xl font-black text-[#1E4B8E] tracking-tight leading-tight">
              PT. BESMINDO
            </h1>
    
            <p className="text-[10px] text-slate-500 font-medium mt-2">
              Portal Administrator HSE & Transport
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl font-medium flex items-center gap-2.5">
              <svg className="w-4 h-4 flex-shrink-0 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Form Login */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div>
              <label className="block text-slate-700 font-bold text-xs mb-1.5">
                Username Akun
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Masukkan username Anda"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F7F6F2] border border-[#C8C6C6] rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#1E4B8E]/25 focus:border-[#1E4B8E] focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-slate-700 font-bold text-xs">
                  Password
                </label>
                <span className="text-[11px] text-slate-400 hover:text-[#1E4B8E] transition-colors cursor-pointer">
                  Lupa password?
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Masukkan password Anda"
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-[#F7F6F2] border border-[#C8C6C6] rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#1E4B8E]/25 focus:border-[#1E4B8E] focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                  aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & SSL Trust */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-[#1E4B8E] border-[#C8C6C6] rounded focus:ring-[#1E4B8E]/30 cursor-pointer"
                />
                <span className="text-xs font-semibold text-slate-600">Ingat Saya</span>
              </label>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                SSL 256-bit
              </span>
            </div>

            {/* Tombol Masuk / Login */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#1E4B8E] hover:bg-[#163A6E] active:bg-[#112D57] text-white rounded-xl font-bold text-sm shadow-md shadow-[#1E4B8E]/25 transition-all duration-200 active:scale-[0.99] disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <span>Masuk / Login</span>
              )}
            </button>
          </form>

          {/* Corporate Footer Signature */}
          <div className="mt-6 pt-4 border-t border-[#C8C6C6]/40 text-center">
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">
              PT. BESMINDO MATERI SEWATAMA
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
