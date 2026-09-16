import { Outlet } from 'react-router-dom';

// ============================================================================
// OPERATOR LAYOUT — SIMPLE (TANPA LOGIN)
// Layout sederhana untuk bapak-bapak operator gaptek.
// Hanya header PT. BESMINDO + konten form. Tanpa navigasi/sidebar/bottom nav.
// Alur linear: SelectForm → FillForm → Success
// ============================================================================

const OperatorLayout = () => {
  return (
    <div className="min-h-screen bg-[#F7F6F2] flex flex-col font-sans text-[#1A1A2E] antialiased w-full relative">
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

      {/* Custom styles for animations */}
      <style jsx>{`
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
      <main className="flex-1 w-full max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-8 sm:pb-10">
        <Outlet />
      </main>

      {/* Footer Sederhana */}
      <footer className="bg-white border-t border-gray-200 py-3 text-center">
        <p className="text-[10px] sm:text-xs text-gray-400 font-medium">
          © {new Date().getFullYear()} PT. BESMINDO — Sistem Inspeksi Armada Digital v2.0
        </p>
      </footer>
    </div>
  );
};

export default OperatorLayout;