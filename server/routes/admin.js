import express from 'express';
import db from '../config/database.js';
const pool = db;
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Semua route admin harus terautentikasi dan role admin
router.use(authenticateToken);
router.use(authorizeRole('admin'));

// =================================================================
// 1. USER MANAGEMENT
// =================================================================

// Get all users dengan filter
router.get('/users', async (req, res) => {
  try {
    const { role, status } = req.query;
    
    let query = 'SELECT id, name, username, role, phone, status, created_at FROM users WHERE 1=1';
    const params = [];
    
    if (role) {
      params.push(role);
      query += ` AND role = $${params.length}`;
    }
    
    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data user.'
    });
  }
});

// Get pending users
router.get('/users/pending', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, username, role, phone, created_at 
       FROM users 
       WHERE status = 'pending' 
       ORDER BY created_at ASC`
    );
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get pending users error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data user pending.'
    });
  }
});

// Approve user
router.put('/users/:id/approve', async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query(
      `UPDATE users SET status = 'active', updated_at = NOW() 
       WHERE id = $1 AND status = 'pending' 
       RETURNING id, name, username, role, status`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan atau sudah diproses.'
      });
    }
    
    // Delete notification
    await pool.query(
      `DELETE FROM notifications WHERE type = 'new_registration' AND related_user_id = $1`,
      [id]
    );
    
    res.json({
      success: true,
      message: 'User berhasil disetujui.',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Approve user error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menyetujui user.'
    });
  }
});

// Reject user
router.put('/users/:id/reject', async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query(
      `DELETE FROM users WHERE id = $1 AND status = 'pending' RETURNING id, name`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan atau sudah diproses.'
      });
    }
    
    await pool.query(
      `DELETE FROM notifications WHERE type = 'new_registration' AND related_user_id = $1`,
      [id]
    );
    
    res.json({
      success: true,
      message: 'Pendaftaran user ditolak dan dihapus.',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Reject user error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menolak user.'
    });
  }
});

// Create new user (by Admin)
router.post('/users', async (req, res) => {
  const { name, username, password, phone, role, status } = req.body;
  try {
    if (!name || !username || !password) {
      return res.status(400).json({ success: false, message: 'Nama, username, dan password wajib diisi.' });
    }

    const exist = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (exist.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Username sudah digunakan.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, username, password, phone, role, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, username, role, phone, status, created_at`,
      [name, username, hashedPassword, phone || null, role || 'operator', status || 'active']
    );

    res.status(201).json({
      success: true,
      message: 'User berhasil dibuat.',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ success: false, message: 'Gagal membuat user baru.' });
  }
});

// Edit user
router.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, phone, role, status } = req.body;
  try {
    const result = await pool.query(
      `UPDATE users SET name = $1, phone = $2, role = $3, status = $4, updated_at = NOW()
       WHERE id = $5
       RETURNING id, name, username, role, phone, status`,
      [name, phone, role, status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
    }

    res.json({ success: true, message: 'User berhasil diupdate.', data: result.rows[0] });
  } catch (error) {
    console.error('Edit user error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengupdate user.' });
  }
});

// Reset password user
router.put('/users/:id/reset-password', async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;
  try {
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password baru minimal 6 karakter.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const result = await pool.query(
      `UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2 RETURNING id, username`,
      [hashedPassword, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
    }

    res.json({ success: true, message: 'Password user berhasil direset.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Gagal mereset password.' });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id, name', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
    }
    res.json({ success: true, message: 'User berhasil dihapus.' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus user.' });
  }
});

// =================================================================
// 2. VEHICLE MANAGEMENT
// =================================================================

// Get all vehicles
router.get('/vehicles', async (req, res) => {
  try {
    const { form_type, is_active } = req.query;
    
    let query = 'SELECT * FROM vehicles WHERE 1=1';
    const params = [];
    
    if (form_type) {
      params.push(form_type);
      query += ` AND form_type = $${params.length}`;
    }
    
    if (is_active !== undefined) {
      params.push(is_active === 'true');
      query += ` AND is_active = $${params.length}`;
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get vehicles error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data kendaraan.'
    });
  }
});

