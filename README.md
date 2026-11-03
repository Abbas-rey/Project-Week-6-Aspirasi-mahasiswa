# Tugas Praktik Rekayasa Perangkat Lunak (RPL)
## Topik: *Software Construction & Good Coding Practices* (Implementasi, Code Review, dan Refactoring)

**Nama Proyek:** Sistem Aspirasi Mahasiswa (ASMA)  
**Program Studi:** Teknik Informatika, UIN Syarif Hidayatullah Jakarta (2026)  
**Dosen Pengampu:** Luh Kesuma Wardhani, S.T., M.T. / Dr. Dewi Khairani, M.Sc.  
**Repository GitHub:** https://github.com/Abbas-rey/Project-Week-6-Aspirasi-mahasiswa  

---

## 1. Identifikasi Fitur (FR-7) dan Keterkaitan Rancangan

### A. Kode dan Deskripsi Functional Requirement
- **Kode FR:** `FR-7`
- **Deskripsi:** Sistem memungkinkan aktor **Akademisi** (Dosen / Kaprodi) untuk melihat dan memantau seluruh daftar aspirasi yang telah dikirimkan oleh mahasiswa.

### B. Keterkaitan dengan Rancangan Sebelumnya (Dokumen SRS UTS)
1. **Use Case (UC-05: Melihat Daftar Aspirasi):**
   - *Precondition:* Akademisi telah terautentikasi dan memiliki wewenang peninjauan.
   - *Main Flow:* Akademisi membuka menu daftar aspirasi -> Sistem mengambil data aspirasi -> Sistem menampilkan tabel berisi kategori, tanggal masuk, status, dan mode identitas pengirim -> Akademisi dapat memilih salah satu aspirasi untuk membaca detail keluhan.
   - *Alternative Flow:* Jika belum ada aspirasi baru, sistem menampilkan informasi bahwa daftar aspirasi kosong.
2. **Activity Diagram (AD-05):**
   - Pemisahan tanggung jawab antara antarmuka web (*frontend*), server *backend*, dan *database*.
   - *Backend* memverifikasi peran (*role*) pengguna dan menjalankan aturan privasi: **menyembunyikan atribut identitas mahasiswa jika aspirasi dikirim dengan mode anonim (`isAnonymous = true`)**.
3. **Entity Relationship Diagram (ERD):**
   - Terhubung dengan tabel `User` (ENT-01), `Aspirasi` (ENT-02), dan `Kategori` (ENT-03).

### C. Input, Proses, dan Output yang Diharapkan
- **Input:**
  - Identitas pengguna aktif (`currentUser`: `role`, `userId`, `fullName`).
  - Parameter query/filter opsional (`status`, `category`, `searchKeyword`).
- **Proses:**
  1. *Authorization Verification:* Memastikan peran adalah `Akademisi`.
  2. *Input Validation & Sanitization:* Memeriksa nilai enum status & kategori serta mencegah karakter berbahaya (anti-SQL Injection).
  3. *Data Querying:* Mengambil data dari tabel aspirasi beserta relasi kategori dan mahasiswa pengaju.
  4. *Data Masking (Aturan Anonimitas):* Jika `isAnonymous === true`, ganti `fullName` menjadi `"Anonim"` dan samarkan atribut NIM demi perlindungan data pribadi pelapor.
- **Output:**
  - Respons JSON standar berisi kode status HTTP, pesan status, total data yang ditemukan, dan array data aspirasi yang telah disanitasi.

### D. Komponen dan Modul yang Dikembangkan
- `src/constants/appConstants.js`: Berisi konstanta peran pengguna, daftar status valid, dan daftar kategori valid.
- `src/utils/aspirationValidator.js`: Modul validasi otorisasi dan parameter filter (Single Responsibility & Input Validation).
- `src/repositories/aspirationRepository.js`: Modul abstraksi akses data (Data Layer).
- `src/services/aspirationService.js`: Modul logika bisnis utama, orkestrasi filter, dan penyensoran data anonim (Business Logic Layer).
- `src/controllers/aspirationController.js`: Modul pengendali request/response (Presentation / Controller Layer).
- `test/aspiration.test.js`: Skrip pengujian otomatis mandiri tanpa dependensi pihak ketiga.

---

## 2. Prinsip Software Construction yang Diterapkan

1. **Meaningful Naming (camelCase):**
   - Seluruh variabel dan fungsi menggunakan konvensi camelCase yang deskriptif (`validateAcademicAuthorization`, `maskAnonymousIdentity`, `getAcademicAspirations`, `sanitizedFilter`).
