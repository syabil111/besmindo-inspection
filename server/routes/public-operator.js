import express from 'express';
import db from '../config/database.js';
const pool = db;

const router = express.Router();

// ============================================================================
// PUBLIC OPERATOR ROUTES — TANPA AUTHENTICATION
// Untuk bapak-bapak operator gaptek yang akses via link/QR Code
// Tidak perlu login, langsung isi form inspeksi
// ============================================================================

// Get list of active vehicles (PUBLIC)
router.get('/vehicles', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
         v.id, 
         v.vehicle_number, 
         v.vehicle_type, 
         v.form_type, 
         v.department, 
         v.asset_bms_no,
         v.sn_engine,
         v.year_manufacture,
         v.exp_pajak,
         v.exp_kiur,
         v.exp_coi,
         v.vehicle_model_id,
         v.department_id,
         v.default_location_id,
         v.default_asset_status_id,
         vm.id as model_id,
         vm.name as model_name,
         vm.category as model_category,
         d.id as dept_id,
         d.name as dept_name,
         d.code as dept_code,
         wl.id as location_id,
         wl.name as location_name,
         wl.location_type,
         ast.id as status_id,
         ast.name as status_name,
         ast.color as status_color
       FROM vehicles v
       LEFT JOIN vehicle_models vm ON v.vehicle_model_id = vm.id
       LEFT JOIN departments d ON v.department_id = d.id
       LEFT JOIN work_locations wl ON v.default_location_id = wl.id
       LEFT JOIN asset_statuses ast ON v.default_asset_status_id = ast.id
       WHERE v.is_active = true 
       ORDER BY v.vehicle_number ASC`
    );

    // Transform data untuk struktur yang lebih bersih
    const vehicles = result.rows.map(row => ({
      id: row.id,
      vehicle_number: row.vehicle_number,
      vehicle_type: row.vehicle_type,
      form_type: row.form_type,
      department: row.department,
      asset_bms_no: row.asset_bms_no,
      sn_engine: row.sn_engine,
      year_manufacture: row.year_manufacture,
      exp_pajak: row.exp_pajak,
      exp_kiur: row.exp_kiur,
      exp_coi: row.exp_coi,
      // Master data objects
      vehicle_model: row.model_id ? {
        id: row.model_id,
        name: row.model_name,
        category: row.model_category
      } : null,
      dept: row.dept_id ? {
        id: row.dept_id,
        name: row.dept_name,
        code: row.dept_code
      } : null,
      default_location: row.location_id ? {
        id: row.location_id,
        name: row.location_name,
        location_type: row.location_type
      } : null,
      default_asset_status: row.status_id ? {
        id: row.status_id,
        name: row.status_name,
        color: row.status_color
      } : null
    }));

    res.json({
      success: true,
      data: vehicles
    });
  } catch (error) {
    console.error('Get vehicles error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data kendaraan.'
    });
  }
});

// Get list of active form types (PUBLIC)
router.get('/form-types', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM form_types ORDER BY name ASC');
    res.json({
      success: true,
      data: result.rows || []
    });
  } catch (error) {
    console.error('Get form types error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data jenis formulir.'
    });
  }
});

// Get master data for dropdowns (PUBLIC)
router.get('/master-data/departments', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, code FROM departments WHERE is_active = true ORDER BY name ASC');
    res.json({
      success: true,
      data: result.rows || []
    });
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data departemen.'
    });
  }
});

router.get('/master-data/work-locations', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, location_type FROM work_locations WHERE is_active = true ORDER BY name ASC');
    res.json({
      success: true,
      data: result.rows || []
    });
  } catch (error) {
    console.error('Get work locations error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data lokasi kerja.'
    });
  }
});

router.get('/master-data/asset-statuses', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, color FROM asset_statuses WHERE is_active = true ORDER BY name ASC');
    res.json({
      success: true,
      data: result.rows || []
    });
  } catch (error) {
    console.error('Get asset statuses error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data status asset.'
    });
  }
});

router.get('/master-data/vehicle-models', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, category FROM vehicle_models WHERE is_active = true ORDER BY name ASC');
    res.json({
      success: true,
      data: result.rows || []
    });
  } catch (error) {
    console.error('Get vehicle models error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data model kendaraan.'
    });
  }
});

// Get form checklist (PUBLIC)
router.get('/forms/:typeKey', async (req, res) => {
  const { typeKey } = req.params;

  try {
    // Get form type
    const formTypeRes = await pool.query(
      'SELECT * FROM form_types WHERE type_key = $1',
      [typeKey]
    );

    if (formTypeRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Jenis formulir tidak ditemukan.'
      });
    }

    const formType = formTypeRes.rows[0];

    // Get categories and items
    const categories = await pool.query(
      `SELECT * FROM checklist_categories 
       WHERE form_type_id = $1 
       ORDER BY sort_order ASC`,
      [formType.id]
    );

    const enrichedCategories = [];
    for (const cat of categories.rows) {
      let itemsList = cat.items;
      if (!itemsList || itemsList.length === 0) {
        const items = await pool.query(
          `SELECT id, description, sort_order, is_active 
           FROM checklist_items 
           WHERE category_id = $1 AND is_active = true 
           ORDER BY sort_order ASC`,
          [cat.id]
        );
        itemsList = items.rows || [];
      }

      enrichedCategories.push({
        ...cat,
        items: itemsList
      });
    }

    res.json({
      success: true,
      data: {
        form_type: formType,
        categories: enrichedCategories
      }
    });
  } catch (error) {
    console.error('Get form checklist error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil checklist formulir.'
    });
  }
});

// Submit inspection (PUBLIC — TANPA AUTH, pakai operator_name dari form)
router.post('/inspections', async (req, res) => {
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

  try {
    if (!operator_name || !operator_name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Nama operator wajib diisi.'
      });
    }

    // Get form_type_id from type_key
    const formTypeRes = await pool.query(
      'SELECT id, name FROM form_types WHERE type_key = $1',
      [form_type_key]
    );

    if (formTypeRes.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tipe formulir tidak valid.'
      });
    }

    const form_type_id = formTypeRes.rows[0].id;
    const formTypeName = formTypeRes.rows[0].name || 'Formulir Inspeksi';

    // Insert inspection
    const inspectionRes = await pool.query(
      `INSERT INTO inspections 
       (form_type_id, vehicle_id, operator_id, shift, inspection_date, inspection_time,
        department, location, asset_status, km_reading_value, exp_pajak, exp_kiur, exp_coi,
        tahun_k3, running_hours, sn_engine, model, operator_name, status, submitted_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, 'submitted', NOW()) 
       RETURNING id`,
      [
        form_type_id,
        vehicle_id,
        null,
        shift,
        inspection_date,
        inspection_time || new Date().toTimeString().slice(0, 5),
        header_data.department,
        header_data.location,
        header_data.asset_status,
        header_data.km_reading_value || null,
        header_data.exp_pajak || null,
        header_data.exp_kiur || null,
        header_data.exp_coi || null,
        header_data.tahun_k3 || null,
        header_data.running_hours || null,
        header_data.sn_engine || null,
        header_data.model || null,
        operator_name.trim()
      ]
    );

    const inspection_id = inspectionRes.rows[0].id;

    // Insert personal documents if provided
    if (personal_documents && personal_documents.length > 0) {
      for (const doc of personal_documents) {
        await pool.query(
          `INSERT INTO personal_documents 
           (inspection_id, doc_type, doc_number_1st, doc_number_2nd, expiry_date_1st, expiry_date_2nd) 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            inspection_id,
            doc.doc_type,
            doc.doc_number_1st || '',
            doc.doc_number_2nd || '',
            doc.expiry_date_1st || null,
            doc.expiry_date_2nd || null
          ]
        );
      }
    }

    // Insert checklist results
    let hasBroken = false;
    let problemNotes = [];

    for (const result of checklist_results) {
      await pool.query(
        `INSERT INTO inspection_results 
         (inspection_id, checklist_item_id, condition, notes) 
         VALUES ($1, $2, $3, $4)`,
        [
          inspection_id,
          result.checklist_item_id,
          result.condition,
          result.notes || null
        ]
      );

      if (result.condition === 'broken') {
        hasBroken = true;
        const itemRes = await pool.query(
          'SELECT description FROM checklist_items WHERE id = $1',
          [result.checklist_item_id]
        );
        if (itemRes.rows.length > 0) {
          problemNotes.push(`${itemRes.rows[0].description}: ${result.notes || 'Rusak'}`);
        }
      }
    }

    // Update problem_notes if there are broken items
    if (hasBroken && problemNotes.length > 0) {
      await pool.query(
        'UPDATE inspections SET problem_notes = $1 WHERE id = $2',
        [problemNotes.join('; '), inspection_id]
      );
    }

    // Notifikasi untuk admin — SETIAP ada operator yang mengisi form
    const vehicleRes = await pool.query('SELECT vehicle_number, vehicle_type FROM vehicles WHERE id = $1', [vehicle_id]);
    const vehicleNum = vehicleRes.rows[0]?.vehicle_number || 'Unit';
    const vehicleType = vehicleRes.rows[0]?.vehicle_type || '';

    await pool.query(
      `INSERT INTO notifications (type, title, message, related_inspection_id)
       VALUES ($1, $2, $3, $4)`,
      [
        'new_submission',
        formTypeName,
        `Operator ${operator_name} ingin mengendarai ${vehicleNum}${vehicleType ? ` (${vehicleType})` : ''} — shift ${shift === '1st' ? 'Pagi' : 'Malam'}, ${inspection_date}.`,
        inspection_id
      ]
    );

    // Notifikasi tambahan jika ada item rusak
    if (hasBroken && problemNotes.length > 0) {
      await pool.query(
        `INSERT INTO notifications (type, title, message, related_inspection_id)
         VALUES ($1, $2, $3, $4)`,
        [
          'broken_item',
          'Item Rusak Dilaporkan',
          `Operator ${operator_name} melaporkan item rusak pada kendaraan ${vehicleNum}.`,
          inspection_id
        ]
      );
    }

    res.status(201).json({
      success: true,
      message: 'Formulir inspeksi berhasil dikirim!',
      data: {
        inspection_id,
        operator_name
      }
    });
  } catch (error) {
    console.error('Submit inspection error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengirim formulir inspeksi.'
    });
  }
});

export default router;
