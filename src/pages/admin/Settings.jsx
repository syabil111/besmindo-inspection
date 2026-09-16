import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../services/api';
import { SettingsIcon, CheckCircleIcon } from '../../components/Icons';

const Settings = () => {
  const { user, login } = useAuth();
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || ''
  });
  const [passForm, setPassForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [profileMsg, setProfileMsg] = useState('');
  const [passMsg, setPassMsg] = useState('');
  const [passErr, setPassErr] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg('');
    try {
      const res = await authAPI.updateProfile(profileForm);
      setProfileMsg('Profil berhasil diperbarui!');
      // Update local storage user
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updated = { ...currentUser, ...res.data.data };
      localStorage.setItem('user', JSON.stringify(updated));
    } catch (err) {
      alert('Gagal update profil: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassMsg('');
    setPassErr('');

    if (passForm.newPassword !== passForm.confirmPassword) {
      setPassErr('Konfirmasi password baru tidak cocok.');
      return;
    }

    try {
      await authAPI.changePassword({
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword
      });
      setPassMsg('Password berhasil diubah!');
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPassErr(err.response?.data?.message || 'Gagal mengubah password.');
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A2E] tracking-tight">Pengaturan Akun Admin</h1>
        <p className="text-xs text-[#6B7280] mt-0.5">
          Kelola informasi profil personal administrator dan keamanan akun PT. BESMINDO
        </p>
      </div>

      {/* Profil Form */}
      <div className="bg-white rounded-xl p-6 border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        <h3 className="font-bold text-sm text-[#1A1A2E] mb-4 pb-2 border-b border-slate-200/80">
          Informasi Profil Administrator
        </h3>
        {profileMsg && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 text-xs rounded-md border border-green-200 flex items-center space-x-1.5">
            <CheckCircleIcon className="w-4 h-4" />
            <span>{profileMsg}</span>
          </div>
        )}
        <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Username Login</label>
            <input
              type="text"
              value={user?.username || ''}
              disabled
              className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-500 font-mono"
            />
            <span className="text-[10px] text-gray-400">Username tidak dapat diubah.</span>
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Nama Lengkap</label>
            <input
              type="text"
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E4B8E]/20 focus:border-[#1E4B8E] transition-all focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Nomor Handphone / WhatsApp</label>
            <input
              type="text"
              value={profileForm.phone}
              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              placeholder="Contoh: 08123456789"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E4B8E]/20 focus:border-[#1E4B8E] transition-all focus:outline-none"
            />
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-[#1E4B8E] hover:bg-[#2E6BC4] text-white rounded font-semibold text-xs transition-colors"
            >
              Simpan Profil
            </button>
          </div>
        </form>
      </div>

      {/* Ganti Password Form */}
      <div className="bg-white rounded-xl p-6 border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        <h3 className="font-bold text-sm text-[#1A1A2E] mb-4 pb-2 border-b border-slate-200/80">
          Ubah Password Akun
        </h3>
        {passMsg && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 text-xs rounded-md border border-green-200 flex items-center space-x-1.5">
            <CheckCircleIcon className="w-4 h-4" />
            <span>{passMsg}</span>
          </div>
        )}
        {passErr && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-md border border-red-200">
            {passErr}
          </div>
        )}
        <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Password Saat Ini</label>
            <input
              type="password"
              value={passForm.currentPassword}
              onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E4B8E]/20 focus:border-[#1E4B8E] transition-all focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Password Baru</label>
            <input
              type="password"
              value={passForm.newPassword}
              onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
              placeholder="Minimal 6 karakter"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E4B8E]/20 focus:border-[#1E4B8E] transition-all focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Konfirmasi Password Baru</label>
            <input
              type="password"
              value={passForm.confirmPassword}
              onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })}
              placeholder="Ketik ulang password baru"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E4B8E]/20 focus:border-[#1E4B8E] transition-all focus:outline-none"
            />
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-[#1E4B8E] hover:bg-[#2E6BC4] text-white rounded font-semibold text-xs transition-colors"
            >
              Ubah Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;

