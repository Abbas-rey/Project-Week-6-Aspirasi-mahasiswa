// KODE SEBELUM REFACTORING
// Implementasi awal fitur FR-7 (Melihat Daftar Aspirasi oleh Akademisi)
// Catatan: Masih terdapat code smell (God Function, pelanggaran DRY pada penyamaran nama, dan belum ada validasi input terpisah)

const databaseAspirasi = [
  {
    id: 'ASP-2026-001',
    studentId: 'USR-MHS-001',
    namaMahasiswa: 'Achmad Suva Raihan Abbas',
    nimMahasiswa: '1251420044',
    judul: 'AC di Ruang Lab Komputer 3 Rusak',
    kategori: 'Fasilitas',
    detail: 'Pendingin ruangan tidak menyala sehingga suhu ruangan sangat panas saat praktikum berlangsung.',
    tanggal: '2026-11-01',
    isAnonymous: false,
    status: 'Diterima'
  },
  {
    id: 'ASP-2026-002',
    studentId: 'USR-MHS-002',
    namaMahasiswa: 'Windu Athallah Ahmad',
    nimMahasiswa: '1251420045',
    judul: 'Jadwal Kuliah Bentrok pada Semester Ganjil',
    kategori: 'Akademik',
    detail: 'Terdapat bentrok jadwal antara mata kuliah Rekayasa Perangkat Lunak dan Jaringan Komputer.',
    tanggal: '2026-11-02',
    isAnonymous: true,
    status: 'Diproses'
  },
  {
    id: 'ASP-2026-003',
    studentId: 'USR-MHS-001',
    namaMahasiswa: 'Achmad Suva Raihan Abbas',
    nimMahasiswa: '1251420044',
    judul: 'Pelayanan Tanda Tangan KRS Lambat',
    kategori: 'Administrasi',
    detail: 'Antrean tanda tangan di loket administrasi lantai 2 memakan waktu lebih dari 3 jam.',
    tanggal: '2026-11-02',
    isAnonymous: true,
    status: 'Sedang Ditinjau'
  }
];

/**
 * Fungsi monolitik awal yang menangani otorisasi, filter, penyensoran, dan respons.
 */
export async function getAspirationsController(req) {
  // 1. Cek otorisasi manual di dalam fungsi yang sama
  if (!req.user || req.user.role !== 'Akademisi') {
    return {
      success: false,
      statusCode: 403,
      message: 'Akses ditolak: Hanya Akademisi yang boleh mengakses.'
    };
  }

  const query = req.query || {};
  let filtered = databaseAspirasi;

  // 2. Filter data tanpa validasi whitelist (raw comparison)
  if (query.status) {
    filtered = filtered.filter((item) => item.status === query.status);
  }

  if (query.category) {
    filtered = filtered.filter((item) => item.kategori.toLowerCase() === query.category.toLowerCase());
  }

  if (query.searchKeyword) {
    // Tanpa proteksi terhadap karakter injeksi khusus
    filtered = filtered.filter((item) => item.judul.toLowerCase().includes(query.searchKeyword.toLowerCase()));
  }

  // 3. Pelanggaran DRY: Penyamaran identitas ditulis manual dengan loop
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

  return {
    success: true,
    statusCode: 200,
    data: formattedResult
  };
}