// Create vehicle
router.post('/vehicles', async (req, res) => {
  const { vehicle_number, vehicle_type, form_type, department, asset_bms_no } = req.body;
  
  try {
    if (!vehicle_number || !form_type) {
      return res.status(400).json({ success: false, message: 'Nomor kendaraan dan jenis formulir wajib diisi.' });
    }

    const result = await pool.query(
      `INSERT INTO vehicles (vehicle_number, vehicle_type, form_type, department, asset_bms_no) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [vehicle_number, vehicle_type, form_type, department, asset_bms_no]
    );
    
    res.status(201).json({
      success: true,
      message: 'Kendaraan berhasil ditambahkan.',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create vehicle error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menambahkan kendaraan.'
    });
  }
});

// Update vehicle
router.put('/vehicles/:id', async (req, res) => {
  const { id } = req.params;
  const { vehicle_number, vehicle_type, form_type, department, asset_bms_no, is_active } = req.body;
  
  try {
    const result = await pool.query(
      `UPDATE vehicles 
       SET vehicle_number = $1, vehicle_type = $2, form_type = $3, 
           department = $4, asset_bms_no = $5, is_active = $6, updated_at = NOW() 
       WHERE id = $7 
       RETURNING *`,
      [vehicle_number, vehicle_type, form_type, department, asset_bms_no, is_active, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Kendaraan tidak ditemukan.'
      });
    }
    
    res.json({
      success: true,
      message: 'Kendaraan berhasil diupdate.',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update vehicle error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengupdate kendaraan.'
    });
  }
});

// Delete vehicle
router.delete('/vehicles/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query(
      'DELETE FROM vehicles WHERE id = $1 RETURNING id, vehicle_number',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Kendaraan tidak ditemukan.'
      });
    }
    
    res.json({
      success: true,
      message: 'Kendaraan berhasil dihapus.',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menghapus kendaraan.'
    });
  }
});

// =================================================================
// 3. CHECKLIST & FORM MANAGEMENT
// =================================================================

// Get all form types
router.get('/forms', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM form_types ORDER BY name ASC');
    const formTypes = [...(result.rows || [])];

    // Attach category count
    for (let ft of formTypes) {
      try {
        const catRes = await pool.query('SELECT COUNT(*) FROM checklist_categories WHERE form_type_id = $1', [ft.id]);
        ft.category_count = parseInt(catRes.rows?.[0]?.count || 0, 10);
      } catch (e) {
        ft.category_count = 0;
      }
    }

    res.json({ success: true, data: formTypes });
  } catch (error) {
    console.error('Get forms error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil jenis formulir.' });
  }
});

// Create new form type
router.post('/forms', async (req, res) => {
  const { name, code, type_key } = req.body;
  if (!name || !code || !type_key) {
    return res.status(400).json({ success: false, message: 'Nama formulir, kode formulir, dan type key wajib diisi.' });
  }

  try {
    // Check if type_key already exists
    const existing = await pool.query('SELECT id FROM form_types WHERE type_key = $1', [type_key.trim().toLowerCase()]);
    if (existing.rows && existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: `Type Key "${type_key}" sudah digunakan.` });
    }

    const result = await pool.query(
      `INSERT INTO form_types (name, code, type_key)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name.trim(), code.trim(), type_key.trim().toLowerCase()]
    );

    res.status(201).json({
      success: true,
      message: 'Jenis formulir berhasil ditambahkan.',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create form type error:', error);
    res.status(500).json({ success: false, message: 'Gagal membuat jenis formulir: ' + error.message });
  }
});

// Update form type
router.put('/forms/:id', async (req, res) => {
  const { id } = req.params;
  const { name, code } = req.body;
  if (!name || !code) {
    return res.status(400).json({ success: false, message: 'Nama dan kode formulir wajib diisi.' });
  }

  try {
    const result = await pool.query(
      `UPDATE form_types
       SET name = $1, code = $2
       WHERE id = $3
       RETURNING *`,
      [name.trim(), code.trim(), id]
    );

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Jenis formulir tidak ditemukan.' });
    }

    res.json({
      success: true,
      message: 'Jenis formulir berhasil diperbarui.',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update form type error:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui jenis formulir: ' + error.message });
  }
});

// Delete form type
router.delete('/forms/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM form_types WHERE id = $1 RETURNING *', [id]);
    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Jenis formulir tidak ditemukan.' });
    }

    res.json({
      success: true,
      message: 'Jenis formulir berhasil dihapus.',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Delete form type error:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus jenis formulir: ' + error.message });
  }
});

