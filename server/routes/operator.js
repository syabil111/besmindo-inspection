import express from 'express';
import db from '../config/database.js';
const pool = db;
import { authenticateToken, authorizeRole, checkStatus } from '../middleware/auth.js';

const router = express.Router();

// Semua route operator harus terautentikasi dan role operator + status active
router.use(authenticateToken);
router.use(authorizeRole('operator'));
router.use(checkStatus);

// Get active vehicles (untuk dropdown)
router.get('/vehicles', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, vehicle_number, vehicle_type, form_type, department 
       FROM vehicles 
       WHERE is_active = true 
       ORDER BY vehicle_number`
    );
    
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

// Get today's status (sudah isi pagi/malam belum)
router.get('/today-status', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const result = await pool.query(
      `SELECT shift FROM inspections 
       WHERE operator_id = $1 
       AND inspection_date = $2 
       AND status = 'submitted'`,
      [req.user.id, today]
    );
    
    const shifts = result.rows.map(r => r.shift);
    
    res.json({
      success: true,
      data: {
        pagi_done: shifts.includes('1st'),
        malam_done: shifts.includes('2nd'),
        shifts_completed: shifts
      }
    });
  } catch (error) {
    console.error('Get today status error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil status hari ini.'
    });
  }
});

// Get checklist untuk form tertentu
router.get('/forms/:typeKey', async (req, res) => {
  const { typeKey } = req.params;
  
  try {
    // Get form type
    const formType = await pool.query(
      'SELECT * FROM form_types WHERE type_key = $1',
      [typeKey]
    );
    
    if (formType.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Jenis formulir tidak ditemukan.'
      });
    }
    
    // Get categories dengan items
    const categories = await pool.query(
      `SELECT c.id, c.name, c.sort_order,
              json_agg(
                json_build_object(
                  'id', i.id,
                  'description', i.description,
                  'sort_order', i.sort_order
                ) ORDER BY i.sort_order
              ) as items
       FROM checklist_categories c
       LEFT JOIN checklist_items i ON c.id = i.category_id AND i.is_active = true
       WHERE c.form_type_id = $1
       GROUP BY c.id, c.name, c.sort_order
       ORDER BY c.sort_order`,
      [formType.rows[0].id]
    );
    
    res.json({
      success: true,
      data: {
        form_type: formType.rows[0],
        categories: categories.rows
      }
    });
  } catch (error) {
    console.error('Get form error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil formulir.'
    });
  }
});

// Get riwayat inspeksi operator sendiri
router.get('/inspections', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.*, v.vehicle_number, v.vehicle_type, ft.name as form_name,
              (SELECT COUNT(*) FROM inspection_results ir 
               WHERE ir.inspection_id = i.id AND ir.condition = 'broken') as broken_count
       FROM inspections i
       JOIN vehicles v ON i.vehicle_id = v.id
       JOIN form_types ft ON i.form_type_id = ft.id
       WHERE i.operator_id = $1 AND i.status = 'submitted'
       ORDER BY i.inspection_date DESC, i.inspection_time DESC
       LIMIT 50`,
      [req.user.id]
    );
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get inspections error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil riwayat inspeksi.'
    });
  }
});

// Get detail inspeksi
router.get('/inspections/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    // Get inspection header
    const inspection = await pool.query(
      `SELECT i.*, v.vehicle_number, v.vehicle_type, ft.name as form_name, ft.type_key,
              u.name as operator_name
       FROM inspections i
       JOIN vehicles v ON i.vehicle_id = v.id
       JOIN form_types ft ON i.form_type_id = ft.id
       JOIN users u ON i.operator_id = u.id
       WHERE i.id = $1 AND i.operator_id = $2`,
      [id, req.user.id]
    );
    
    if (inspection.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Inspeksi tidak ditemukan.'
      });
    }
    
    // Get results
    const results = await pool.query(
      `SELECT ir.*, ci.description, cc.name as category_name
       FROM inspection_results ir
       JOIN checklist_items ci ON ir.checklist_item_id = ci.id
       JOIN checklist_categories cc ON ci.category_id = cc.id
       WHERE ir.inspection_id = $1
       ORDER BY cc.sort_order, ci.sort_order`,
      [id]
    );
    
    // Get personal documents
    const documents = await pool.query(
      'SELECT * FROM personal_documents WHERE inspection_id = $1',
      [id]
    );
    
    res.json({
      success: true,
      data: {
        ...inspection.rows[0],
        results: results.rows,
        documents: documents.rows
      }
    });
  } catch (error) {
    console.error('Get inspection detail error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil detail inspeksi.'
    });
  }
});

