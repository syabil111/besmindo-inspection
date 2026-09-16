# Admin Credentials

## Login Information

**Username:** `admin`  
**Password:** `qwerty`

## Notes

- Password sudah diupdate di backend mock database (`server/config/database.js`)
- Password hash juga sudah diupdate di file seed PostgreSQL (`server/database/seed.sql`)
- Jika server sudah running, **restart server backend** untuk memuat password baru
- Untuk restart: Stop server backend, lalu jalankan `npm start` di folder `server/`

## Cara Restart Server Backend

```powershell
# Di terminal, masuk ke folder server
cd server

# Stop semua proses node (jika perlu)
# Tekan Ctrl+C di terminal server yang sedang running

# Start server kembali
npm start
```

## Verifikasi Login

1. Buka browser ke `http://localhost:5173/admin/login`
2. Masukkan username: `admin`
3. Masukkan password: `qwerty`
4. Klik tombol "Masuk / Login"
5. Jika berhasil, akan redirect ke dashboard admin

---

✅ **Password admin berhasil diupdate dari `admin123` ke `qwerty`**
