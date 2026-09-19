import { useState } from 'react';
import { adminAPI } from '../services/api';

const RepairStatusButton = ({ resultId, currentStatus, onStatusUpdate }) => {
  const [repairStatus, setRepairStatus] = useState(currentStatus || 'pending');
  const [updating, setUpdating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [repairNotes, setRepairNotes] = useState('');

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        label: 'Rusak',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        textColor: 'text-red-800 dark:text-red-300',
        icon: '🔴',
        nextAction: 'Mulai Perbaikan'
      },
      in_progress: {
        label: 'Sedang Diperbaiki',
        bgColor: 'bg-amber-100 dark:bg-amber-900/30',
        textColor: 'text-amber-800 dark:text-amber-300',
        icon: '🟡',
        nextAction: 'Tandai Selesai'
      },
      repaired: {
        label: 'Sudah Diperbaiki',
        bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
        textColor: 'text-emerald-800 dark:text-emerald-300',
        icon: '🟢',
        nextAction: null
      }
    };
    return configs[status] || configs.pending;
  };

  const statusConfig = getStatusConfig(repairStatus);

  const handleUpdateStatus = async (newStatus) => {
    if (newStatus === 'repaired') {
      setShowModal(true);
      return;
    }

    setUpdating(true);
    try {
      const response = await adminAPI.updateRepairStatus(resultId, {
        repair_status: newStatus,
        repair_notes: ''
      });
      
      setRepairStatus(newStatus);
      if (onStatusUpdate) onStatusUpdate(resultId, newStatus);
      
      // Notifikasi sukses
      alert(`Status berhasil diupdate: ${newStatus === 'in_progress' ? 'Sedang Diperbaiki' : 'Pending'}`);
    } catch (error) {
      alert('Gagal mengupdate status perbaikan: ' + (error.response?.data?.message || error.message));
    } finally {
      setUpdating(false);
    }
  };

  const handleMarkRepaired = async () => {
    if (!repairNotes.trim()) {
      alert('Harap isi catatan perbaikan sebelum menandai sebagai selesai.');
      return;
    }

    setUpdating(true);
    try {
      const response = await adminAPI.updateRepairStatus(resultId, {
        repair_status: 'repaired',
        repair_notes: repairNotes
      });
      
      setRepairStatus('repaired');
      setShowModal(false);
      setRepairNotes('');
      
      if (onStatusUpdate) onStatusUpdate(resultId, 'repaired');
      alert('Item berhasil ditandai sebagai sudah diperbaiki!');
    } catch (error) {
      alert('Gagal menandai item diperbaiki: ' + (error.response?.data?.message || error.message));
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${statusConfig.bgColor} ${statusConfig.textColor}`}>
        <span className="mr-1.5">{statusConfig.icon}</span>
        <span>{statusConfig.label}</span>
      </span>

      {repairStatus !== 'repaired' && (
        <button
          onClick={() => handleUpdateStatus(repairStatus === 'pending' ? 'in_progress' : 'repaired')}
          disabled={updating}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
            repairStatus === 'pending' 
              ? 'bg-amber-600 hover:bg-amber-700 text-white'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          } ${updating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {updating ? 'Memproses...' : statusConfig.nextAction}
        </button>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 max-w-md w-full shadow-xl">
            <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-3">
              Konfirmasi Perbaikan Selesai
            </h3>
            <p className="text-xs text-slate-600 dark:text-gray-400 mb-4">
              Harap isi catatan perbaikan untuk melengkapi data.
            </p>
            
            <textarea
              value={repairNotes}
              onChange={(e) => setRepairNotes(e.target.value)}
              placeholder="Contoh: Ganti oli mesin, perbaikan sistem rem, ganti ban depan..."
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-slate-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#1E4B8E]/20 focus:border-[#1E4B8E] transition-all focus:outline-none mb-4"
              rows={3}
            />
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-lg transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleMarkRepaired}
                disabled={updating || !repairNotes.trim()}
                className={`px-4 py-2 text-xs font-bold text-white rounded-lg transition-all ${
                  updating || !repairNotes.trim()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer'
                }`}
              >
                {updating ? 'Menyimpan...' : 'Simpan & Tandai Selesai'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RepairStatusButton;
