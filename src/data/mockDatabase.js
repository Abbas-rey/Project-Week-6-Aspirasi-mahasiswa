import { userRoles } from '../constants/appConstants.js';

export const mockUsers = [
  {
    userId: 'USR-MHS-001',
    nim: '1251420044',
    fullName: 'Achmad Suva Raihan Abbas',
    email: 'achmad.suva@uinjkt.ac.id',
    role: userRoles.MAHASISWA
  },
  {
    userId: 'USR-MHS-002',
    nim: '1251420045',
    fullName: 'Windu Athallah Ahmad',
    email: 'windu.athallah@uinjkt.ac.id',
    role: userRoles.MAHASISWA
  },
  {
    userId: 'USR-AKD-001',
    nim: null,
    fullName: 'Dr. Dewi Khairani, M.Sc.',
    email: 'dewi.khairani@uinjkt.ac.id',
    role: userRoles.AKADEMISI,
    position: 'Kaprodi Teknik Informatika'
  },
  {
    userId: 'USR-AKD-002',
    nim: null,
    fullName: 'Luh Kesuma Wardhani, S.T., M.T.',
    email: 'luh.kesuma@uinjkt.ac.id',
    role: userRoles.AKADEMISI,
    position: 'Dosen Pembina RPL'
  }
];

export const mockCategories = [
  { categoryId: 'KAT-01', categoryName: 'Akademik' },
  { categoryId: 'KAT-02', categoryName: 'Dosen' },
  { categoryId: 'KAT-03', categoryName: 'Fasilitas' },
  { categoryId: 'KAT-04', categoryName: 'Administrasi' },
  { categoryId: 'KAT-05', categoryName: 'Sarana Prasarana' },
  { categoryId: 'KAT-06', categoryName: 'Lainnya' }
];

export const mockAspirations = [
  {
    aspirationId: 'ASP-2026-001',
    studentId: 'USR-MHS-001',
    categoryId: 'KAT-03',
    title: 'AC di Ruang Lab Komputer 3 Rusak',
    incidentDetail: 'Pendingin ruangan tidak menyala sehingga suhu ruangan sangat panas saat praktikum berlangsung.',
    incidentDate: '2026-11-01',
    incidentTime: '08:30',
    isAnonymous: false,
    status: 'Diterima',
    createdAt: '2026-11-01T09:00:00Z'
  },
  {
    aspirationId: 'ASP-2026-002',
    studentId: 'USR-MHS-002',
    categoryId: 'KAT-01',
    title: 'Jadwal Kuliah Bentrok pada Semester Ganjil',
    incidentDetail: 'Terdapat bentrok jadwal antara mata kuliah Rekayasa Perangkat Lunak dan Jaringan Komputer.',
    incidentDate: '2026-11-02',
    incidentTime: '13:00',
    isAnonymous: true, // Pengirim memilih anonim!
    status: 'Diproses',
    createdAt: '2026-11-02T14:15:00Z'
  },
  {
    aspirationId: 'ASP-2026-003',
    studentId: 'USR-MHS-001',
    categoryId: 'KAT-04',
    title: 'Pelayanan Tanda Tangan KRS Lambat',
    incidentDetail: 'Antrean tanda tangan di loket administrasi lantai 2 memakan waktu lebih dari 3 jam.',
    incidentDate: '2026-11-02',
    incidentTime: '10:00',
    isAnonymous: true, // Pengirim memilih anonim!
    status: 'Sedang Ditinjau',
    createdAt: '2026-11-02T11:00:00Z'
  }
];
