# Master Data System - Next Steps (Frontend)

## ✅ Backend Status: COMPLETE
- Mock database dengan master data tables ✅
- API routes `/api/master-data/*` ✅  
- CRUD endpoints untuk semua master data ✅
- Server running di port 5000 ✅

---

## 📋 Frontend Tasks (To Do)

### Phase 1: Admin - Master Data Management Pages

#### 1.1 Update API Service (`src/services/api.js`)
Tambahkan functions:
```javascript
// Master Data APIs
export const masterDataAPI = {
  // Vehicle Models
  getVehicleModels: () => api.get('/master-data/vehicle-models'),
  createVehicleModel: (data) => api.post('/master-data/vehicle-models', data),
  updateVehicleModel: (id, data) => api.put(`/master-data/vehicle-models/${id}`, data),
  deleteVehicleModel: (id) => api.delete(`/master-data/vehicle-models/${id}`),
  
  // Departments  
  getDepartments: () => api.get('/master-data/departments'),
  createDepartment: (data) => api.post('/master-data/departments', data),
  updateDepartment: (id, data) => api.put(`/master-data/departments/${id}`, data),
  deleteDepartment: (id) => api.delete(`/master-data/departments/${id}`),
  
  // Work Locations
  getWorkLocations: () => api.get('/master-data/work-locations'),
  createWorkLocation: (data) => api.post('/master-data/work-locations', data),
  updateWorkLocation: (id, data) => api.put(`/master-data/work-locations/${id}`, data),
  deleteWorkLocation: (id) => api.delete(`/master-data/work-locations/${id}`),
  
  // Asset Statuses
  getAssetStatuses: () => api.get('/master-data/asset-statuses'),
  createAssetStatus: (data) => api.post('/master-data/asset-statuses', data),
  updateAssetStatus: (id, data) => api.put(`/master-data/asset-statuses/${id}`, data),
  deleteAssetStatus: (id) => api.delete(`/master-data/asset-statuses/${id}`),
};
```

#### 1.2 Create Admin Pages
Create 4 new pages di `src/pages/admin/master-data/`:
- `VehicleModels.jsx` - CRUD model kendaraan
- `Departments.jsx` - CRUD department/rig
- `WorkLocations.jsx` - CRUD lokasi kerja
- `AssetStatuses.jsx` - CRUD status asset

**Template structure untuk setiap page:**
```jsx
- Table dengan search
- Button "Tambah Baru"
- Modal untuk Create/Edit
- Delete dengan konfirmasi
- Loading state
- Error handling
```

#### 1.3 Update Sidebar Menu (`AdminLayout.jsx`)
Tambahkan menu dropdown "Master Data":
```jsx
{
  name: 'Master Data',
  icon: DatabaseIcon,
  children: [
    { name: 'Model Kendaraan', path: '/admin/master-data/vehicle-models' },
    { name: 'Department/Rig', path: '/admin/master-data/departments' },
    { name: 'Lokasi Kerja', path: '/admin/master-data/work-locations' },
    { name: 'Status Asset', path: '/admin/master-data/asset-statuses' }
  ]
}
```

#### 1.4 Update Routes (`App.jsx`)
```jsx
<Route path="admin/master-data/vehicle-models" element={<VehicleModels />} />
<Route path="admin/master-data/departments" element={<Departments />} />
<Route path="admin/master-data/work-locations" element={<WorkLocations />} />
<Route path="admin/master-data/asset-statuses" element={<AssetStatuses />} />
```

---

### Phase 2: Update Vehicle Management

#### 2.1 Update `VehicleManagement.jsx`
Tambahkan fields baru di form:
- **Model Kendaraan** (dropdown searchable dari master data)
- **Department** (dropdown searchable dari master data)
- **Lokasi Default** (dropdown searchable dari master data)
- **Status Asset Default** (dropdown searchable dari master data)
- **S/N Engine** (text input)
- **Tahun Pembuatan** (number input)
- **Exp. Pajak** (date input)
- **Exp. KIUR** (date input)

#### 2.2 Update API calls
Update `createVehicle` dan `updateVehicle` untuk include master data references

---

### Phase 3: Update Operator Flow (AUTO-FILL!)

#### 3.1 Update `/api/public/vehicles` Response
Backend perlu return JOIN data:
```javascript
// Instead of just vehicle data:
{ id: 'v1', vehicle_number: 'DZ-01', ... }

// Return with master data joined:
{
  id: 'v1',
  vehicle_number: 'DZ-01',
  vehicle_model: { id: 'mdl-2', name: 'Komatsu D85' },
  department: { id: 'dept-1', name: 'Rig Operation & Earthmoving' },
  default_location: { id: 'loc-1', name: 'Yard / Basecamp' },
  default_asset_status: { id: 'status-1', name: 'Operasional' },
  sn_engine: 'KMT-D85-2021-001',
  exp_pajak: '2027-12-31',
  ...
}
```

#### 3.2 Update `SelectForm.jsx`
Saat operator pilih kendaraan, auto-populate fields

#### 3.3 Update `FillForm.jsx`  
Replace text inputs dengan dropdown searchable:
- S/N Engine / No. Unit (auto-fill from vehicle, dropdown searchable untuk edit)
- Model Alat (auto-fill, dropdown untuk edit)
- Rig/Department (auto-fill, dropdown untuk edit)
- Lokasi Kerja (auto-fill, dropdown untuk edit)
- Status Asset (auto-fill, dropdown untuk edit)

---

## 🎯 Expected Result

### Before:
```
Operator:
1. Pilih kendaraan
2. Ketik manual: S/N, Model, Rig, Lokasi, Status (5 fields manual!)
3. Isi checklist
```

### After:
```
Operator:
1. Pilih kendaraan
   → Auto-fill: S/N ✅, Model ✅, Rig ✅, Lokasi ✅, Status ✅
   → Bisa edit via dropdown jika perlu
2. Isi checklist
```

**Time saved: 50-70% per inspeksi!**

---

## 📁 File Structure

```
src/
├── pages/
│   └── admin/
│       ├── master-data/          ← NEW folder
│       │   ├── VehicleModels.jsx
│       │   ├── Departments.jsx
│       │   ├── WorkLocations.jsx
│       │   └── AssetStatuses.jsx
│       ├── VehicleManagement.jsx  ← UPDATE
│       └── AdminLayout.jsx        ← UPDATE (sidebar)
├── services/
│   └── api.js                     ← UPDATE (add masterDataAPI)
└── App.jsx                        ← UPDATE (routes)

server/
├── routes/
│   └── master-data.js             ✅ DONE
├── middleware/
│   └── auth.js                    ✅ DONE (requireAdmin added)
├── config/
│   └── database.js                ✅ DONE (master data tables)
└── index.js                       ✅ DONE (route added)
```

---

## 🚀 Implementation Priority

1. **High Priority** (Core functionality):
   - [ ] API service functions
   - [ ] Vehicle Models management page
   - [ ] Departments management page
   - [ ] Update VehicleManagement with new fields
   - [ ] Auto-fill operator form

2. **Medium Priority**:
   - [ ] Work Locations management
   - [ ] Asset Statuses management
   - [ ] Sidebar menu update

3. **Nice to Have**:
   - [ ] Bulk import master data
   - [ ] Export to Excel
   - [ ] Data validation & duplicate check

---

**Estimated Time:** 3-4 hours for complete implementation
**Current Status:** Backend 100% done, Frontend 0% done

**Next Command:** 
Lanjutkan dengan "buatkan frontend untuk master data" untuk mulai Phase 1
