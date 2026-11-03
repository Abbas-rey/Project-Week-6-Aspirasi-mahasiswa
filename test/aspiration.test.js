import test from 'node:test';
import assert from 'node:assert/strict';
import { getAspirationsController } from '../src/aspirationManager.js';

test('=== PENGUJIAN FITUR FR-7 (SEBELUM REFACTORING) ===', async (t) => {
  const academicUser = { userId: 'USR-AKD-001', fullName: 'Dr. Dewi Khairani, M.Sc.', role: 'Akademisi' };
  const studentUser = { userId: 'USR-MHS-001', fullName: 'Achmad Suva Raihan Abbas', role: 'Mahasiswa' };

  await t.test('1. Normal Case: Pengambilan Data Valid oleh Akademisi', async () => {
    const res = await getAspirationsController({ user: academicUser, query: {} });
    assert.equal(res.success, true);
    assert.equal(res.statusCode, 200);
    assert.equal(res.data.length, 3);

    // Verifikasi penyamaran data anonim awal
    const anonItem = res.data.find((item) => item.isAnonymous);
    assert.equal(anonItem.namaMahasiswa, 'Anonim');
    assert.equal(anonItem.nimMahasiswa, 'Disembunyikan (Mode Anonim)');
  });

  await t.test('2. Invalid Input: Akses oleh Pengguna Non-Akademisi (Mahasiswa)', async () => {
    const res = await getAspirationsController({ user: studentUser, query: {} });
    assert.equal(res.success, false);
    assert.equal(res.statusCode, 403);
    assert.match(res.message, /Akses ditolak/i);
  });

  await t.test('3. Edge Case: Pencarian dengan Kata Kunci Tertentu / Batas', async () => {
    // Pada versi sebelum refactoring, filter pencarian masih naive raw matching
    const res = await getAspirationsController({
      user: academicUser,
      query: { searchKeyword: 'LaboratoriumTidakAda' }
    });
    assert.equal(res.success, true);
    assert.equal(res.data.length, 0);
  });
});
