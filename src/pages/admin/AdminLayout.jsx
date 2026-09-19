import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { adminAPI } from '../../services/api';
import {
  DashboardIcon,
  InspectionIcon,
  VehicleIcon,
  FormChecklistIcon,
  UsersIcon,
  ReportIcon,
  SettingsIcon,
  LogoutIcon,
  BellIcon,
  WrenchIcon
} from '../../components/Icons';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showMasterDataMenu, setShowMasterDataMenu] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('notif_sound') !== 'off');
  const [flashNotif, setFlashNotif] = useState(null);
  const knownIdsRef = useRef(new Set());
  const firstLoadRef = useRef(true);
  const audioRef = useRef(null);
  const soundRef = useRef(soundEnabled);
  soundRef.current = soundEnabled;
  const pendingSoundRef = useRef(false);

  // Buka kunci AudioContext saat ada interaksi pertama (syarat autoplay Chrome).
  // Kalau ada bunyi yang tertunda, langsung mainkan saat user berinteraksi.
  const unlockAudio = () => {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      if (!audioRef.current) audioRef.current = new Ctx();
      if (audioRef.current.state === 'suspended') audioRef.current.resume();
      if (pendingSoundRef.current && audioRef.current.state === 'running') {
        pendingSoundRef.current = false;
        playNotifSound();
      }
    } catch (e) { /* abaikan */ }
  };

  useEffect(() => {
    const handler = () => unlockAudio();
    window.addEventListener('pointerdown', handler);
    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('pointerdown', handler);
      window.removeEventListener('keydown', handler);
    };
  }, []);

  // Bunyi notifikasi via Web Audio (tanpa file eksternal)
  const playNotifSound = async () => {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      if (!audioRef.current) audioRef.current = new Ctx();
      const ctx = audioRef.current;
      if (ctx.state === 'suspended') {
        try { await ctx.resume(); } catch (e) { /* abaikan */ }
      }
      if (ctx.state !== 'running') {
        // Audio masih dikunci browser -> antrekan, mainkan saat user klik
        pendingSoundRef.current = true;
        return;
      }
      const now = ctx.currentTime;
      // Nada dering ganda: ding-ding (880Hz -> 1046Hz)
      [[880, 0], [1046, 0.22]].forEach(([freq, delay]) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.5, now + delay + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.5);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + 0.55);
      });
    } catch (e) {
      console.warn('Tidak bisa memutar suara notif:', e);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await adminAPI.getNotifications();
      const notifs = response.data.data || [];
      const unread = notifs.filter(n => !n.is_read);

      // Deteksi notif BARU (bukan saat load pertama) -> bunyikan + flash
      if (!firstLoadRef.current && soundRef.current) {
        const fresh = unread.filter(n => !knownIdsRef.current.has(String(n.id)));
        if (fresh.length > 0) {
          playNotifSound();
          setFlashNotif(fresh[0]);
          setTimeout(() => setFlashNotif(null), 8000);
        }
      }
      firstLoadRef.current = false;
      knownIdsRef.current = new Set(notifs.map(n => String(n.id)));

      setNotifications(notifs);
      setUnreadCount(unread.length);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem('notif_sound', next ? 'on' : 'off');
    if (next) playNotifSound(); // test bunyi saat diaktifkan
  };

  const handleMarkAllRead = async () => {
    try {
      await adminAPI.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark notifications read:', error);
    }
  };

  const handleLogout = () => {
    setShowUserMenu(false);
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: DashboardIcon },
    { path: '/admin/inspections', label: 'Semua Inspeksi', icon: InspectionIcon },
    { path: '/admin/repair-tracking', label: 'Tracking Perbaikan', icon: WrenchIcon },
    { path: '/admin/form-types', label: 'Master Formulir', icon: FormChecklistIcon },
    { path: '/admin/vehicles', label: 'Master Kendaraan', icon: VehicleIcon },
    { path: '/admin/forms', label: 'Kelola Ceklist', icon: FormChecklistIcon },
    { 
      label: 'Master Data', 
      icon: UsersIcon, 
      isDropdown: true,
      children: [
        { path: '/admin/master-data/vehicle-models', label: 'Model Kendaraan' },
        { path: '/admin/master-data/departments', label: 'Departemen' },
        { path: '/admin/master-data/work-locations', label: 'Lokasi Kerja' },
        { path: '/admin/master-data/asset-statuses', label: 'Status Asset' },
      ]
    },
    { path: '/admin/reports', label: 'Rekap & Cetak', icon: ReportIcon },
    { path: '/admin/settings', label: 'Pengaturan', icon: SettingsIcon },
  ];

  const getBreadcrumb = () => {
    const p = location.pathname;
    if (p.includes('/admin/dashboard')) return 'Dashboard Utama';
    if (p.includes('/admin/inspections/')) return 'Detail Formulir Inspeksi';
    if (p.includes('/admin/inspections')) return 'Data Semua Inspeksi';
    if (p.includes('/admin/repair-tracking')) return 'Tracking Perbaikan Item Rusak';
    if (p.includes('/admin/vehicles')) return 'Master Data Kendaraan';
    if (p.includes('/admin/form-types')) return 'Master Jenis Formulir';
    if (p.includes('/admin/forms/')) return 'Pengaturan Item Formulir';
    if (p.includes('/admin/forms')) return 'Kelola Jenis Formulir & Checklist';
    if (p.includes('/admin/master-data/vehicle-models')) return 'Master Data - Model Kendaraan';
    if (p.includes('/admin/master-data/departments')) return 'Master Data - Departemen';
    if (p.includes('/admin/master-data/work-locations')) return 'Master Data - Lokasi Kerja';
    if (p.includes('/admin/master-data/asset-statuses')) return 'Master Data - Status Asset';
    if (p.includes('/admin/reports')) return 'Laporan, Rekap & Cetak Hardfile';
    if (p.includes('/admin/settings')) return 'Pengaturan Akun Admin';
    return 'Admin Panel';
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] dark:bg-gray-950 flex font-sans antialiased text-[#1A1A2E] dark:text-gray-100 transition-colors duration-200">
      {/* Sidebar (248px fixed) - Styled like Dribbble Task Management Dashboard */}
      <aside className="w-[248px] bg-white dark:bg-gray-900 flex-shrink-0 fixed h-full flex flex-col z-20 border-r border-slate-200/80 dark:border-gray-800 transition-colors duration-200 shadow-xs">
        {/* Brand / Logo */}
        <div className="px-5 py-4 flex items-center space-x-3 border-b border-slate-100/80 dark:border-gray-800">
          <div className="w-11 h-11 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center p-1.5 shadow-md shadow-blue-950/10 border border-slate-200/80 dark:border-gray-700 flex-shrink-0">
            <img src="/logo-besmindo.png" alt="PT BESMINDO MATERI SEWATAMA" className="w-full h-full object-contain" />
          </div>
          <div className="min-w-0">
            <h1 className="text-[11px] font-extrabold tracking-tight text-[#162F5C] dark:text-white leading-tight">PT BESMINDO</h1>
            <p className="text-[9.5px] text-slate-400 dark:text-gray-500 font-semibold tracking-tight leading-tight">MATERI SEWATAMA</p>
            <p className="text-[8.5px] text-slate-300 dark:text-gray-600 font-medium mt-0.5 leading-tight">Inspection Portal</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
          {/* Section: MENU */}
          <div>
            <div className="px-3 pb-2 text-[10px] font-bold tracking-wider text-slate-400 dark:text-gray-500 uppercase">
              Menu
            </div>
            <nav className="space-y-1">
              {menuItems.map((item, index) => {
                if (item.isDropdown) {
                  const isAnyChildActive = item.children.some(child => location.pathname === child.path);
                  const isOpen = showMasterDataMenu || isAnyChildActive;
                  const Icon = item.icon;

                  return (
                    <div key={index} className="relative">
                      {isAnyChildActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#1E4B8E] rounded-r-full" />
                      )}
                      <button
                        onClick={() => setShowMasterDataMenu(!showMasterDataMenu)}
                        className={`flex items-center justify-between w-full px-3.5 py-2.5 rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer ${
                          isAnyChildActive
                            ? 'bg-[#1E4B8E]/10 text-[#1E4B8E] dark:bg-blue-900/30 dark:text-blue-300'
                            : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100/80 dark:hover:bg-gray-800/80 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className={`w-4 h-4 ${isAnyChildActive ? 'text-[#1E4B8E] dark:text-blue-400' : 'text-slate-400 dark:text-gray-500'}`} />
                          <span>{item.label}</span>
                        </div>
                        <svg
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {isOpen && (
                        <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-200 dark:border-gray-800 pl-2">
                          {item.children.map((child) => {
                            const isChildActive = location.pathname === child.path;
                            return (
                              <NavLink
                                key={child.path}
                                to={child.path}
                                className={`block px-3 py-1.5 rounded-full text-[11px] font-medium transition-all duration-150 ${
                                  isChildActive
                                    ? 'bg-[#1E4B8E] text-white font-bold shadow-xs'
                                    : 'text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800 hover:text-slate-900 dark:hover:text-white'
                                }`}
                              >
                                {child.label}
                              </NavLink>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                const Icon = item.icon;
                const isActive = location.pathname === item.path ||
                  (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path));

                return (
                  <div key={item.path} className="relative">
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#1E4B8E] rounded-r-full" />
                    )}
                    <NavLink
                      to={item.path}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-full text-xs font-semibold transition-all duration-150 ${
                        isActive
                          ? 'bg-[#1E4B8E]/10 text-[#1E4B8E] dark:bg-blue-900/30 dark:text-blue-300'
                          : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100/80 dark:hover:bg-gray-800/80 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-[#1E4B8E] dark:text-blue-400' : 'text-slate-400 dark:text-gray-500'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.path === '/admin/inspections' && unreadCount > 0 && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#1E4B8E] text-white">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </NavLink>
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Section: GENERAL */}
          <div>
            <div className="px-3 pb-2 text-[10px] font-bold tracking-wider text-slate-400 dark:text-gray-500 uppercase">
              General
            </div>
            <nav className="space-y-1">
              <NavLink
                to="/admin/settings"
                className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-full text-xs font-semibold transition-all duration-150 ${
                  location.pathname === '/admin/settings'
                    ? 'bg-[#1E4B8E]/10 text-[#1E4B8E] dark:bg-blue-900/30 dark:text-blue-300'
                    : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100/80 dark:hover:bg-gray-800/80 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <SettingsIcon className="w-4 h-4 text-slate-400 dark:text-gray-500" />
                <span>Pengaturan</span>
              </NavLink>

              {/* Theme Toggle in Menu */}
              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center justify-between w-full px-3.5 py-2.5 rounded-full text-xs font-semibold text-slate-600 dark:text-gray-400 hover:bg-slate-100/80 dark:hover:bg-gray-800/80 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  {isDark ? (
                    <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  )}
                  <span>{isDark ? 'Mode Terang' : 'Mode Gelap'}</span>
                </div>
                <div className={`w-8 h-4 rounded-full relative transition-all duration-200 ${isDark ? 'bg-[#1E4B8E]' : 'bg-slate-300'}`}>
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-xs transition-transform duration-200 ${isDark ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </div>
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 px-3.5 py-2.5 rounded-full text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all w-full cursor-pointer"
              >
                <LogoutIcon className="w-4 h-4 text-red-500" />
                <span>Logout</span>
              </button>
            </nav>
          </div>
        </div>


      </aside>

      {/* Main Content Area */}
      <div className="flex-1 ml-[248px] flex flex-col min-w-0 transition-colors duration-200">
        {/* Topbar Navigation - Dribbble Pill Search & Actions Bar */}
        <header className="sticky top-0 z-30 bg-[#F4F5F7]/80 dark:bg-gray-950/80 backdrop-blur-md px-8 py-4 flex items-center justify-between gap-4 transition-colors duration-200">
          {/* Left: Pill Search Bar */}
          <div className="flex-1 max-w-md">
            <div className="relative flex items-center">
              <span className="absolute left-4 text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Cari inspeksi, unit armada, formulir..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    navigate(`/admin/inspections?search=${encodeURIComponent(e.target.value.trim())}`);
                  }
                }}
                className="w-full pl-10 pr-14 py-2.5 bg-white dark:bg-gray-900 border border-slate-200/80 dark:border-gray-800 rounded-full text-xs text-slate-700 dark:text-gray-200 shadow-xs focus:outline-none focus:border-[#1E4B8E] dark:focus:border-blue-500 transition-all placeholder-slate-400"
              />
              <span className="absolute right-3 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-gray-800 text-[10px] font-mono text-slate-400 font-semibold border border-slate-200/60 dark:border-gray-700">
                ⌘ F
              </span>
            </div>
          </div>

          {/* Right: Sound, Notifications, and Profile Pill */}
          <div className="flex items-center space-x-3">
            {/* Tombol suara notifikasi (Circular) */}
            <button
              onClick={toggleSound}
              title={soundEnabled ? 'Matikan suara notifikasi' : 'Nyalakan suara notifikasi'}
              className={`w-10 h-10 flex items-center justify-center rounded-full border transition-all duration-200 cursor-pointer shadow-xs ${
                soundEnabled
                  ? 'text-[#1E4B8E] dark:text-blue-400 bg-white dark:bg-gray-900 border-slate-200/80 dark:border-gray-800 hover:bg-[#1E4B8E]/5'
                  : 'text-slate-400 bg-white dark:bg-gray-900 border-slate-200/80 dark:border-gray-800 hover:text-slate-600'
              }`}
            >
              {soundEnabled ? (
                <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              ) : (
                <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              )}
            </button>

            {/* Notification Bell (Circular) */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowUserMenu(false);
                }}
                className={`w-10 h-10 flex items-center justify-center rounded-full border transition-all duration-200 cursor-pointer shadow-xs ${
                  showNotifications
                    ? 'bg-[#1E4B8E] text-white border-[#1E4B8E] shadow-md shadow-[#1E4B8E]/20'
                    : 'text-slate-600 dark:text-gray-300 bg-white dark:bg-gray-900 border-slate-200/80 dark:border-gray-800 hover:text-[#1E4B8E]'
                }`}
                title="Notifikasi"
              >
                <BellIcon className="w-[17px] h-[17px]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-xs ring-2 ring-white dark:ring-gray-900">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-[350px] bg-white dark:bg-gray-900 rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-slate-200/80 dark:border-gray-800 max-h-96 overflow-hidden z-40 animate-[fadeSlideIn_0.18s_ease-out]">
                  <div className="p-4 border-b border-slate-100 dark:border-gray-800 flex items-center justify-between bg-[#162F5C] text-white">
                    <h3 className="font-bold text-xs">
                      Notifikasi {unreadCount > 0 && <span className="ml-1 px-2 py-0.5 rounded-full bg-white/20 text-[10px]">{unreadCount} Baru</span>}
                    </h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] text-[#F0E5CF] hover:underline font-semibold cursor-pointer"
                      >
                        Tandai Dibaca
                      </button>
                    )}
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-gray-800 max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 dark:bg-gray-800 flex items-center justify-center mb-2">
                          <BellIcon className="w-4 h-4 text-slate-400" />
                        </div>
                        <p className="text-slate-400 text-xs font-medium">Tidak ada notifikasi saat ini</p>
                      </div>
                    ) : (
                      notifications.slice(0, 15).map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-3.5 text-xs hover:bg-slate-50 dark:hover:bg-gray-800/60 cursor-pointer transition-colors border-l-4 ${
                            !notif.is_read ? 'bg-blue-50/40 dark:bg-blue-900/10 border-l-[#1E4B8E]' : 'border-l-transparent'
                          }`}
                          onClick={async () => {
                            await adminAPI.markAsRead(notif.id);
                            loadNotifications();
                            setShowNotifications(false);
                            if (notif.related_inspection_id) {
                              navigate(`/admin/inspections/${notif.related_inspection_id}`);
                            } else if (notif.type === 'new_registration') {
                              navigate('/admin/users');
                            }
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800 dark:text-white">{notif.title}</span>
                            {!notif.is_read && (
                              <span className="w-2 h-2 rounded-full bg-[#1E4B8E]"></span>
                            )}
                          </div>
                          <p className="text-slate-500 dark:text-gray-400 mt-1 leading-relaxed">{notif.message}</p>
                          <p className="text-[10px] text-slate-400 mt-1 font-mono">
                            {new Date(notif.created_at).toLocaleString('id-ID')}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Flash notification banner */}
            {flashNotif && (
              <div
                onClick={() => {
                  setShowNotifications(true);
                  setFlashNotif(null);
                  if (flashNotif.related_inspection_id) navigate(`/admin/inspections/${flashNotif.related_inspection_id}`);
                }}
                className="fixed top-20 right-8 z-50 w-[340px] bg-white dark:bg-gray-900 rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.2)] border border-slate-200 dark:border-gray-800 p-4 cursor-pointer animate-[fadeSlideIn_0.25s_ease-out]"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-[#162F5C] flex items-center justify-center flex-shrink-0 animate-bounce">
                    <BellIcon className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{flashNotif.title}</p>
                    <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5 line-clamp-2">{flashNotif.message}</p>
                    <p className="text-[10px] text-[#1E4B8E] font-bold mt-1">Klik untuk lihat detail →</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setFlashNotif(null); }} className="text-slate-300 hover:text-slate-500 text-lg leading-none">×</button>
                </div>
              </div>
            )}

            {/* User Profile Pill (Exact Dribbble Style) */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowNotifications(false);
                }}
                className={`flex items-center gap-3 p-1.5 pr-3 rounded-full bg-white dark:bg-gray-900 border border-slate-200/80 dark:border-gray-800 shadow-xs hover:border-[#1E4B8E]/40 transition-all cursor-pointer ${
                  showUserMenu ? 'ring-2 ring-[#1E4B8E]/20' : ''
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#162F5C] to-[#1E4B8E] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-slate-800 dark:text-white leading-tight">
                    {user?.name || 'Administrator'}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    {user?.username ? `@${user.username}` : 'admin@besmindo.com'}
                  </div>
                </div>
                <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-gray-900 rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-slate-200/80 dark:border-gray-800 py-2 z-40 text-xs overflow-hidden animate-[fadeSlideIn_0.18s_ease-out]">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-gray-800">
                    <p className="font-bold text-slate-800 dark:text-white text-xs">{user?.name}</p>
                    <p className="text-slate-400 font-mono text-[10px]">@{user?.username}</p>
                  </div>
                  <NavLink
                    to="/admin/settings"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2.5 mx-2 mt-1 px-3 py-2 rounded-full text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 font-semibold transition-colors"
                  >
                    <SettingsIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span>Pengaturan Akun</span>
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 mx-2 my-1 w-[calc(100%-16px)] text-left px-3 py-2 rounded-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 font-semibold cursor-pointer transition-colors"
                  >
                    <LogoutIcon className="w-3.5 h-3.5" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Main Content with smooth padding */}
        <main className="px-8 pb-10 flex-1">
          <Outlet />
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-[fadeSlideIn_0.18s_ease-out]"
          onClick={() => setShowLogoutModal(false)}
        >
          <div
            className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-gray-800 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center mb-4">
                <LogoutIcon className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Konfirmasi Logout</h3>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-2">
                Apakah Anda yakin ingin mengakhiri sesi Administrator <strong className="text-[#162F5C] dark:text-blue-400">PT. BESMINDO</strong>?
              </p>
              <div className="flex items-center justify-center gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowLogoutModal(false)}
                  className="px-5 py-2.5 rounded-full border border-slate-200 dark:border-gray-700 text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800 font-bold text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={confirmLogout}
                  className="px-6 py-2.5 rounded-full bg-[#162F5C] hover:bg-[#1E4B8E] text-white font-bold text-xs cursor-pointer shadow-xs"
                >
                  Ya, Keluar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes fadeSlideIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
};

export default AdminLayout;




