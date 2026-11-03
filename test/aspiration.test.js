import test from 'node:test';
import assert from 'node:assert/strict';
import { getAspirationsController } from '../src/aspirationManager.js';

test('Pengujian Awal FR-7 (Sebelum Refactoring)', async () => {
  const academicUser = { userId: 'USR-AKD-001', role: 'Akademisi' };

  const res = await getAspirationsController({ user: academicUser, query: {} });
  assert.equal(res.success, true);
  assert.equal(res.statusCode, 200);
  assert.equal(res.data.length, 3);

  // Verifikasi penyamaran data anonim awal
  const anonItem = res.data.find((item) => item.isAnonymous);
  assert.equal(anonItem.namaMahasiswa, 'Anonim');
});
