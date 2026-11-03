# Tugas Praktik Rekayasa Perangkat Lunak (RPL)
## Topik: *Software Construction & Good Coding Practices* (Versi Implementasi Awal — Sebelum Refactoring)

**Nama Proyek:** Sistem Aspirasi Mahasiswa (ASMA)  
**Program Studi:** Teknik Informatika, UIN Syarif Hidayatullah Jakarta (2026)  
**Dosen Pengampu:** Luh Kesuma Wardhani, S.T., M.T. / Dr. Dewi Khairani, M.Sc.  
**Repository GitHub:** https://github.com/Abbas-rey/Project-Week-6-Aspirasi-mahasiswa  

---

## 1. Identifikasi Fitur (FR-7) dan Keterkaitan Rancangan

### A. Kode dan Deskripsi Functional Requirement
- **Kode FR:** `FR-7`
- **Deskripsi:** Sistem memungkinkan aktor **Akademisi** (Dosen / Kaprodi) untuk melihat dan memantau seluruh daftar aspirasi yang masuk dari mahasiswa.
- **Aktor:** Akademisi (Dosen / Kaprodi).

### B. Keterkaitan dengan Rancangan Sebelumnya (Dokumen SRS UTS)
1. **Use Case (UC-05: Melihat Daftar Aspirasi):**
   - *Precondition:* Akademisi telah login dan memiliki hak akses peninjauan aspirasi.
   - *Main Flow:* Akademisi membuka menu daftar aspirasi masuk -> Sistem memuat daftar laporan -> Sistem menampilkan tabel aspirasi lengkap dengan status, kategori, dan mode identitas.
   - *Alternative Flow:* Jika belum ada aspirasi baru, sistem menampilkan pesan bahwa data masih kosong.
2. **Activity Diagram (AD-05 Melihat Daftar Aspirasi):**
   - Server memverifikasi hak akses akademisi dan menyembunyikan identitas mahasiswa pada laporan dengan opsi anonim (`isAnonymous = true`).
3. **Entity Relationship Diagram (ERD):**
   - Terhubung dengan entitas `Aspirasi` (ENT-02), `User` (ENT-01), dan `Kategori` (ENT-03).

### C. Input, Proses, dan Output yang Diharapkan
- **Input:** Sesi pengguna aktif (`currentUser`: `role: 'Akademisi'`, `fullName`), serta filter opsional (`status`, `category`, `searchKeyword`).
- **Proses:** Pemeriksaan hak akses, pemfilteran data, dan penyamaran nama untuk pengirim anonim.
- **Output:** Respons data aspirasi terstruktur (JSON) dengan kode status HTTP `200 OK` atau pesan error jika otorisasi gagal.

### D. Komponen / Modul yang Dikembangkan
- `src/aspirationManager.js`: Modul implementasi awal yang menampung fungsi pengendali, database tiruan, serta logika penyamaran identitas.
- `test/aspiration.test.js`: Skrip pengujian otomatis bawaan Node.js (`node:test`).

---

## 2. Prinsip Software Construction yang Diterapkan pada Versi Awal

1. **Meaningful Naming (camelCase):**
   - Nama variabel dan fungsi menggunakan format *camelCase* (`getAspirationsController`, `namaMahasiswa`, `isAnonymous`, `databaseAspirasi`).
2. **Input Validation Awal:**
   - Memastikan sesi pengguna terisi dan peran pengguna adalah `Akademisi`.
3. **Error Handling:**
   - Mengembalikan respons terstruktur berupa kode status HTTP (`403 Forbidden` untuk akses tidak sah).
4. **Code Readability:**
   - Format indentasi konsisten dan struktur kode mudah dibaca.

---

## 3. Hasil Code Review: Identifikasi 3 Bagian Kode untuk Refactoring

Berdasarkan hasil peninjauan kode (*code review*) bersama terhadap `src/aspirationManager.js`, teridentifikasi 3 masalah utama yang akan diperbaiki pada tahap *refactoring*:

### Temuan 1: Pelanggaran Prinsip DRY pada Penyamaran Data Anonim
* **Bagian Kode:** Blok perulangan penyamaran data anonim di baris 60–73.
* **Masalah:** Pengecekan `if (item.isAnonymous)` dan penulisan atribut pengganti (`Anonim`, `Disembunyikan`) ditulis berulang secara manual di dalam loop. Hal ini melanggar prinsip *Don't Repeat Yourself* (DRY) dan rawan kelalaian jika ada endpoint baru.
* **Rencana Perbaikan:** Mengekstrak logika penyamaran menjadi fungsi murni (*pure function*) tersendiri yang *reusable* (misal: `maskAnonymousIdentity`).

