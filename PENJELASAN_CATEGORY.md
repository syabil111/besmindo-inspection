# 📝 Penjelasan: Category pada Vehicle Models

## 🎯 Apa itu "Category"?

**Category** adalah **label kecil** di bawah nama model kendaraan yang menunjukkan **tipe/jenis** kendaraan tersebut.

Contoh dari screenshot Anda:
```
Bulldozer Heavy Duty
dozer  ← INI CATEGORY!

Komatsu D85
dozer  ← INI CATEGORY!

Toyota Hilux 4x4
lv     ← INI CATEGORY! (Light Vehicle)

Isuzu Elf Bus Crew
bus    ← INI CATEGORY!
```

---

## ✅ APAKAH PERLU DITAMBAHKAN?

### **JAWABAN: SUDAH ADA & SUDAH OTOMATIS MUNCUL!** 🎉

System sudah:
- ✅ Menyimpan category di database (field `category` di table `vehicle_models`)
- ✅ Menampilkan category sebagai **sublabel** di dropdown
- ✅ Support untuk **semua tipe kendaraan** (dozer, lv, bus, vacum, tandem, forklift, dll)

---

## 📊 DAFTAR CATEGORY YANG SUDAH ADA

| Category | Keterangan | Contoh Model |
|----------|------------|--------------|
| `dozer` | Bulldozer / Alat berat | Komatsu D85, Bulldozer Heavy Duty |
| `lv` | Light Vehicle | Toyota Hilux 4x4 |
| `bus` | Bus / Kendaraan penumpang | Isuzu Elf Bus Crew |
| `vacum` | Vacum Truck | Hino 500 Vacum Truck |
| `tandem` | Tandem / Lowbad | Mitsubishi Fuso Lowbad 40T |
| `forklift` ⭐ | Forklift | Toyota 8FD25, Komatsu FD30T |

---

## 🚀 CARA TAMBAH CATEGORY BARU

### **Skenario: Mau tambah kategori "Crane"**

#### **Option 1: Via Admin Panel** (Recommended)

1. Login sebagai admin
2. Sidebar → **"Master Data"** → **"Vehicle Models"**
3. Klik **"+ Tambah Model"**
4. Isi form:
   ```
   Nama Model: Tadano GT-550E Crane 55T
   Category: crane  ← TULIS INI!
   Status: Active
   ```
5. Klik **"Simpan"**

✅ **SELESAI!** Sekarang dropdown akan tampilkan:
```
Tadano GT-550E Crane 55T
crane  ← Muncul otomatis!
```

---

#### **Option 2: Via Database (untuk mock data)**

Edit file: `server/config/database.js`

```javascript
vehicle_models: [
  // ... existing models ...
  
  // TAMBAH INI:
  { 
    id: 'mdl-9', 
    name: 'Tadano GT-550E Crane 55T', 
    category: 'crane',  // ← TAMBAH FIELD INI
    is_active: true 
  },
  { 
    id: 'mdl-10', 
    name: 'Kato NK-500E Crane 50T', 
    category: 'crane',  // ← TAMBAH FIELD INI
    is_active: true 
  }
]
```

Restart backend server → Category `crane` muncul otomatis!

---

## 🎨 STYLING CATEGORY

Category sudah di-style dengan:
- ✅ Font mono (monospace) untuk tampilan tegas
- ✅ Warna abu-abu muda (`text-gray-400`)
- ✅ Ukuran font kecil (`text-[10px]`)
- ✅ Truncate jika terlalu panjang

Code di `SearchableDropdown.jsx`:
```jsx
{item.sublabel && (
  <div className="text-[10px] text-gray-400 font-mono truncate mt-0.5">
    {item.sublabel}  {/* ← INI CATEGORY! */}
  </div>
)}
```

---

## 💡 KEGUNAAN CATEGORY

### **1. Visual Clarity**
User langsung tahu jenis kendaraan tanpa baca nama lengkap.

```
Toyota 8FD25 Forklift 2.5T
forklift  ← "Oh ini forklift!"
```

### **2. Filtering (Future Enhancement)**
Bisa dipakai untuk filter dropdown berdasarkan kategori:
```
[Filter: forklift ▼]
- Toyota 8FD25 Forklift 2.5T
- Komatsu FD30T Forklift 3T
```

### **3. Grouping**
SearchableDropdown sudah support grouping! Bisa group by category:
```
── DOZER ──
   Bulldozer Heavy Duty
   Komatsu D85

── FORKLIFT ──
   Toyota 8FD25 Forklift 2.5T
   Komatsu FD30T Forklift 3T
```

---

## 🔥 BONUS: Best Practice Category

### **Naming Convention:**
```
✅ GOOD: 
- "dozer" (huruf kecil, singkat)
- "lv" (akronim OK)
- "forklift" (jelas, tanpa spasi)

❌ BAD:
- "Dozer" (huruf besar pertama)
- "Light Vehicle" (ada spasi, terlalu panjang)
- "FKL" (terlalu cryptic)
```

### **Consistency:**
Gunakan naming yang konsisten:
```
✅ GOOD:
- excavator
- crane
- loader

❌ BAD:
- excavator
- Crane
- LOADER
```

---

## 📸 SCREENSHOT LOKASI

Category muncul di **2 tempat**:

### **1. Admin → Vehicle Management**
```
Modal "Tambah/Edit Kendaraan"
Field: Tipe / Seri Unit (Vehicle Model)
→ Dropdown dengan sublabel category
```

### **2. Operator → Fill Form**
```
Form Inspeksi
Field: Tipe / Seri Unit
→ Dropdown dengan sublabel category (auto-filled dari vehicle default)
```

---

## ✅ TEST SEKARANG!

Backend sudah running dengan data Forklift lengkap + category!

### **Test 1: Lihat Category di Admin**
```
1. Login: admin / qwerty
2. Sidebar → "Vehicles" → "+ Tambah Kendaraan"
3. Klik dropdown "Tipe / Seri Unit"
4. Lihat category muncul di bawah setiap model!
```

### **Test 2: Lihat Category di Operator**
```
1. Login: operator / operator123
2. "Mulai Inspeksi" → Pilih FKL-001
3. Scroll ke field "Tipe / Seri Unit"
4. Lihat value "Toyota 8FD25 Forklift 2.5T" dengan sublabel "forklift"
```

---

## 🎯 KESIMPULAN

### **Apakah category perlu ditambahkan?**
✅ **SUDAH ADA!** System sudah support category di:
- Database (field `category`)
- API response
- UI (sublabel di dropdown)

### **Apakah bisa tambah category baru?**
✅ **BISA!** Tinggal:
1. Tambah model baru via Admin Panel
2. Isi field category (misal: "crane", "excavator", "generator")
3. Category otomatis muncul di dropdown!

### **Apakah perlu coding untuk category baru?**
❌ **TIDAK PERLU!** Sudah fully dynamic!

---

## 📞 NEXT STEPS

1. ✅ Test dengan data Forklift yang sudah ada
2. ✅ Coba tambah model baru dengan category berbeda
3. ✅ Lihat category muncul otomatis di dropdown

**Category system sudah production-ready! 🚀**
