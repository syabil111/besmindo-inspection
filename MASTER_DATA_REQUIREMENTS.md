# Master Data System - Requirements

## 🎯 Tujuan
Mempercepat input operator dengan sistem dropdown + auto-fill data kendaraan

## 📊 Master Data yang Dibutuhkan

### 1. **Vehicle Models** (Model Alat)
- Bulldozer Heavy Duty
- Komatsu D85
- Toyota Hilux 4x4
- Hino 500
- Mitsubishi Fuso
- dll

### 2. **Departments** (Rig/Departemen)
- Rig Operation & Earthmoving
- Transport Logistics
- Waste & Mud Services
- Heavy Rig Move
- dll

### 3. **Work Locations** (Lokasi Kerja)
- Yard / Basecamp Operasional
- Field Area Duri
- Workshop Maintenance
- Rig Site A
- dll

### 4. **Asset Statuses** (Status Asset Armada)
- Operasional
- Standby
- Maintenance/Repair
- Out of Service
- dll

## 🚗 Vehicle Master Data (Extended)

Setiap kendaraan menyimpan **data default** yang otomatis terisi:

```javascript
{
  vehicle_number: "DZ-01 (Komatsu D85)",
  form_type: "dozer",
  
  // Default data (auto-fill)
  vehicle_model_id: "model-komatsu-d85",
  department_id: "dept-rig-operation",
  default_location_id: "loc-yard-basecamp",
  default_asset_status_id: "status-operasional",
  
  // Additional metadata
  sn_engine: "KMT-D85-2021-001",
  asset_bms_no: "BMS-DZ-2021-01",
  year_manufacture: 2021,
  exp_pajak: "2027-12-31",
  exp_kiur: "2026-10-15"
}
```

## 💻 Admin Pages (CRUD)

### Menu Sidebar Admin:
```
Dashboard
Inspeksi
Kendaraan
Master Formulir
Kelola Checklist

[NEW] Master Data ▼
  ├─ Model Kendaraan
  ├─ Department/Rig
  ├─ Lokasi Kerja
  └─ Status Asset

Rekap
Pengaturan
```

## 🔄 Flow Operator

### Before (Manual ketik):
```
1. Pilih kendaraan: DZ-01
2. Ketik S/N Engine: KMT-D85-2021-001      ← Manual
3. Ketik Model: Bulldozer Heavy Duty       ← Manual
4. Ketik Rig: Rig Operation & Earthmoving ← Manual
5. Ketik Lokasi: Yard Basecamp            ← Manual
6. Pilih Status: Operasional              ← Manual
```

### After (Auto-fill + Dropdown):
```
1. Pilih kendaraan: DZ-01
   → S/N Engine: KMT-D85-2021-001       ✅ Auto-fill
   → Model: [v Bulldozer Heavy Duty]    ✅ Dropdown (bisa ganti)
   → Rig: [v Rig Operation]             ✅ Dropdown (bisa ganti)
   → Lokasi: [v Yard Basecamp]          ✅ Dropdown (bisa ganti)
   → Status: [v Operasional]            ✅ Dropdown (bisa ganti)
```

## ✨ Fitur Dropdown

### Searchable Dropdown:
- **Search** by keyword
- **Scroll** list
- **Manual input** (type to add new - optional)
- **Clear** button
- **Placeholder** text

### Example:
```
Department/Rig *
[v Rig Operation & Earthmoving    ×]
    └─ Dropdown opens:
       [Search: rig...          ]
       ─────────────────────────
       ✓ Rig Operation & Earthmoving
         Transport Logistics
         Waste & Mud Services
         Heavy Rig Move
```

## 🗃️ Database Structure

### New Tables:
```sql
CREATE TABLE vehicle_models (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50),  -- 'dozer', 'truck', 'bus', etc
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE departments (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20),
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE work_locations (
  id UUID PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  location_type VARCHAR(50),  -- 'yard', 'field', 'workshop', etc
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE asset_statuses (
  id UUID PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  color VARCHAR(20),  -- 'green', 'yellow', 'red' untuk UI
  is_active BOOLEAN DEFAULT true
);
```

### Updated Vehicles Table:
```sql
ALTER TABLE vehicles ADD COLUMN vehicle_model_id UUID REFERENCES vehicle_models(id);
ALTER TABLE vehicles ADD COLUMN department_id UUID REFERENCES departments(id);
ALTER TABLE vehicles ADD COLUMN default_location_id UUID REFERENCES work_locations(id);
ALTER TABLE vehicles ADD COLUMN default_asset_status_id UUID REFERENCES asset_statuses(id);
ALTER TABLE vehicles ADD COLUMN sn_engine VARCHAR(100);
ALTER TABLE vehicles ADD COLUMN year_manufacture INT;
ALTER TABLE vehicles ADD COLUMN exp_pajak DATE;
ALTER TABLE vehicles ADD COLUMN exp_kiur DATE;
```

## 📝 Implementation Steps

### Phase 1: Backend
- [ ] Create master data tables (schema.sql)
- [ ] Create seed data (seed.sql)
- [ ] Update mock database (database.js)
- [ ] Create API routes for CRUD

### Phase 2: Admin UI
- [ ] Create master data management pages
- [ ] Add to sidebar menu
- [ ] CRUD functionality for each master

### Phase 3: Operator UI
- [ ] Auto-fill data saat pilih kendaraan
- [ ] Replace text inputs dengan searchable dropdowns
- [ ] Test flow lengkap

### Phase 4: Vehicle Management
- [ ] Update VehicleManagement.jsx
- [ ] Add fields untuk link ke master data
- [ ] Default value selection

---

**Timeline Estimate:** 2-3 hours implementation
**Priority:** High (efficiency improvement)
**Impact:** Mengurangi waktu input operator 50-70%
