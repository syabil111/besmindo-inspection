# BESMINDO Vehicle Inspection System

Sistem Digitalisasi Formulir Inspeksi Kendaraan & Alat Berat untuk PT. BESMINDO — Drilling & Work Over Rig Services

## 🎯 100% Dynamic Form System - Tanpa Ngoding!

**PERTANYAAN:** Bagaimana kalau ada formulir baru dengan isi berbeda-beda?

**JAWABAN:** ✅ **TIDAK PERLU NGODING!** Admin bisa tambah unlimited formulir dengan checklist berbeda-beda via Admin Panel!

## 🌙 Dark Mode Support

System mendukung **Dark/Light Mode** dengan toggle button di sidebar admin!

- ✅ **Auto-persist** theme preference ke localStorage
- ✅ **Smooth transitions** between themes
- ✅ **Toggle button** dengan animated switch di sidebar
- ✅ **Full coverage**: AdminLayout, Sidebar, Topbar, Dropdowns, SearchableDropdown

**Test:** Login sebagai admin → Lihat sidebar kiri bawah → Klik "Dark Mode" toggle! 🌙

### 📚 Dokumentasi Lengkap:
1. **[CARA_TAMBAH_FORMULIR_BARU.md](./CARA_TAMBAH_FORMULIR_BARU.md)** - Panduan lengkap step-by-step
2. **[DEMO_FORKLIFT.md](./DEMO_FORKLIFT.md)** - Demo formulir Forklift (sudah siap ditest!)
3. **[PERBANDINGAN_FORMULIR.md](./PERBANDINGAN_FORMULIR.md)** - Bukti setiap form punya isi berbeda
4. **[QUICK_GUIDE_ADMIN.md](./QUICK_GUIDE_ADMIN.md)** - Quick reference 5 menit
5. **[PENJELASAN_CATEGORY.md](./PENJELASAN_CATEGORY.md)** - Penjelasan label category di dropdown
6. **[DARK_MODE_GUIDE.md](./DARK_MODE_GUIDE.md)** - Dark mode implementation guide 🌙

### ⚡ Quick Test:
```bash
# Backend sudah running di port 5000
# Buka: http://localhost:5173
# Login operator: operator / operator123
# Pilih kendaraan: FKL-001 (Toyota 8FD25)
# Lihat checklist Forklift muncul otomatis dengan isi berbeda!
```

---

## Tech Stack

- **Frontend**: React.js (Vite) + Tailwind CSS
- **Backend**: Node.js + Express.js
- **Database**: Supabase PostgreSQL
- **Authentication**: Custom JWT
- **Font**: Roboto (Google Fonts)
- **Export/Print**: react-to-print + jsPDF + SheetJS

## Setup Instructions

### 1. Database Setup (Supabase)

1. Buat project baru di [Supabase](https://supabase.com)
2. Jalankan script SQL di `server/database/schema.sql` di SQL Editor Supabase
3. Jalankan script SQL di `server/database/seed.sql` untuk data awal
4. Copy connection string dari Settings > Database

### 2. Backend Setup

```bash
cd server
npm install
```

Copy `.env.example` ke `.env` dan isi konfigurasi:

```env
PORT=5000
DATABASE_URL=your_supabase_connection_string
JWT_SECRET=your_secret_key
JWT_EXPIRE=8h
CORS_ORIGIN=http://localhost:5173
```

Jalankan server:

```bash
npm run dev
```

Server akan berjalan di `http://localhost:5000`

### 3. Frontend Setup

Kembali ke root folder:

```bash
npm install
```

Copy `.env.example` ke `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Jalankan development server:

```bash
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`

## Default Credentials

### Admin
- **Username**: `admin`
- **Password**: `admin123`

### Operator
Operator harus mendaftar sendiri melalui halaman register dan menunggu approval dari admin.

## Project Structure

```
besmindo-inspection/
├── public/                 # Static assets
├── server/                 # Backend Express.js
│   ├── config/            # Database config
│   ├── database/          # SQL schema & seed
│   ├── middleware/        # Auth middleware
│   ├── routes/            # API routes
│   └── index.js           # Server entry point
├── src/                   # Frontend React
│   ├── assets/           # Images, icons
│   ├── components/       # React components
│   ├── contexts/         # React contexts
│   ├── pages/            # Page components
│   ├── services/         # API services
│   ├── utils/            # Utilities
│   ├── App.jsx           # Main app component
│   └── main.jsx          # Entry point
└── README.md
```

## Features

### Admin Features
- Dashboard dengan statistik real-time
- Kelola user (approve/reject operator)
- Master data kendaraan (CRUD)
- Kelola formulir & checklist (CRUD)
- Lihat semua data inspeksi
- Notifikasi item rusak
- Cetak & export laporan (PDF, Excel)

### Operator Features (Mobile-First)
- Pilih kendaraan dan shift
- Isi formulir inspeksi (4 jenis)
- Auto-save draft
- Lihat riwayat inspeksi sendiri
- Status inspeksi hari ini

## API Endpoints

### Authentication
- `POST /api/auth/register` - Daftar operator baru
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Admin
- `/api/admin/users` - User management
- `/api/admin/vehicles` - Vehicle management
- `/api/admin/forms` - Form & checklist management
- `/api/admin/inspections` - View all inspections
- `/api/admin/dashboard` - Dashboard stats
- `/api/admin/notifications` - Notifications
- `/api/admin/reports` - Reports & exports

### Operator
- `/api/operator/vehicles` - Get active vehicles
- `/api/operator/inspections` - Inspection management
- `/api/operator/forms/:typeKey` - Get checklist for form type
- `/api/operator/today-status` - Today's inspection status

## Development Phases

### ✅ Phase 1 - Foundation (Current)
- Project setup
- Database schema
- Authentication (JWT)
- Basic API structure

### 🚧 Phase 2 - Core Features
- Form filling for operators
- Operator dashboard
- Admin dashboard
- View inspections

### 📋 Phase 3 - Management
- CRUD checklist items
- User management
- Notifications
- Acknowledge inspections

### 📊 Phase 4 - Reporting
- Print-ready forms
- Export Excel & PDF
- Charts & statistics
- UI polish

## Color Palette

Sesuai brand BESMINDO (blue & white):

- Primary: `#1E4B8E` (dark blue)
- Primary Hover: `#2E6BC4`
- Accent: `#4A90D9`
- Sidebar BG: `#162F5C`
- Success/Good: `#16A34A`
- Danger/Broken: `#DC2626`
- Warning: `#D97706`
- NA/Gray: `#9CA3AF`

## License

Proprietary - PT. BESMINDO