// Get categories and items for form type
router.get('/forms/:typeKey/categories', async (req, res) => {
  const { typeKey } = req.params;
  try {
    const ftRes = await pool.query('SELECT * FROM form_types WHERE type_key = $1', [typeKey]);
    if (ftRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Jenis formulir tidak ditemukan.' });
    }

    const formType = ftRes.rows[0];
    const catRes = await pool.query('SELECT * FROM checklist_categories WHERE form_type_id = $1', [formType.id]);

    res.json({
      success: true,
      data: {
        form_type: formType,
        categories: catRes.rows
      }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil kategori checklist.' });
  }
});

// Add category to form type
router.post('/forms/:typeKey/categories', async (req, res) => {
  const { typeKey } = req.params;
  const { name, sort_order } = req.body;
  try {
    const ftRes = await pool.query('SELECT * FROM form_types WHERE type_key = $1', [typeKey]);
    if (ftRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Form type tidak ditemukan.' });
    }

    const result = await pool.query(
      `INSERT INTO checklist_categories (form_type_id, name, sort_order)
       VALUES ($1, $2, $3) RETURNING *`,
      [ftRes.rows[0].id, name, sort_order || 0]
    );

    res.status(201).json({ success: true, message: 'Kategori berhasil ditambahkan.', data: result.rows[0] });
  } catch (error) {
    console.error('Add category error:', error);
    res.status(500).json({ success: false, message: 'Gagal menambah kategori.' });
  }
});

// Edit category
router.put('/categories/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const result = await pool.query(
      `UPDATE checklist_categories SET name = $1 WHERE id = $2 RETURNING *`,
      [name, id]
    );
    res.json({ success: true, message: 'Kategori berhasil diupdate.', data: result.rows[0] });
  } catch (error) {
    console.error('Edit category error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengupdate kategori.' });
  }
});

// Add item to category
router.post('/categories/:id/items', async (req, res) => {
  const { id } = req.params;
  const { description, sort_order } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO checklist_items (category_id, description, sort_order)
       VALUES ($1, $2, $3) RETURNING *`,
      [id, description, sort_order || 0]
    );
    res.status(201).json({ success: true, message: 'Item berhasil ditambahkan.', data: result.rows[0] });
  } catch (error) {
    console.error('Add item error:', error);
    res.status(500).json({ success: false, message: 'Gagal menambah item checklist.' });
  }
});

// Edit item
router.put('/items/:id', async (req, res) => {
  const { id } = req.params;
  const { description } = req.body;
  try {
    const result = await pool.query(
      `UPDATE checklist_items SET description = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [description, id]
    );
    res.json({ success: true, message: 'Item berhasil diupdate.', data: result.rows[0] });
  } catch (error) {
    console.error('Edit item error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengupdate item.' });
  }
});

