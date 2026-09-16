import express from 'express';
import db from '../config/database.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// ============================================================================
// MASTER DATA ROUTES - Admin Only
// Vehicle Models, Departments, Work Locations, Asset Statuses
// ============================================================================

// ===== VEHICLE MODELS =====

// Get all vehicle models
router.get('/vehicle-models', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM vehicle_models WHERE is_active = true ORDER BY name ASC'
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get vehicle models error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data model kendaraan.' });
  }
});

// Create vehicle model
router.post('/vehicle-models', authenticateToken, requireAdmin, async (req, res) => {
  const { name, category } = req.body;
  try {
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Nama model wajib diisi.' });
    }

    const result = await db.query(
      'INSERT INTO vehicle_models (name, category, is_active) VALUES ($1, $2, true) RETURNING *',
      [name.trim(), category || null]
    );

    res.status(201).json({
      success: true,
      message: 'Model kendaraan berhasil ditambahkan.',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create vehicle model error:', error);
    res.status(500).json({ success: false, message: 'Gagal menambahkan model kendaraan.' });
  }
});

// Update vehicle model
router.put('/vehicle-models/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, category } = req.body;
  try {
    const result = await db.query(
      'UPDATE vehicle_models SET name = $1, category = $2 WHERE id = $3 RETURNING *',
      [name.trim(), category || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Model tidak ditemukan.' });
    }

    res.json({
      success: true,
      message: 'Model kendaraan berhasil diperbarui.',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update vehicle model error:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui model kendaraan.' });
  }
});

// Delete vehicle model
router.delete('/vehicle-models/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      'DELETE FROM vehicle_models WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Model tidak ditemukan.' });
    }

    res.json({ success: true, message: 'Model kendaraan berhasil dihapus.' });
  } catch (error) {
    console.error('Delete vehicle model error:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus model kendaraan.' });
  }
});

// ===== DEPARTMENTS =====

router.get('/departments', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM departments WHERE is_active = true ORDER BY name ASC'
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data department.' });
  }
});

router.post('/departments', authenticateToken, requireAdmin, async (req, res) => {
  const { name, code } = req.body;
  try {
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Nama department wajib diisi.' });
    }

    const result = await db.query(
      'INSERT INTO departments (name, code, is_active) VALUES ($1, $2, true) RETURNING *',
      [name.trim(), code?.trim() || null]
    );

    res.status(201).json({
      success: true,
      message: 'Department berhasil ditambahkan.',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({ success: false, message: 'Gagal menambahkan department.' });
  }
});

router.put('/departments/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, code } = req.body;
  try {
    const result = await db.query(
      'UPDATE departments SET name = $1, code = $2 WHERE id = $3 RETURNING *',
      [name.trim(), code?.trim() || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Department tidak ditemukan.' });
    }

    res.json({
      success: true,
      message: 'Department berhasil diperbarui.',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update department error:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui department.' });
  }
});

router.delete('/departments/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      'DELETE FROM departments WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Department tidak ditemukan.' });
    }

    res.json({ success: true, message: 'Department berhasil dihapus.' });
  } catch (error) {
    console.error('Delete department error:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus department.' });
  }
});

// ===== WORK LOCATIONS =====

router.get('/work-locations', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM work_locations WHERE is_active = true ORDER BY name ASC'
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get work locations error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data lokasi kerja.' });
  }
});

router.post('/work-locations', authenticateToken, requireAdmin, async (req, res) => {
  const { name, location_type } = req.body;
  try {
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Nama lokasi wajib diisi.' });
    }

    const result = await db.query(
      'INSERT INTO work_locations (name, location_type, is_active) VALUES ($1, $2, true) RETURNING *',
      [name.trim(), location_type || null]
    );

    res.status(201).json({
      success: true,
      message: 'Lokasi kerja berhasil ditambahkan.',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create work location error:', error);
    res.status(500).json({ success: false, message: 'Gagal menambahkan lokasi kerja.' });
  }
});

router.put('/work-locations/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, location_type } = req.body;
  try {
    const result = await db.query(
      'UPDATE work_locations SET name = $1, location_type = $2 WHERE id = $3 RETURNING *',
      [name.trim(), location_type || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Lokasi tidak ditemukan.' });
    }

    res.json({
      success: true,
      message: 'Lokasi kerja berhasil diperbarui.',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update work location error:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui lokasi kerja.' });
  }
});

router.delete('/work-locations/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      'DELETE FROM work_locations WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Lokasi tidak ditemukan.' });
    }

    res.json({ success: true, message: 'Lokasi kerja berhasil dihapus.' });
  } catch (error) {
    console.error('Delete work location error:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus lokasi kerja.' });
  }
});

// ===== ASSET STATUSES =====

router.get('/asset-statuses', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM asset_statuses WHERE is_active = true ORDER BY name ASC'
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get asset statuses error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data status asset.' });
  }
});

router.post('/asset-statuses', authenticateToken, requireAdmin, async (req, res) => {
  const { name, color } = req.body;
  try {
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Nama status wajib diisi.' });
    }

    const result = await db.query(
      'INSERT INTO asset_statuses (name, color, is_active) VALUES ($1, $2, true) RETURNING *',
      [name.trim(), color || 'gray']
    );

    res.status(201).json({
      success: true,
      message: 'Status asset berhasil ditambahkan.',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create asset status error:', error);
    res.status(500).json({ success: false, message: 'Gagal menambahkan status asset.' });
  }
});

router.put('/asset-statuses/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, color } = req.body;
  try {
    const result = await db.query(
      'UPDATE asset_statuses SET name = $1, color = $2 WHERE id = $3 RETURNING *',
      [name.trim(), color || 'gray', id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Status tidak ditemukan.' });
    }

    res.json({
      success: true,
      message: 'Status asset berhasil diperbarui.',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update asset status error:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui status asset.' });
  }
});

router.delete('/asset-statuses/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      'DELETE FROM asset_statuses WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Status tidak ditemukan.' });
    }

    res.json({ success: true, message: 'Status asset berhasil dihapus.' });
  } catch (error) {
    console.error('Delete asset status error:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus status asset.' });
  }
});

export default router;
