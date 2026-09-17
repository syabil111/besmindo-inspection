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
  BellIcon
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
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: DashboardIcon },
    { path: '/admin/inspections', label: 'Semua Inspeksi', icon: InspectionIcon },
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
    <div className="min-h-screen bg-[#F7F6F2] dark:bg-gray-900 flex font-sans antialiased text-[#1A1A2E] dark:text-gray-100 transition-colors duration-200">
      {/* Sidebar (240px fixed) */}
      <aside className="w-[240px] bg-[#162F5C] dark:bg-gray-800 text-white flex-shrink-0 fixed h-full flex flex-col z-20 shadow-lg border-r border-[#C8C6C6]/20 dark:border-gray-700">
        {/* Logo BESMINDO */}
        <div className="p-5 border-b border-white/10 dark:border-gray-700 flex items-center space-x-3 relative overflow-hidden">
          {/* Subtle curved background shine */}
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/5 blur-xl pointer-events-none" />
          
          <div className="w-10 h-10 rounded-xl bg-white/15 dark:bg-gray-700 flex items-center justify-center p-1.5 border border-white/20 dark:border-gray-600 shadow-md">
            <img src="/logo.png" alt="BESMINDO" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-wider text-white">BESMINDO</h1>
            <p className="text-[11px] text-[#F0E5CF] dark:text-gray-400 tracking-tight font-medium">Materi Sewatama</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1.5 flex-1 overflow-y-auto">
          <div className="px-3 py-2 text-[10px] font-bold tracking-wider text-[#C8C6C6] dark:text-gray-400 uppercase">
            Menu Utama
          </div>
          {menuItems.map((item, index) => {
            if (item.isDropdown) {
              const isAnyChildActive = item.children.some(child => location.pathname === child.path);
              const isOpen = showMasterDataMenu || isAnyChildActive;
              const Icon = item.icon;
              
              return (
                <div key={index}>
                  <button
                    onClick={() => setShowMasterDataMenu(!showMasterDataMenu)}
                    className={`flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${
                      isAnyChildActive
                        ? 'bg-gradient-to-r from-[#1E4B8E] to-[#255DB0] text-white font-semibold shadow-md shadow-blue-950/30'
                        : 'text-[#C8C6C6] dark:text-gray-300 hover:bg-white/10 dark:hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-4 h-4 ${isAnyChildActive ? 'text-white' : 'text-[#C8C6C6] dark:text-gray-300'}`} />
                      <span>{item.label}</span>
                    </div>
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {isOpen && (
                    <div className="ml-4 mt-1.5 space-y-1 border-l-2 border-white/15 dark:border-gray-700 pl-2.5">
                      {item.children.map((child) => {
                        const isChildActive = location.pathname === child.path;
                        return (
                          <NavLink
                            key={child.path}
                            to={child.path}
                            className={`block px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                              isChildActive
                                ? 'bg-white/15 text-white font-bold'
                                : 'text-[#C8C6C6] dark:text-gray-300 hover:bg-white/5 dark:hover:bg-gray-700 hover:text-white'
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
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#1E4B8E] to-[#255DB0] text-white font-semibold shadow-md shadow-blue-950/30'
                    : 'text-[#C8C6C6] dark:text-gray-300 hover:bg-white/10 dark:hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#C8C6C6] dark:text-gray-300'}`} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Section: Theme Toggle + Logout */}
        <div className="p-3 border-t border-white/10 dark:border-gray-700 space-y-2">
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('🖱️ CLICK! Current theme:', theme);
              toggleTheme();
              console.log('✅ Toggle function called');
            }}
            className="flex items-center justify-between w-full px-3.5 py-2.5 rounded-md text-sm text-[#C8C6C6] dark:text-gray-300 hover:bg-white/10 dark:hover:bg-gray-700 hover:text-white transition-colors cursor-pointer group"
            title={isDark ? 'Klik untuk Light Mode' : 'Klik untuk Dark Mode'}
          >
            <div className="flex items-center space-x-3">
              {isDark ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span className="font-medium">Ke Light Mode ☀️</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                  <span className="font-medium">Ke Dark Mode 🌙</span>
                </>
              )}
            </div>
            <div className={`w-10 h-5 rounded-full relative transition-all duration-200 ${isDark ? 'bg-blue-600' : 'bg-gray-400'}`}>
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${isDark ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-3.5 py-2.5 rounded-md text-sm text-[#C8C6C6] dark:text-gray-300 hover:bg-red-500/15 hover:text-red-300 transition-colors w-full cursor-pointer"
          >
            <LogoutIcon className="w-4 h-4" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 ml-[240px] flex flex-col min-w-0 bg-[#F7F6F2] dark:bg-gray-900 transition-colors duration-200">
        {/* Topbar — Clean & Simple */}
        <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 px-6 py-3.5 shadow-xs transition-colors duration-200">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
                {getBreadcrumb()}
              </h2>
              <p className="text-xs text-slate-500 dark:text-gray-400 capitalize mt-0.5">
                {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Status sistem */}
              <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">System Online</span>
              </div>

              <div className="hidden sm:block w-px h-7 bg-slate-200 dark:bg-gray-700" />

              {/* Tombol suara notifikasi */}
              <button
                onClick={toggleSound}
                title={soundEnabled ? 'Matikan suara notifikasi' : 'Nyalakan suara notifikasi'}
                className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all duration-200 cursor-pointer shadow-sm ${
                  soundEnabled
                    ? 'text-[#1E4B8E] dark:text-blue-300 bg-[#1E4B8E]/8 border-[#1E4B8E]/25 hover:bg-[#1E4B8E]/15'
                    : 'text-slate-400 bg-white dark:bg-gray-700/60 border-[#C8C6C6]/70 dark:border-gray-600 hover:text-slate-600'
                }`}
              >
                {soundEnabled ? (
                  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                ) : (
                  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </svg>
                )}
              </button>

              {/* Toast notifikasi baru (klik -> buka detail) */}
              {flashNotif && (
                <div
                  onClick={() => {
                    setShowNotifications(true);
                    setFlashNotif(null);
                    if (flashNotif.related_inspection_id) navigate(`/admin/inspections/${flashNotif.related_inspection_id}`);
                  }}
                  className="fixed top-20 right-6 z-50 w-[340px] bg-white dark:bg-gray-800 rounded-2xl shadow-[0_20px_60px_-12px_rgba(22,47,92,0.45)] border-l-4 border-l-[#C9A227] border border-[#C8C6C6]/70 dark:border-gray-700 p-4 cursor-pointer animate-[fadeSlideIn_0.25s_ease-out]"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#162F5C] to-[#1E4B8E] flex items-center justify-center flex-shrink-0 animate-bounce">
                      <BellIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-black text-[#1A1A2E] dark:text-white">🔔 {flashNotif.title}</p>
                      <p className="text-xs text-slate-600 dark:text-gray-300 mt-0.5 line-clamp-2">{flashNotif.message}</p>
                      <p className="text-[10px] text-[#1E4B8E] dark:text-blue-300 font-bold mt-1">Klik untuk lihat detail →</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setFlashNotif(null); }} className="text-slate-300 hover:text-slate-500 text-lg leading-none">×</button>
                  </div>
                </div>
              )}

              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowUserMenu(false);
                  }}
                  className={`relative w-10 h-10 flex items-center justify-center rounded-xl border transition-all duration-200 cursor-pointer ${
                    showNotifications
                      ? 'bg-[#1E4B8E] text-white border-[#1E4B8E] shadow-lg shadow-[#1E4B8E]/30'
                      : 'text-slate-500 dark:text-gray-300 hover:text-[#1E4B8E] dark:hover:text-blue-300 bg-white dark:bg-gray-700/60 hover:bg-[#F0E5CF]/40 border-[#C8C6C6]/70 dark:border-gray-600 hover:border-[#1E4B8E]/30 shadow-sm'
                  }`}
                  title="Notifikasi"
                >
                  <BellIcon className="w-[18px] h-[18px]" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 bg-gradient-to-br from-red-500 to-rose-600 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-md shadow-red-500/40 ring-2 ring-white dark:ring-gray-800 animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-[340px] bg-white dark:bg-gray-800 rounded-2xl shadow-[0_20px_60px_-12px_rgba(22,47,92,0.35)] border border-[#C8C6C6]/70 dark:border-gray-700 max-h-96 overflow-hidden z-30 animate-[fadeSlideIn_0.18s_ease-out]">
                    <div className="p-4 border-b border-[#C8C6C6]/50 dark:border-gray-700 flex items-center justify-between bg-gradient-to-r from-[#162F5C] to-[#1E4B8E]">
                      <h3 className="font-bold text-xs text-white tracking-wide">
                        Notifikasi {unreadCount > 0 && <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white/20 text-[10px]">{unreadCount} Baru</span>}
                      </h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[11px] text-[#F0E5CF] hover:text-white hover:underline font-semibold cursor-pointer"
                        >
                          Tandai Dibaca
                        </button>
                      )}
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center">
                          <div className="w-12 h-12 mx-auto rounded-full bg-[#F7F6F2] dark:bg-gray-700 flex items-center justify-center mb-2">
                            <BellIcon className="w-5 h-5 text-slate-300" />
                          </div>
                          <p className="text-slate-400 dark:text-gray-500 text-xs font-medium">Tidak ada notifikasi saat ini</p>
                        </div>
                      ) : (
                        notifications.slice(0, 15).map((notif) => (
                          <div
                            key={notif.id}
                            className={`p-3.5 text-xs hover:bg-[#F7F6F2] dark:hover:bg-gray-700 cursor-pointer transition-colors border-l-[3px] ${
                              !notif.is_read ? 'bg-[#F0E5CF]/30 dark:bg-blue-900/20 border-l-[#C9A227]' : 'border-l-transparent'
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
                              <span className="font-bold text-[#1A1A2E] dark:text-white">{notif.title}</span>
                              {!notif.is_read && (
                                <span className="w-2 h-2 rounded-full bg-[#1E4B8E] dark:bg-blue-400 ring-4 ring-[#1E4B8E]/10"></span>
                              )}
                            </div>
                            <p className="text-slate-600 dark:text-gray-300 mt-1 leading-relaxed">{notif.message}</p>
                            <p className="text-[10px] text-slate-400 dark:text-gray-500 mt-1.5 font-medium">
                              {new Date(notif.created_at).toLocaleString('id-ID')}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile Pill */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowUserMenu(!showUserMenu);
                    setShowNotifications(false);
                  }}
                  className={`flex items-center gap-2.5 pl-1.5 pr-2.5 py-1.5 rounded-2xl transition-all duration-200 border cursor-pointer shadow-sm ${
                    showUserMenu
                      ? 'bg-[#162F5C] border-[#162F5C] shadow-lg shadow-[#162F5C]/25'
                      : 'bg-white dark:bg-gray-800 border-[#C8C6C6]/70 dark:border-gray-600 hover:border-[#1E4B8E]/40 hover:shadow-md'
                  }`}
                >
                  <div className="relative">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1E4B8E] via-[#2a5fa8] to-[#C9A227] text-white flex items-center justify-center font-black text-sm shadow-inner">
                      {user?.name?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-gray-800" />
                  </div>
                  <div className="text-left hidden md:block">
                    <div className={`text-xs font-bold leading-tight ${showUserMenu ? 'text-white' : 'text-[#1A1A2E] dark:text-white'}`}>{user?.name}</div>
                    <div className={`text-[10px] font-semibold tracking-wide ${showUserMenu ? 'text-[#F0E5CF]' : 'text-[#C9A227]'}`}>⬥ HSE ADMINISTRATOR</div>
                  </div>
                  <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${showUserMenu ? 'rotate-180 text-white' : 'text-slate-400'}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-[0_20px_60px_-12px_rgba(22,47,92,0.35)] border border-[#C8C6C6]/70 dark:border-gray-700 py-2 z-30 text-xs overflow-hidden animate-[fadeSlideIn_0.18s_ease-out]">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-[#F7F6F2] to-white dark:from-gray-900 dark:to-gray-800">
                      <p className="font-bold text-[#1A1A2E] dark:text-white text-[13px]">{user?.name}</p>
                      <p className="text-slate-400 dark:text-gray-400 font-mono text-[11px]">@{user?.username}</p>
                    </div>
                    <NavLink
                      to="/admin/settings"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 mx-2 mt-2 px-3 py-2.5 rounded-xl text-slate-700 dark:text-gray-300 hover:bg-[#1E4B8E]/8 dark:hover:bg-gray-700 font-semibold transition-colors"
                    >
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Pengaturan Akun
                    </NavLink>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 mx-2 mb-1 w-[calc(100%-16px)] text-left px-3 py-2.5 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-semibold cursor-pointer transition-colors"
                    >
                      <LogoutIcon className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <style>{`@keyframes fadeSlideIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </header>

        {/* Page Content */}
        <main className="p-8 flex-1 bg-[#F7F6F2] dark:bg-gray-900 transition-colors duration-200">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
