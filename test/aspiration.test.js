import test from 'node:test';
import assert from 'node:assert/strict';
import { AspirationController } from '../src/controllers/aspirationController.js';
import { mockUsers } from '../src/data/mockDatabase.js';

const controller = new AspirationController();

const academicUser = mockUsers.find((u) => u.role === 'Akademisi');
const studentUser = mockUsers.find((u) => u.role === 'Mahasiswa');

test('=== TAHAP 4 TESTING FITUR FR-7 (Melihat Daftar Aspirasi) ===', async (t) => {

  await t.test('1. NORMAL CASE (Input Valid & Alur Standar)', async () => {
    // 1.1 Akademisi mengambil seluruh data aspirasi
    const reqAll = {
      user: academicUser,
      query: {}
    };

    const responseAll = await controller.getAspirations(reqAll);
    assert.equal(responseAll.success, true, 'Status sukses harus bernilai true');
    assert.equal(responseAll.statusCode, 200, 'HTTP status code harus 200');
    assert.equal(responseAll.data.totalData, 3, 'Total data mock harus 3');

    // Verifikasi aturan bisnis anonimitas:
    // Aspirasi ASP-2026-001 (non-anonim): Nama terang harus muncul
    const nonAnon = responseAll.data.aspirations.find((a) => a.aspirationId === 'ASP-2026-001');
    assert.equal(nonAnon.isAnonymous, false);
    assert.equal(nonAnon.submitter.mode, 'Nama Terang');
    assert.equal(nonAnon.submitter.fullName, 'Achmad Suva Raihan Abbas');

    // Aspirasi ASP-2026-002 (anonim): Nama & NIM wajib disembunyikan
    const anon = responseAll.data.aspirations.find((a) => a.aspirationId === 'ASP-2026-002');
    assert.equal(anon.isAnonymous, true);
    assert.equal(anon.submitter.mode, 'Anonim');
    assert.equal(anon.submitter.fullName, 'Anonim');
    assert.equal(anon.submitter.nim, 'Disembunyikan (Mode Anonim)');

    // 1.2 Akademisi memfilter berdasarkan kategori valid 'Fasilitas'
    const reqFiltered = {
      user: academicUser,
      query: { category: 'Fasilitas', status: 'Diterima' }
    };

    const responseFiltered = await controller.getAspirations(reqFiltered);
    assert.equal(responseFiltered.success, true);
    assert.equal(responseFiltered.data.totalData, 1);
    assert.equal(responseFiltered.data.aspirations[0].categoryName, 'Fasilitas');
  });

  await t.test('2. INVALID INPUT CASE (Data Tidak Sesuai Ketentuan)', async () => {
    // 2.1 Aktor Mahasiswa mencoba mengakses endpoint khusus Akademisi
    const reqUnauthorized = {
      user: studentUser,
      query: {}
    };

    const responseUnauthorized = await controller.getAspirations(reqUnauthorized);
    assert.equal(responseUnauthorized.success, false);
    assert.equal(responseUnauthorized.statusCode, 403);
    assert.match(responseUnauthorized.message, /Akses ditolak/i);

    // 2.2 Akademisi mengirim status filter yang tidak valid
    const reqInvalidStatus = {
      user: academicUser,
      query: { status: 'MenungguKonfirmasi' }
    };

    const responseInvalidStatus = await controller.getAspirations(reqInvalidStatus);
    assert.equal(responseInvalidStatus.success, false);
    assert.equal(responseInvalidStatus.statusCode, 400);
    assert.match(responseInvalidStatus.message, /Status filter 'MenungguKonfirmasi' tidak valid/);

    // 2.3 Akademisi mengirim kategori filter yang tidak valid
    const reqInvalidCategory = {
      user: academicUser,
      query: { category: 'KantinKampus' }
    };

    const responseInvalidCategory = await controller.getAspirations(reqInvalidCategory);
    assert.equal(responseInvalidCategory.success, false);
    assert.equal(responseInvalidCategory.statusCode, 400);
    assert.match(responseInvalidCategory.message, /Kategori filter 'KantinKampus' tidak valid/);
  });

  await t.test('3. EDGE CASE (Kondisi Batas & Pengujian Keamanan)', async () => {
    // 3.1 Karakter berbahaya / Percobaan SQL Injection pada searchKeyword
    const reqSqlInjection = {
      user: academicUser,
      query: { searchKeyword: "' OR 1=1; DROP TABLE aspirations; --" }
    };

    const responseSqlInjection = await controller.getAspirations(reqSqlInjection);
    assert.equal(responseSqlInjection.success, false);
    assert.equal(responseSqlInjection.statusCode, 400);
    assert.match(responseSqlInjection.message, /pola tidak aman/i);

    // 3.2 Pencarian yang tidak menemukan data (Alternative Flow - Daftar Kosong)
    const reqEmpty = {
      user: academicUser,
      query: { category: 'Dosen' }
    };

    const responseEmpty = await controller.getAspirations(reqEmpty);
    assert.equal(responseEmpty.success, true);
    assert.equal(responseEmpty.data.totalData, 0);
    assert.match(responseEmpty.message, /Belum ada data aspirasi/i);

    // 3.3 Pengguna tidak terautentikasi (user null/undefined)
    const reqUnauthenticated = {
      user: null,
      query: {}
    };

    const responseUnauthenticated = await controller.getAspirations(reqUnauthenticated);
    assert.equal(responseUnauthenticated.success, false);
    assert.equal(responseUnauthenticated.statusCode, 403);
    assert.match(responseUnauthenticated.message, /Autentikasi gagal/i);
  });

});