### Temuan 2: Ketiadaan Validasi Whitelist dan Sanitasi Input Keamanan
* **Bagian Kode:** Pemrosesan parameter `query` di baris 48–57.
* **Masalah:** Parameter `status`, `category`, dan `searchKeyword` langsung dicocokkan tanpa validasi daftar nilai resmi (*whitelist enum*) dan tanpa filter karakter berbahaya (anti-SQL Injection).
* **Rencana Perbaikan:** Membuat modul validator terpisah (`validateAspirationFilter`) yang memeriksa nilai enum dan membersihkan pola *injection*.

### Temuan 3: Pelanggaran Single Responsibility Principle (*God Function*)
* **Bagian Kode:** Fungsi tunggal `getAspirationsController`.
* **Masalah:** Fungsi ini mencampuradukkan 4 tanggung jawab berbeda sekaligus: validasi otorisasi peran, penarikan data mentah, logika bisnis penyamaran anonim, dan pembentukan respons HTTP.
* **Rencana Perbaikan:** Memecah kode ke dalam arsitektur berlapis:
  1. *Validator Layer* (`aspirationValidator.js`)
  2. *Repository Layer* (`aspirationRepository.js`)
  3. *Service Layer* (`aspirationService.js`)
  4. *Controller Layer* (`aspirationController.js`)

---

## 4. Tabel Hasil Pengujian (Testing)

Pengujian dijalankan langsung dengan:
```bash
npm test
```

| No | Functional Requirement (FR) | Skenario Pengujian | Langkah Pengujian (Steps) | Expected Result | Actual Result | Status |
|:--:|:----------------------------|:-------------------|:--------------------------|:----------------|:--------------|:------:|
| 1 | **FR-7** (Melihat Daftar Aspirasi) | **Normal Case:** Mengambil seluruh data aspirasi oleh Akademisi | 1. Kirim request dengan role `Akademisi`<br>2. Tanpa query filter | Status `200 OK`, seluruh data tampil, aspirasi dengan `isAnonymous=true` disamarkan namanya | Status `200 OK`, nama & NIM disamarkan | [x] Sesuai |
| 2 | **FR-7** (Melihat Daftar Aspirasi) | **Invalid Input:** Akses oleh pengguna non-akademisi (Mahasiswa) | 1. Kirim request dengan role `Mahasiswa`<br>2. Coba akses endpoint daftar aspirasi | Status `403 Forbidden`, pesan akses ditolak | Status `403 Forbidden`, pesan akses ditolak | [x] Sesuai |
| 3 | **FR-7** (Melihat Daftar Aspirasi) | **Edge Case:** Pencarian dengan kata kunci yang tidak ada (*Empty Result*) | 1. Kirim request role `Akademisi`<br>2. Beri filter `searchKeyword: 'LaboratoriumTidakAda'` | Status `200 OK`, mengembalikan array kosong (`length = 0`) | Status `200 OK`, data kosong terdeteksi | [x] Sesuai |

---

## 5. Daftar Kontribusi Anggota Kelompok

| No | Nama Anggota | NIM | Pembagian Kontribusi pada Tugas Praktik |
|:--:|:-------------|:---:|:----------------------------------------|
| 1 | **Achmad Suva Raihan Abbas** | 1251420044 | Menganalisis kebutuhan use case UC-05, alur otorisasi hak akses Akademisi, dan penyusunan skenario testing normal case. |
| 2 | **Windu Athallah Ahmad** | 1251420045 | Menyelaraskan struktur data dengan skema ERD (tabel Aspirasi, User, Kategori) dan menyusun mock dataset sistem. |
| 3 | **Muhamad Fariz Alfachrezi** | 1251420099 | Mengimplementasikan logika penyamaran identitas anonim pada fitur FR-7 dan memimpin *code review* temuan DRY. |
| 4 | **Muhammad Revan Adrian Hadinata** | 1251420109 | Mengimplementasikan pengecekan parameter, menyusun skrip pengujian otomatis (`aspiration.test.js`), dan dokumentasi awal. |
