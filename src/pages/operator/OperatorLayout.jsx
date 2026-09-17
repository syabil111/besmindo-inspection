import { Outlet } from 'react-router-dom';

// ============================================================================
// OPERATOR LAYOUT — SIMPLE (TANPA LOGIN)
// Layout sederhana untuk bapak-bapak operator gaptek.
// Hanya header PT. BESMINDO + konten form. Tanpa navigasi/sidebar/bottom nav.
// Alur linear: SelectForm → FillForm → Success
// ============================================================================

// Reusable SVG Curve Components
const HeaderBottomWave = () => (
  <div className="curve-separator" style={{ marginTop: '-1px' }}>
    <svg viewBox="0 0 1440 80" preserveAspectRatio="none" style={{ height: '40px' }}>
      <defs>
        <linearGradient id="headerWaveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1E4B8E" />
          <stop offset="50%" stopColor="#2A5BAD" />
          <stop offset="100%" stopColor="#1E3A6E" />
        </linearGradient>
      </defs>
      <path
        fill="url(#headerWaveGrad)"
        d="M0,0 L0,40 Q180,80 360,50 T720,55 T1080,45 T1440,60 L1440,0 Z"
      />
      <path
        fill="url(#headerWaveGrad)"
        opacity="0.4"
        d="M0,0 L0,30 Q240,65 480,40 T960,50 T1440,35 L1440,0 Z"
        className="animate-wave-shimmer"
      />
    </svg>
  </div>
);

const FooterTopWave = () => (
  <div className="curve-separator" style={{ marginBottom: '-1px' }}>
    <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style={{ height: '30px' }}>
      <defs>
        <linearGradient id="footerWaveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      <path
        fill="url(#footerWaveGrad)"
        d="M0,60 L0,20 Q360,0 720,25 T1440,15 L1440,60 Z"
      />
      <path
        fill="#ffffff"
        opacity="0.5"
        d="M0,60 L0,35 Q280,10 560,30 T1120,20 T1440,30 L1440,60 Z"
      />
    </svg>
  </div>
);

// Decorative floating orbs for background
const FloatingOrbs = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
    <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-gradient-to-br from-[#1E4B8E]/[0.03] to-[#2A5BAD]/[0.05] blur-3xl animate-wave-float" />
    <div className="absolute top-1/3 -left-20 w-48 h-48 rounded-full bg-gradient-to-tr from-[#C9A227]/[0.03] to-[#F0E5CF]/[0.05] blur-3xl animate-wave-float" style={{ animationDelay: '2s' }} />
    <div className="absolute -bottom-20 right-1/4 w-56 h-56 rounded-full bg-gradient-to-tl from-[#1E4B8E]/[0.02] to-[#2A5BAD]/[0.04] blur-3xl animate-wave-float" style={{ animationDelay: '4s' }} />
  </div>
);

const OperatorLayout = () => {
  return (
    <div className="min-h-screen bg-[#F7F6F2] flex flex-col font-sans text-[#1A1A2E] antialiased w-full relative">
      <FloatingOrbs />
      
      {/* Premium Header — Desktop & Mobile */}
      <header className="relative sticky top-0 z-30">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1E4B8E] via-[#2A5BAD] to-[#1E3A6E] overflow-hidden">
          {/* Subtle animated mesh gradients */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/20 blur-3xl animate-pulse-slow" />
            <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-blue-300/20 blur-3xl animate-pulse-slow delay-1000" />
          </div>
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          
          {/* Decorative curve line inside header */}
          <svg className="absolute bottom-0 left-0 w-full opacity-[0.07]" viewBox="0 0 1440 40" preserveAspectRatio="none" style={{ height: '40px' }}>
            <path d="M0,40 Q360,0 720,20 T1440,10" fill="none" stroke="white" strokeWidth="2" />
            <path d="M0,30 Q480,5 960,25 T1440,15" fill="none" stroke="white" strokeWidth="1.5" className="animate-wave-shimmer" />
          </svg>
        </div>

        {/* Glassmorphism overlay */}
        <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />

        {/* Header content */}
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14 sm:h-16">
          {/* Logo & Company Title */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Animated logo container */}
            <div className="relative group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 border border-white/30 flex items-center justify-center shadow-xl shadow-blue-900/20 transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-blue-900/30">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <img
                  src="/logo.png"
                  alt="BESMINDO"
                  className="w-6 h-6 sm:w-7 sm:h-7 object-contain relative z-10 drop-shadow-lg"
                />
              </div>
              {/* Subtle orbit ring on hover */}
              <div className="absolute -inset-1 rounded-2xl border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-spin-slow" />
            </div>

            <div className="min-w-0">
              <h1 className="text-sm sm:text-base lg:text-lg font-black tracking-tight leading-none text-white drop-shadow-lg">
                PT. BESMINDO
              </h1>
              <span className="text-[9px] sm:text-[10px] lg:text-xs text-blue-100 font-semibold uppercase tracking-widest block mt-1 opacity-90 drop-shadow-sm">
                Form Inspeksi Armada Digital
              </span>
            </div>
          </div>

          {/* Badge Keterangan — Premium */}
          <div className="hidden sm:flex items-center space-x-2">
            <span className="relative px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-xs text-blue-50 font-semibold whitespace-nowrap shadow-lg shadow-blue-900/10 transition-all duration-300 hover:bg-white/15 hover:border-white/30 hover:shadow-xl hover:shadow-blue-900/20">
              <span className="relative flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span>Sistem HSE & Transport</span>
              </span>
            </span>
          </div>
        </div>

        {/* Bottom subtle glow line */}
        <div className="absolute bottom-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </header>

      {/* Elegant Curve below Header */}
      <HeaderBottomWave />

      {/* Custom styles for animations */}
      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.2; transform: scale(1.05); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
        .delay-1000 { animation-delay: 1s; }
      `}</style>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-8 sm:pb-10 relative z-10">
        <Outlet />
      </main>

      {/* Elegant Curve above Footer */}
      <FooterTopWave />

      {/* Footer Sederhana */}
      <footer className="bg-white border-t border-gray-100 py-3 text-center relative">
        {/* Decorative accent dot */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-1 rounded-full bg-gradient-to-r from-[#1E4B8E] to-[#C9A227] opacity-40" />
        <p className="text-[10px] sm:text-xs text-gray-400 font-medium">
          © {new Date().getFullYear()} PT. BESMINDO — Sistem Inspeksi Armada Digital v2.0
        </p>
      </footer>
    </div>
  );
};

export default OperatorLayout;