// Submit inspection (simplified - akan diperluas nanti)
router.post('/inspections', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const {
      form_type_key,
      vehicle_id,
      shift,
      inspection_date,
      inspection_time,
      header_data,
      personal_documents,
      checklist_results,
      operator_name
    } = req.body;
    
    // Get form_type_id
    const formType = await client.query(
            'SELECT id, name FROM form_types WHERE type_key = $1',
      [form_type_key]
    );
    
    if (formType.rows.length === 0) {
      throw new Error('Form type tidak ditemukan');
    }
    
    const formTypeName = formType.rows[0].name || 'Formulir Inspeksi';

    // Insert inspection
    const inspection = await client.query(
      `INSERT INTO inspections (
        form_type_id, vehicle_id, operator_id, shift, inspection_date, inspection_time,
        department, location, asset_status, km_reading_value, exp_pajak, exp_kiur, exp_coi,
        tahun_k3, running_hours, sn_engine, model, operator_name, status, submitted_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, 'submitted', NOW())
      RETURNING id`,
      [
        formType.rows[0].id,
        vehicle_id,
        req.user.id,
        shift,
        inspection_date,
        inspection_time,
        header_data?.department,
        header_data?.location,
        header_data?.asset_status,
        header_data?.km_reading_value,
        header_data?.exp_pajak,
        header_data?.exp_kiur,
        header_data?.exp_coi,
        header_data?.tahun_k3,
        header_data?.running_hours,
        header_data?.sn_engine,
        header_data?.model,
        operator_name
      ]
    );
    
    const inspection_id = inspection.rows[0].id;
    
    // Insert personal documents jika ada
    if (personal_documents && personal_documents.length > 0) {
      for (const doc of personal_documents) {
        await client.query(
          `INSERT INTO personal_documents (inspection_id, doc_type, doc_number_1st, doc_number_2nd, expiry_date_1st, expiry_date_2nd)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [inspection_id, doc.doc_type, doc.doc_number_1st, doc.doc_number_2nd, doc.expiry_date_1st, doc.expiry_date_2nd]
        );
      }
    }
    
    // Insert checklist results
    let hasBrokenItems = false;
    for (const result of checklist_results) {
      await client.query(
        `INSERT INTO inspection_results (inspection_id, checklist_item_id, condition, notes)
         VALUES ($1, $2, $3, $4)`,
        [inspection_id, result.checklist_item_id, result.condition, result.notes]
      );
      
      if (result.condition === 'broken') {
        hasBrokenItems = true;
      }
    }
    
    // Notifikasi untuk admin — SETIAP ada operator yang mengisi form
    const vehicleInfo = await client.query(
      'SELECT vehicle_number, vehicle_type FROM vehicles WHERE id = $1',
      [vehicle_id]
    );
    const vehicleNum = vehicleInfo.rows[0]?.vehicle_number || 'Unit';
    const vehicleType = vehicleInfo.rows[0]?.vehicle_type || '';

    await client.query(
      `INSERT INTO notifications (type, title, message, related_inspection_id)
       VALUES ('new_submission', $1, $2, $3)`,
      [formTypeName, `Operator ${operator_name || req.user.name} ingin mengendarai ${vehicleNum}${vehicleType ? ` (${vehicleType})` : ''} — shift ${shift === '1st' ? 'Pagi' : 'Malam'}, ${inspection_date}.`, inspection_id]
    );

    // Notifikasi tambahan jika ada item rusak
    if (hasBrokenItems) {
      await client.query(
        `INSERT INTO notifications (type, title, message, related_inspection_id)
         VALUES ('broken_item', 'Item Rusak Dilaporkan', $1, $2)`,
        [`Operator ${req.user.name} melaporkan item rusak pada inspeksi.`, inspection_id]
      );
    }
    
    await client.query('COMMIT');
    
    res.status(201).json({
      success: true,
      message: 'Inspeksi berhasil disubmit!',
      data: { inspection_id }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Submit inspection error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menyimpan inspeksi.'
    });
  } finally {
    client.release();
  }
});

export default router;
