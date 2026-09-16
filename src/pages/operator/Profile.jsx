import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../services/api';
import { ProfileIcon, CheckCircleIcon, LogoutIcon, OperatorHatIcon } from '../../components/Icons';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
      setProfileMsg('Data profil berhasil diperbarui!');
      const local = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...local, ...res.data.data }));
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-md flex items-center space-x-4 sm:space-x-6">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#1E4B8E] text-white flex items-center justify-center font-black text-2xl sm:text-3xl shadow-lg flex-shrink-0">
          {user?.name?.charAt(0).toUpperCase() || 'O'}
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg sm:text-2xl font-black text-[#1A1A2E]">{user?.name}</h2>
            <OperatorHatIcon className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-xs sm:text-sm font-mono text-gray-500 mt-0.5">@{user?.username}</p>
          <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900 uppercase tracking-wider border border-blue-200">
            Operator Armada Lapangan
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Edit Profil Form */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E5E7EB] shadow-md space-y-4 text-xs sm:text-sm flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-base text-[#1A1A2E] border-b border-gray-100 pb-3">
              Informasi Profil Saya
            </h3>

            {profileMsg && (
              <div className="mt-3 p-3 bg-green-50 text-green-700 rounded-xl flex items-center space-x-2 border border-green-200 font-semibold">
                <CheckCircleIcon className="w-4 h-4" />
                <span>{profileMsg}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} id="profileForm" className="space-y-4 mt-4">
              <div>
                <label className="block text-gray-700 font-bold mb-1.5">Nama Lengkap Operator</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-[#1E4B8E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1.5">No. Handphone / WhatsApp</label>
                <input
                  type="text"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  placeholder="Contoh: 081234567890"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-[#1E4B8E] focus:outline-none"
                />
              </div>
            </form>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <button
              type="submit"
              form="profileForm"
              className="w-full py-3 bg-[#1E4B8E] hover:bg-[#163A6E] text-white rounded-xl font-bold text-xs sm:text-sm shadow-md transition-colors cursor-pointer"
            >
              Simpan Perubahan Profil
            </button>
          </div>
        </div>

        {/* Ubah Password */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E5E7EB] shadow-md space-y-4 text-xs sm:text-sm flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-base text-[#1A1A2E] border-b border-gray-100 pb-3">
              Ubah Password Akun
            </h3>

            {passMsg && (
              <div className="mt-3 p-3 bg-green-50 text-green-700 rounded-xl flex items-center space-x-2 border border-green-200 font-semibold">
                <CheckCircleIcon className="w-4 h-4" />
                <span>{passMsg}</span>
              </div>
            )}

            {passErr && (
              <div className="mt-3 p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 font-semibold">
                {passErr}
              </div>
            )}

            <form onSubmit={handleChangePassword} id="passForm" className="space-y-3.5 mt-4">
              <div>
                <label className="block text-gray-700 font-bold mb-1">Password Saat Ini</label>
                <input
                  type="password"
                  value={passForm.currentPassword}
                  onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-[#1E4B8E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Password Baru (min. 6)</label>
                <input
                  type="password"
                  value={passForm.newPassword}
                  onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-[#1E4B8E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Ulangi Password Baru</label>
                <input
                  type="password"
                  value={passForm.confirmPassword}
                  onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-[#1E4B8E] focus:outline-none"
                />
              </div>
            </form>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <button
              type="submit"
              form="passForm"
              className="w-full py-3 bg-[#1E4B8E] hover:bg-[#163A6E] text-white rounded-xl font-bold text-xs sm:text-sm shadow-md transition-colors cursor-pointer"
            >
              Ubah Password Akun
            </button>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="w-full py-3.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-2xl font-extrabold text-xs sm:text-sm flex items-center justify-center space-x-2 border border-red-200 shadow-xs transition-colors cursor-pointer"
      >
        <LogoutIcon className="w-5 h-5" />
        <span>Keluar dari Akun Operator (Logout)</span>
      </button>
    </div>
  );
};

export default Profile;
