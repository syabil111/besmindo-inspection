# ⚡ QUICK GUIDE: Tambah Formulir Baru (Admin)

## 🎯 RINGKASAN SINGKAT

Untuk admin yang mau **cepat** tambah formulir baru tanpa baca dokumentasi panjang.

---

## 📝 CHECKLIST 5 MENIT

### ✅ **STEP 1: Tambah Form Type** (30 detik)
```
Login Admin → Sidebar "Form Types" → "+ Tambah Form Type"

Isi:
- Nama Form: [Nama lengkap formulir]
- Kode Form: [Kode dokumen]
- Type Key: [huruf_kecil_tanpa_spasi]

Klik "Simpan"
```

### ✅ **STEP 2: Tambah Categories** (1 menit)
```
Klik "Kelola" di form yang baru dibuat → Tab "Categories"

Tambah kategori satu per satu:
- Nama: A. [Nama Kategori]
- Urutan: 1, 2, 3, dst
- Klik "Simpan" per item
```

### ✅ **STEP 3: Tambah Checklist Items** (2-3 menit)
```
Tab "Checklist Items" → Pilih category → "+ Tambah Item"

Untuk setiap item:
- Deskripsi: [Nama item yang diperiksa]
- Urutan: 1, 2, 3, dst
- Klik "Simpan"

Ulangi untuk semua kategori
```

### ✅ **STEP 4: Daftarkan Kendaraan** (30 detik)
```
Sidebar "Vehicles" → "+ Tambah Kendaraan"

Isi form:
- Nomor Kendaraan: [Nomor/ID unit]
- Jenis Kendaraan: [Pilih dari dropdown]
- Tipe Form: [Pilih form type yang baru dibuat]
- Department: [Pilih dari dropdown]
- Data lainnya...

Klik "Simpan"
```

### ✅ **STEP 5: Test!** (1 menit)
```
Logout → Login sebagai operator

Dashboard → "Mulai Inspeksi" → Pilih kendaraan baru
→ Checklist otomatis muncul! ✅
```

---

## 🎯 CONTOH REAL: Tambah Formulir Crane

### **STEP 1:**
```
Nama Form: Formulir Inspeksi Harian Crane
Kode Form: BMSD/25/FO/HSE/03/24
Type Key: crane
```

### **STEP 2:**
```
Category 1: A. Sistem Keamanan Crane (Urutan: 1)
Category 2: B. Sistem Hoisting (Urutan: 2)
Category 3: C. Sistem Boom & Jib (Urutan: 3)
Category 4: D. Sistem Hidrolik (Urutan: 4)
```

### **STEP 3:**
```
Kategori A:
1. Hook / Kait pengangkat - tidak retak
2. Wire Rope / Sling - kondisi baik
3. Load Limiter / Pembatas beban
4. Emergency Stop button
5. Safety Lock
... (dst)

Kategori B:
1. Winch Drum
2. Brake System
3. Clutch
... (dst)
```

### **STEP 4:**
```
Nomor Kendaraan: CRN-001 (Tadano GT-550E)
Jenis Kendaraan: Tadano GT-550E Crane 55T
Tipe Form: crane  ← INI PENTING!
Department: Heavy Rig Move
```

### **STEP 5:**
```
Login operator → Pilih CRN-001
→ Checklist crane muncul otomatis!
```

---

## 💡 TIPS & TRICKS

### **Naming Convention:**
```
✅ GOOD:
- Type Key: "forklift", "crane", "excavator"
- Category: "A. Nama Kategori", "B. Nama Lainnya"

❌ BAD:
- Type Key: "Fork Lift" (ada spasi), "CRANE" (huruf besar)
- Category: "Kategori 1" (kurang deskriptif)
```

### **Urutan Kategori & Items:**
```
✅ Gunakan urutan: 1, 2, 3, 4, dst
   Jangan: 1, 3, 5, 10 (akan susah insert di tengah nanti)
```

### **Deskripsi Item:**
```
✅ GOOD: "Overhead Guard (Kanopi pelindung operator)"
✅ GOOD: "Mast (Tiang angkat) - tidak bengkok/retak"

❌ BAD: "Cek mast" (kurang detail)
❌ BAD: "Item 1" (tidak informatif)
```

---

## 🚨 TROUBLESHOOTING

### **Problem: Checklist tidak muncul di operator**
```
✅ Cek: Apakah kendaraan sudah assign form_type yang benar?
✅ Cek: Apakah ada checklist items untuk form type tersebut?
✅ Cek: Apakah status items = active?
```

### **Problem: Form type tidak muncul di dropdown**
```
✅ Cek: Apakah sudah klik "Simpan" saat buat form type?
✅ Cek: Refresh halaman browser
```

### **Problem: Items muncul tidak berurutan**
```
✅ Cek: Urutan sort_order sudah benar?
✅ Fix: Edit item → Ubah urutan → Simpan
```

---

## 📊 CHECKLIST SEBELUM GO-LIVE

Sebelum formulir baru dipakai operator, pastikan:

- [ ] Form type sudah dibuat
- [ ] Minimal 1 category sudah dibuat
- [ ] Minimal 5 items sudah dibuat (agar tidak kosong)
- [ ] Minimal 1 kendaraan sudah assign form type baru
- [ ] Test 1x sebagai operator
- [ ] Checklist muncul dengan benar
- [ ] Auto-fill master data berfungsi

**Kalau semua ✅, siap dipakai production!**

---

## 🎓 MASTER DATA (OPSIONAL)

Sebelum tambah kendaraan, pastikan master data sudah lengkap:

### **Master Data > Vehicle Models:**
```
Tambahkan model kendaraan baru jika belum ada
Contoh: "Tadano GT-550E Crane 55T"
```

### **Master Data > Departments:**
```
Pastikan department yang akan dipilih sudah terdaftar
```

### **Master Data > Work Locations:**
```
Pastikan lokasi kerja sudah terdaftar
```

### **Master Data > Asset Statuses:**
```
Biasanya sudah cukup (Operasional, Standby, Maintenance, Out of Service)
```

---

## ⏱️ ESTIMASI WAKTU

| Formulir | Jumlah Items | Estimasi Waktu |
|----------|--------------|----------------|
| Simple (20 items) | 3 categories, 20 items | ~5 menit |
| Medium (40 items) | 5 categories, 40 items | ~10 menit |
| Complex (60+ items) | 7+ categories, 60+ items | ~15 menit |

**Catatan:** Setelah 2-3x practice, waktu bisa lebih cepat!

---

## 📞 NEED HELP?

Dokumentasi lengkap: `CARA_TAMBAH_FORMULIR_BARU.md`

**Happy Creating! 🚀**