2. **Modularity:**
   - Arsitektur dibagi rapi ke dalam lapisan *Constants*, *Validator*, *Repository*, *Service*, dan *Controller*.
3. **Single Responsibility Principle (SRP):**
   - Validator hanya mengurus keabsahan data, Repository hanya mengurus query data, dan Service hanya memproses alur bisnis dan sanitasi privasi.
4. **DRY (Don't Repeat Yourself):**
   - Logika penyamaran identitas mahasiswa dipusatkan pada satu fungsi murni `maskAnonymousIdentity`, mencegah perulangan logika di berbagai percabangan kode.
5. **Input Validation & Sanitization:**
   - Whitelist validation untuk status dan kategori, serta proteksi terhadap pola karakter SQL Injection pada kata kunci pencarian.
6. **Error Handling:**
   - Penanganan error terstruktur dengan pengembalian status code yang presisi (`400 Bad Request`, `403 Forbidden`, `500 Internal Server Error`).
7. **Code Readability:**
   - Kode bersih, memiliki dokumentasi JSDoc, indentasi konsisten (2 spasi), dan minim kompleksitas siklomatis.

---

## 3. Dokumentasi Code Review & Refactoring (Before – After)

### Temuan 1: Pelanggaran Prinsip DRY pada Penyamaran Data Anonim
- **Bagian Kode:** Logika penyensoran identitas mahasiswa anonim pada beberapa cabang filter data.
- **Masalah:** Sebelum refactoring, logika pengecekan `if (item.isAnonymous)` ditulis berulang kali secara manual pada setiap perulangan hasil query data. Hal ini memicu inkonsistensi dan risiko kebocoran identitas pelapor jika terdapat endpoint baru.
- **Perbaikan:** Melakukan abstraksi logika ke dalam satu fungsi terpusat `maskAnonymousIdentity(aspiration)`.

**Before Refactoring:**
```javascript
// KODE AWAL (src/aspirationManager.js - Duplikasi pengecekan di setiap blok loop)
const formattedResult = [];
for (let i = 0; i < filtered.length; i++) {
  const item = filtered[i];
  const formattedItem = { ...item };
  if (item.isAnonymous) {
    formattedItem.namaMahasiswa = 'Anonim';
    formattedItem.nimMahasiswa = 'Disembunyikan (Mode Anonim)';
  } else {
    formattedItem.namaMahasiswa = item.namaMahasiswa;
    formattedItem.nimMahasiswa = item.nimMahasiswa;
  }
  formattedResult.push(formattedItem);
}
```

**After Refactoring:**
```javascript
// KODE SETELAH REFACTORING (src/services/aspirationService.js - Fungsi murni & reusable)
maskAnonymousIdentity(aspiration) {
  if (aspiration.isAnonymous) {
    return {
      ...aspiration,
      submitter: {
        mode: 'Anonim',
        fullName: 'Anonim',
        nim: 'Disembunyikan (Mode Anonim)'
      }
    };
  }
  return {
    ...aspiration,
    submitter: {
      mode: 'Nama Terang',
      fullName: aspiration.submitter.fullName,
      nim: aspiration.submitter.nim
    }
  };
}
```

---

### Temuan 2: Tidak Adanya Validasi Ketat & Bahaya Parameter Injection
- **Bagian Kode:** Penanganan parameter `query` pencarian dan filter kategori/status.
- **Masalah:** Parameter filter langsung diteruskan ke proses pencocokan data tanpa whitelist validation dan tanpa pemeriksaan karakter berbahaya (SQL Injection patterns / script injection).
- **Perbaikan:** Membuat fungsi khusus `validateAspirationFilter()` yang memvalidasi terhadap enum `aspirationStatuses` & `aspirationCategories`, serta menerapkan sanitasi Regex terhadap pola malicious injection.

**Before Refactoring:**
```javascript
// KODE AWAL (src/aspirationManager.js - Tanpa sanitasi dan whitelist)
if (query.status) {
  filtered = filtered.filter((item) => item.status === query.status);
}
if (query.category) {
  filtered = filtered.filter((item) => item.kategori.toLowerCase() === query.category.toLowerCase());
}
if (query.searchKeyword) {
  filtered = filtered.filter((item) => item.judul.toLowerCase().includes(query.searchKeyword.toLowerCase()));
}
```

**After Refactoring:**
```javascript
// KODE SETELAH REFACTORING (src/utils/aspirationValidator.js - Whitelist & Sanitasi Keamanan)
export function validateAspirationFilter(filterParams = {}) {
  const { status, category, searchKeyword } = filterParams;
  const sanitizedFilter = {};

  if (status !== undefined && status !== null && status !== '') {
    const trimmedStatus = String(status).trim();
    if (!aspirationStatuses.includes(trimmedStatus)) {
      return {
        isValid: false,
        message: `Status filter '${trimmedStatus}' tidak valid. Pilihan yang tersedia: ${aspirationStatuses.join(', ')}`
      };
    }
    sanitizedFilter.status = trimmedStatus;
  }

  if (category !== undefined && category !== null && category !== '') {
    const trimmedCategory = String(category).trim();
    const matchedCategory = aspirationCategories.find(
      (cat) => cat.toLowerCase() === trimmedCategory.toLowerCase()
    );
    if (!matchedCategory) {
      return {
        isValid: false,
        message: `Kategori filter '${trimmedCategory}' tidak valid. Pilihan yang tersedia: ${aspirationCategories.join(', ')}`
      };
    }
    sanitizedFilter.category = matchedCategory;
  }

  if (searchKeyword !== undefined && searchKeyword !== null && searchKeyword !== '') {
    const trimmedKeyword = String(searchKeyword).trim();
    const dangerousPattern = /(--|;|\/\*|\*\/|xp_|union\s+select|drop\s+table)/i;
    if (dangerousPattern.test(trimmedKeyword)) {
      return {
        isValid: false,
        message: 'Karakter pencarian mengandung pola tidak aman atau berpotensi membahayakan sistem.'
      };
    }
    sanitizedFilter.searchKeyword = trimmedKeyword;
  }

  return { isValid: true, sanitizedFilter };
}
```

---

### Temuan 3: Pelanggaran Single Responsibility Principle (God Function)
- **Bagian Kode:** Fungsi Controller utama (`getAspirationsController`).
- **Masalah:** Controller menangani verifikasi role, validasi query, dataset database tiruan, transformasi data anonim, dan pembentukan respons HTTP secara bersamaan dalam satu file tunggal.
- **Perbaikan:** Memisahkan tanggung jawab menjadi lapisan modular:
  1. `aspirationValidator.js` (Otorisasi & validasi input)
  2. `aspirationRepository.js` (Akses & filter dataset)
  3. `aspirationService.js` (Logika bisnis & orkestrasi data)
  4. `aspirationController.js` (Menerima request & mengembalikan format respons)

**Before Refactoring:**
```javascript
// KODE AWAL (src/aspirationManager.js - God Function)
export async function getAspirationsController(req) {
  if (!req.user || req.user.role !== 'Akademisi') {
    return { success: false, statusCode: 403, message: 'Akses ditolak' };
  }
  // memfilter langsung di array lokal
  // memformat data anonim manual
  // mengembalikan respons
}
```

**After Refactoring:**
```javascript
// KODE SETELAH REFACTORING (src/controllers/aspirationController.js - Ramping & Delegatif)
export class AspirationController {
  constructor(aspirationService = new AspirationService()) {
    this.aspirationService = aspirationService;
  }

  async getAspirations(req) {
    try {
      const currentUser = req.user;
      const queryParams = req.query || {};
      const result = this.aspirationService.getAcademicAspirations(currentUser, queryParams);
      return result;
    } catch (error) {
      return {
        success: false,
        statusCode: 500,
        message: 'Terjadi kesalahan internal pada server saat memproses data aspirasi.',
        errorDetails: error.message
      };
    }
  }
}
```

---

## 4. Tabel Hasil Pengujian (Testing)

Pengujian dieksekusi menggunakan test runner bawaan Node.js (`npm test` / `node --test test/aspiration.test.js`).

| No | Functional Requirement (FR) | Skenario Pengujian | Langkah Pengujian (Steps) | Expected Result | Actual Result | Status |
|:--:|:----------------------------|:-------------------|:--------------------------|:----------------|:--------------|:------:|
| 1 | **FR-7** (Melihat Daftar Aspirasi) | **Normal Case 1:** Mengambil seluruh data aspirasi | 1. Kirim request dengan role `Akademisi`<br>2. Tanpa query filter | Status `200 OK`, seluruh data tampil, aspirasi dengan `isAnonymous=true` disamarkan namanya | Status `200 OK`, nama & NIM tersensor sesuai ketentuan | [x] Sesuai |
| 2 | **FR-7** (Melihat Daftar Aspirasi) | **Normal Case 2:** Memfilter berdasarkan kategori & status valid | 1. Kirim request role `Akademisi`<br>2. Filter `category: 'Fasilitas'`, `status: 'Diterima'` | Status `200 OK`, hanya menampilkan data yang sesuai kriteria filter | Status `200 OK`, 1 data fasilitas ditampilkan | [x] Sesuai |
| 3 | **FR-7** (Melihat Daftar Aspirasi) | **Invalid Input 1:** Akses oleh pengguna non-akademisi (Mahasiswa) | 1. Kirim request dengan role `Mahasiswa`<br>2. Coba akses endpoint daftar aspirasi | Status `403 Forbidden`, pesan akses ditolak | Status `403 Forbidden`, pesan: *"Akses ditolak: Hanya pihak Akademisi..."* | [x] Sesuai |
| 4 | **FR-7** (Melihat Daftar Aspirasi) | **Invalid Input 2:** Mengirim status filter yang tidak terdaftar | 1. Kirim request role `Akademisi`<br>2. Filter `status: 'MenungguKonfirmasi'` | Status `400 Bad Request`, pesan kesalahan enum status | Status `400 Bad Request`, pesan status tidak valid | [x] Sesuai |
| 5 | **FR-7** (Melihat Daftar Aspirasi) | **Edge Case 1:** Percobaan SQL Injection / karakter berbahaya | 1. Kirim request role `Akademisi`<br>2. Filter `searchKeyword: "'; DROP TABLE..."` | Status `400 Bad Request`, deteksi pola berbahaya | Status `400 Bad Request`, pesan peringatan pola tidak aman | [x] Sesuai |
| 6 | **FR-7** (Melihat Daftar Aspirasi) | **Edge Case 2:** Pencarian kriteria tanpa hasil (Empty Result) | 1. Kirim request role `Akademisi`<br>2. Filter kategori yang belum memiliki aspirasi (`Dosen`) | Status `200 OK`, `totalData: 0`, pesan ramah bahwa data kosong | Status `200 OK`, data kosong dengan notifikasi informatif | [x] Sesuai |
| 7 | **FR-7** (Melihat Daftar Aspirasi) | **Edge Case 3:** Sesi pengguna hilang (`user: null`) | 1. Kirim request tanpa data autentikasi pengguna | Status `403 Forbidden`, pesan autentikasi gagal | Status `403 Forbidden`, ditolak sebelum masuk pemrosesan | [x] Sesuai |

---

## 5. Daftar Kontribusi Anggota Kelompok

| No | Nama Anggota | NIM | Pembagian Kontribusi pada Tugas Praktik |
|:--:|:-------------|:---:|:----------------------------------------|
| 1 | **Achmad Suva Raihan Abbas** | 1251420044 | - Menganalisis kebutuhan use case UC-05 dan alur otorisasi hak akses Akademisi.<br>- Mengimplementasikan modul validasi otorisasi (`validateAcademicAuthorization`) dan menyusun skenario testing normal case. |
| 2 | **Windu Athallah Ahmad** | 1251420045 | - Menganalisis keterkaitan skema ERD basis data (Aspirasi, Kategori, User).<br>- Mengimplementasikan lapisan data access layer (`AspirationRepository`) dan mock dataset sistem. |
| 3 | **Muhamad Fariz Alfachrezi** | 1251420099 | - Mengimplementasikan modul layanan bisnis (`AspirationService`) dan mekanisme sensor identitas anonim (`maskAnonymousIdentity`).<br>- Melakukan code review temuan DRY serta memimpin proses refactoring modular. |
| 4 | **Muhammad Revan Adrian Hadinata** | 1251420109 | - Mengimplementasikan lapisan pengendali (`AspirationController`) dan validasi keamanan SQL Injection/Edge case.<br>- Merancang dan mengeksekusi otomatisasi pengujian unit (`aspiration.test.js`) serta menyusun dokumentasi akhir. |

---

## 6. Cara Menjalankan Kode dan Pengujian

Proyek ini dibangun menggunakan **Node.js** murni (ES Modules) tanpa dependensi eksternal:

1. **Jalankan Pengujian Unit & Edge Cases:**
   ```bash
   npm test
   ```
   *atau:*
   ```bash
   node --test test/aspiration.test.js
   ```

2. **Hasil Output Pengujian:**
   ```text
   ▶ === TAHAP 4 TESTING FITUR FR-7 (Melihat Daftar Aspirasi) ===
     ✔ 1. NORMAL CASE (Input Valid & Alur Standar)
     ✔ 2. INVALID INPUT CASE (Data Tidak Sesuai Ketentuan)
     ✔ 3. EDGE CASE (Kondisi Batas & Pengujian Keamanan)
   ✔ === TAHAP 4 TESTING FITUR FR-7 (Melihat Daftar Aspirasi) ===
   ℹ tests 4
   ℹ pass 4
   ℹ fail 0
   ```
