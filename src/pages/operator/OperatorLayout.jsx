import { Outlet, Link } from 'react-router-dom';

// ============================================================================
// OPERATOR LAYOUT — SEDERHANA & BERSIH
// Layout bersih dan mudah dipahami untuk operator lapangan.
// Header sederhana PT. BESMINDO + Konten Formulir + Footer.
// ============================================================================

const OperatorLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased">
      {/* Top Navbar Sederhana — Warna Senada Sidebar Admin (#162F5C) dengan Garis Aksen Rapi */}
      <header className="bg-[#162F5C] text-white shadow-md sticky top-0 z-30 border-b border-[#C8C6C6]/20 relative">
        {/* Garis Aksen Emas/Biru Khas Besmindo di Bawah Header */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-400 via-amber-400/80 to-blue-400" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Logo & Title */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-95 transition">
            <div className="w-10 h-10 bg-white rounded-lg p-1.5 flex items-center justify-center shadow-sm shrink-0">
              <img
                src="/logo.png"
                alt="BESMINDO"
                className="h-full w-auto object-contain"
              />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold leading-tight tracking-wide">
                PT. BESMINDO
              </h1>
              <p className="text-[11px] text-blue-100 font-medium">
                Formulir Inspeksi Lapangan
              </p>
            </div>
          </Link>

          {/* Quick Action / Admin Link */}
          <div className="flex items-center gap-3">

            <Link
              to="/login"
              className="text-xs text-white bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-lg font-semibold transition border border-white/20"
            >
              Login Admin
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Outlet />
      </main>

      {/* Footer Sederhana */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center">
        <p className="text-xs text-slate-500 font-medium">
          © {new Date().getFullYear()} PT. Besmindo Materi Sewatama — Sistem Inspeksi Digital
        </p>
      </footer>
    </div>
  );
};

export default OperatorLayout;