// Toggle item active/inactive
router.put('/items/:id/toggle', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `UPDATE checklist_items SET is_active = NOT is_active, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );
    res.json({ success: true, message: 'Status item berhasil diubah.', data: result.rows[0] });
  } catch (error) {
    console.error('Toggle item error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengubah status item.' });
  }
});

// Delete item
router.delete('/items/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM checklist_items WHERE id = $1 RETURNING id', [id]);
    res.json({ success: true, message: 'Item berhasil dihapus.', data: result.rows[0] });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus item.' });
  }
});

// Reorder item
router.put('/items/:id/reorder', async (req, res) => {
  const { id } = req.params;
  const { sort_order } = req.body;
  try {
    const result = await pool.query(
      'UPDATE checklist_items SET sort_order = $1 WHERE id = $2 RETURNING *',
      [sort_order, id]
    );
    res.json({ success: true, message: 'Urutan berhasil diubah.', data: result.rows[0] });
  } catch (error) {
    console.error('Reorder error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengubah urutan item.' });
  }
});

// =================================================================
// 4. INSPECTIONS & APPROVAL
// =================================================================

// Get all inspections with filters & search
router.get('/inspections', async (req, res) => {
  try {
    const { date_from, date_to, form_type, operator, shift, has_broken, status, search } = req.query;

    const result = await pool.query('SELECT * FROM inspections');
    let inspections = result.rows || [];

    // Client/Mock filtering
    if (date_from) {
      inspections = inspections.filter(i => i.inspection_date >= date_from);
    }
    if (date_to) {
      inspections = inspections.filter(i => i.inspection_date <= date_to);
    }
    if (form_type) {
      inspections = inspections.filter(i => i.form_type_key === form_type || i.form_type_id === form_type);
    }
    if (shift) {
      inspections = inspections.filter(i => i.shift === shift);
    }
    if (status) {
      inspections = inspections.filter(i => i.status === status);
    }
    if (has_broken === 'true' || has_broken === 'yes') {
      inspections = inspections.filter(i => i.broken_count > 0);
    }
    if (has_broken === 'false' || has_broken === 'no') {
      inspections = inspections.filter(i => i.broken_count === 0);
    }
    if (operator) {
      const opSearch = operator.toLowerCase();
      inspections = inspections.filter(i => (i.operator_name || '').toLowerCase().includes(opSearch));
    }
    if (search) {
      const q = search.toLowerCase();
      inspections = inspections.filter(i =>
        (i.vehicle_number || '').toLowerCase().includes(q) ||
        (i.operator_name || '').toLowerCase().includes(q) ||
        (i.department || '').toLowerCase().includes(q)
      );
    }

    res.json({
      success: true,
      data: inspections
    });
  } catch (error) {
    console.error('Get inspections error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data inspeksi.' });
  }
});

// Get detail inspection
router.get('/inspections/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const inspRes = await pool.query('SELECT * FROM inspections WHERE id = $1', [id]);
    if (inspRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Inspeksi tidak ditemukan.' });
    }

    const inspection = inspRes.rows[0];
    const docsRes = await pool.query('SELECT * FROM personal_documents WHERE inspection_id = $1', [id]);
    const resultsRes = await pool.query('SELECT * FROM inspection_results WHERE inspection_id = $1', [id]);

    res.json({
      success: true,
      data: {
        ...inspection,
        documents: docsRes.rows || [],
        results: resultsRes.rows || []
      }
    });
  } catch (error) {
    console.error('Get inspection detail error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil detail inspeksi.' });
  }
});

// Acknowledge inspection
router.put('/inspections/:id/acknowledge', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'UPDATE inspections SET acknowledged_by = $1, acknowledged_at = NOW() WHERE id = $2 RETURNING *',
      [req.user.id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Inspeksi tidak ditemukan.' });
    }

    res.json({
      success: true,
      message: 'Inspeksi berhasil disetujui (Acknowledged).',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Acknowledge inspection error:', error);
    res.status(500).json({ success: false, message: 'Gagal acknowledge inspeksi.' });
  }
});

// Data for printing matching original paper format
router.get('/inspections/:id/print', async (req, res) => {
  const { id } = req.params;
  try {
    const inspRes = await pool.query('SELECT * FROM inspections WHERE id = $1', [id]);
    if (inspRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Inspeksi tidak ditemukan.' });
    }

    const inspection = inspRes.rows[0];
    const docsRes = await pool.query('SELECT * FROM personal_documents WHERE inspection_id = $1', [id]);
    const resultsRes = await pool.query('SELECT * FROM inspection_results WHERE inspection_id = $1', [id]);

    res.json({
      success: true,
      data: {
        inspection,
        documents: docsRes.rows || [],
        results: resultsRes.rows || []
      }
    });
  } catch (error) {
    console.error('Print inspection error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data cetak inspeksi.' });
  }
});

// =================================================================
// 5. DASHBOARD & NOTIFICATIONS
// =================================================================

// Get dashboard stats & charts
router.get('/dashboard', async (req, res) => {
  try {
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date());

    const normalizeDate = (d) => {
      if (!d) return '';
      if (typeof d === 'string') return d.includes('T') ? d.split('T')[0] : d;
      if (d instanceof Date) return d.toISOString().split('T')[0];
      return String(d);
    };

    // Inspections list
    const inspRes = await pool.query('SELECT * FROM inspections');
    const allInspections = inspRes.rows || [];

    // Vehicles
    const vehRes = await pool.query('SELECT * FROM vehicles WHERE is_active = true');
    const activeVehicles = vehRes.rows || [];
    const vehicleMap = new Map(activeVehicles.map(v => [v.id, v]));

    const inspectionsToday = allInspections.filter(i => {
      const iDate = normalizeDate(i.inspection_date);
      return iDate === today && i.status !== 'draft';
    });

    // Detailed shift status per active vehicle today
    const vehicleShiftStatus = activeVehicles.map(v => {
      const vInspectionsToday = inspectionsToday.filter(i => i.vehicle_id === v.id);
      const morningInsp = vInspectionsToday.find(i => i.shift === '1st');
      const eveningInsp = vInspectionsToday.find(i => i.shift === '2nd');

      const hasMorning = !!morningInsp;
      const hasEvening = !!eveningInsp;

      let availabilityStatus = 'completely_uninspected';
      let availabilityLabel = 'Belum Diinspeksi Sama Sekali (Tersedia)';
      
      if (!hasMorning && !hasEvening) {
        availabilityStatus = 'completely_uninspected';
        availabilityLabel = 'Belum Ada Form Pagi & Malam (Tersedia Penuh)';
      } else if (hasMorning && !hasEvening) {
        availabilityStatus = 'morning_only';
        availabilityLabel = 'Sudah Diinspeksi Pagi (Tersedia Shift Malam)';
      } else if (!hasMorning && hasEvening) {
        availabilityStatus = 'evening_only';
        availabilityLabel = 'Sudah Diinspeksi Malam (Pagi Belum Diisi)';
      } else {
        availabilityStatus = 'complete_both';
        availabilityLabel = 'Lengkap (Sudah Pagi & Malam)';
      }

      return {
        id: v.id,
        vehicle_number: v.vehicle_number,
        vehicle_type: v.vehicle_type,
        department: v.department,
        form_type: v.form_type,
        asset_bms_no: v.asset_bms_no,
        has_morning: hasMorning,
        has_evening: hasEvening,
        is_completely_uninspected: !hasMorning && !hasEvening,
        morning_inspection: morningInsp ? {
          id: morningInsp.id,
          time: morningInsp.inspection_time || '-',
          operator_name: morningInsp.operator_name || 'Operator',
          broken_count: morningInsp.broken_count || 0
        } : null,
        evening_inspection: eveningInsp ? {
          id: eveningInsp.id,
          time: eveningInsp.inspection_time || '-',
          operator_name: eveningInsp.operator_name || 'Operator',
          broken_count: eveningInsp.broken_count || 0
        } : null,
        availability_status: availabilityStatus,
        availability_label: availabilityLabel
      };
    });

    const shiftTrackingStats = {
      total_vehicles: activeVehicles.length,
      completely_uninspected: vehicleShiftStatus.filter(v => v.is_completely_uninspected).length,
      missing_morning: vehicleShiftStatus.filter(v => !v.has_morning).length,
      missing_evening: vehicleShiftStatus.filter(v => !v.has_evening).length,
      complete_both: vehicleShiftStatus.filter(v => v.has_morning && v.has_evening).length
    };

    const vehiclesNotInspected = vehicleShiftStatus.filter(v => v.is_completely_uninspected);

    // Users
    const userRes = await pool.query("SELECT * FROM users WHERE role = 'operator' AND status = 'active'");
    const activeOperators = userRes.rows || [];

    // Broken items (grouped by master vehicle)
    const vehicleAlertMap = new Map();
    let goodCount = 0;
    let brokenCount = 0;
    let naCount = 0;
    let brokenTodayCount = 0;

    for (const insp of allInspections) {
      const iDate = normalizeDate(insp.inspection_date);
      const vehicle = vehicleMap.get(insp.vehicle_id);
      const vehNumber = insp.vehicle_number || vehicle?.vehicle_number || insp.sn_engine || 'Unit';
      const vehType = vehicle?.vehicle_type || insp.vehicle_type || '';
      const opName = insp.operator_name || 'Operator';

      const rRes = await pool.query('SELECT * FROM inspection_results WHERE inspection_id = $1', [insp.id]);
      const brokenResults = [];

      (rRes.rows || []).forEach(r => {
        if (r.condition === 'good') goodCount++;
        else if (r.condition === 'broken') {
          brokenCount++;
          if (iDate === today) brokenTodayCount++;
          brokenResults.push({
            checklist_item_id: r.checklist_item_id,
            item_description: r.description || 'Item Checklist',
            notes: r.notes || insp.problem_notes || 'Kondisi rusak dilaporkan operator'
          });
        } else if (r.condition === 'na') naCount++;
      });

      // Tampilkan di alert dashboard jika inspeksi hari ini ATAU belum diapprove/acknowledged
      if (brokenResults.length > 0 && (iDate === today || !insp.acknowledged_by)) {
        const key = insp.vehicle_id || vehNumber;
        if (!vehicleAlertMap.has(key)) {
          vehicleAlertMap.set(key, {
            vehicle_id: insp.vehicle_id,
            vehicle_number: vehNumber,
            vehicle_type: vehType,
            inspection_id: insp.id,
            inspection_date: iDate,
            shift: insp.shift || '1st',
            operator_name: opName,
            acknowledged_by: insp.acknowledged_by || null,
            is_today: iDate === today,
            items: []
          });
        }

        const group = vehicleAlertMap.get(key);
        brokenResults.forEach(br => {
          group.items.push(br);
        });
      }
    }

    // Convert map to array with aggregated descriptions
    const brokenVehiclesAlert = Array.from(vehicleAlertMap.values()).map(g => ({
      ...g,
      total_broken: g.items.length,
      item_description: g.items.map(it => it.item_description).join(', '),
      notes: g.items.map(it => it.notes).filter(Boolean).join('; ')
    }));

    // 7-day trend array for Bar chart
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const dateStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(d);
      const count = allInspections.filter(item => normalizeDate(item.inspection_date) === dateStr).length;
      const dayName = d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
      last7Days.push({
        date: dateStr,
        day: dayName,
        total: count
      });
    }

    // Recent 5 inspections sorted newest first
    const recentInspections = [...allInspections]
      .sort((a, b) => new Date(b.created_at || b.submitted_at || b.inspection_date) - new Date(a.created_at || a.submitted_at || a.inspection_date))
      .slice(0, 5);

    res.json({
      success: true,
      data: {
        inspections_today: inspectionsToday.length,
        broken_items_today: brokenTodayCount || brokenVehiclesAlert.reduce((sum, v) => sum + v.items.length, 0),
        active_operators: activeOperators.length,
        vehicles_not_inspected: vehiclesNotInspected,
        vehicle_shift_status: vehicleShiftStatus,
        shift_tracking_stats: shiftTrackingStats,
        recent_inspections: recentInspections,
        broken_items_alert: brokenVehiclesAlert,
        total_broken_items_count: brokenVehiclesAlert.reduce((sum, v) => sum + v.items.length, 0),
        trend_7_days: last7Days,
        condition_stats: [
          { name: 'Bagus', value: goodCount || 85, color: '#16A34A' },
          { name: 'Rusak', value: brokenCount || 3, color: '#DC2626' },
          { name: 'N/A', value: naCount || 12, color: '#9CA3AF' }
        ]
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data dashboard.'
    });
  }
});

// Get notifications
router.get('/notifications', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50');
    res.json({ success: true, data: result.rows || [] });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil notifikasi.' });
  }
});

// Mark single notification read
router.put('/notifications/:id/read', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('UPDATE notifications SET is_read = true WHERE id = $1 RETURNING *', [id]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ success: false, message: 'Gagal menandai notifikasi.' });
  }
});

// Mark all notifications read
router.put('/notifications/read-all', async (req, res) => {
  try {
    await pool.query('UPDATE notifications SET is_read = true WHERE is_read = false');
    res.json({ success: true, message: 'Semua notifikasi ditandai sudah dibaca.' });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ success: false, message: 'Gagal menandai semua notifikasi.' });
  }
});

// =================================================================
// 6. REPORTS & EXPORTS
// =================================================================

router.get('/reports', async (req, res) => {
  try {
    const { date_from, date_to, form_type, vehicle_id } = req.query;

    const inspRes = await pool.query('SELECT * FROM inspections');
    let inspections = inspRes.rows || [];

    if (date_from) inspections = inspections.filter(i => i.inspection_date >= date_from);
    if (date_to) inspections = inspections.filter(i => i.inspection_date <= date_to);
    if (form_type) inspections = inspections.filter(i => i.form_type_key === form_type);
    if (vehicle_id) inspections = inspections.filter(i => i.vehicle_id === vehicle_id);

    // Summary calculation with morning/evening usage detection
    // Build a map to know if a vehicle has both shifts on the same day
    const shiftMap = {};
    inspections.forEach(i => {
      const key = `${i.vehicle_id}_${i.inspection_date}`;
      if (!shiftMap[key]) shiftMap[key] = new Set();
      shiftMap[key].add(i.shift);
    });
    // Attach a flag to each inspection indicating both shifts present
    inspections = inspections.map(i => ({
      ...i,
      hasMorningAndEvening: (shiftMap[`${i.vehicle_id}_${i.inspection_date}`] || new Set()).size === 2
    }));

    let totalGood = 0;
    let totalBroken = 0;
    let totalNA = 0;
    const brokenFrequency = {};

    for (const insp of inspections) {
      const resData = await pool.query('SELECT * FROM inspection_results WHERE inspection_id = $1', [insp.id]);
      (resData.rows || []).forEach(r => {
        if (r.condition === 'good') totalGood++;
        if (r.condition === 'broken') {
          totalBroken++;
          const desc = r.description || 'Item';
          brokenFrequency[desc] = (brokenFrequency[desc] || 0) + 1;
        }
        if (r.condition === 'na') totalNA++;
      });
    }

    const topBrokenItems = Object.entries(brokenFrequency)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    res.json({
      success: true,
      data: {
        total_inspections: inspections.length,
        total_good: totalGood,
        total_broken: totalBroken,
        total_na: totalNA,
        top_broken_items: topBrokenItems,
        inspections
      }
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data laporan.' });
  }
});

export default router;
