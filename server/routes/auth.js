import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/database.js';
const pool = db;
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'besmindo_secret_jwt_key_default_2026';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '8h';

// Register (untuk operator)
router.post('/register', async (req, res) => {
  const { name, username, password, phone } = req.body;

  try {
    if (!name || !username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nama, username, dan password wajib diisi.'
      });
    }

    const existingUser = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Username sudah digunakan.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, username, password, phone, role, status) 
       VALUES ($1, $2, $3, $4, 'operator', 'pending') 
       RETURNING id, name, username, role, status, created_at`,
      [name, username, hashedPassword, phone || null]
    );

    // Buat notifikasi untuk admin
    await pool.query(
      `INSERT INTO notifications (type, title, message, related_user_id) 
       VALUES ($1, $2, $3, $4)`,
      [
        'new_registration',
        'Pendaftaran Operator Baru',
        `${name} telah mendaftar sebagai operator dan menunggu persetujuan.`,
        result.rows[0].id
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Pendaftaran berhasil! Mohon tunggu persetujuan admin.',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mendaftar.'
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username dan password wajib diisi.'
      });
    }

    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Username atau password salah.'
      });
    }

    const user = result.rows[0];

    if (user.status === 'pending') {
      return res.status(403).json({
        success: false,
        message: 'Akun Anda masih menunggu persetujuan admin.'
      });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({
        success: false,
        message: 'Akun Anda telah dinonaktifkan. Hubungi admin untuk informasi lebih lanjut.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Username atau password salah.'
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        status: user.status
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE }
    );

    res.json({
      success: true,
      message: 'Login berhasil!',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          role: user.role,
          phone: user.phone
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat login.'
    });
  }
});

// Get current user info
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, username, role, phone, status, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan.'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data user.'
    });
  }
});

// Update Profile (Nama & No HP)
router.put('/profile', authenticateToken, async (req, res) => {
  const { name, phone } = req.body;
  try {
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Nama tidak boleh kosong.' });
    }

    const result = await pool.query(
      'UPDATE users SET name = $1, phone = $2, updated_at = NOW() WHERE id = $3 RETURNING id, name, username, role, phone, status',
      [name.trim(), phone || null, req.user.id]
    );

    res.json({
      success: true,
      message: 'Profil berhasil diperbarui.',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui profil.' });
  }
});

// Change Password
router.put('/change-password', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Password lama dan baru wajib diisi.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password baru minimal 6 karakter.' });
    }

    const userRes = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
    }

    const user = userRes.rows[0];
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Password saat ini salah.' });
    }

    const hashedNew = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2', [hashedNew, req.user.id]);

    res.json({ success: true, message: 'Password berhasil diubah.' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengubah password.' });
  }
});

// Logout (client removes token)
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logout berhasil.' });
});

export default router;
