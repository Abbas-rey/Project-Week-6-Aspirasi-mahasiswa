# Project-Week-6-Aspirasi-mahasiswa
Arsitektur Project Aspirasi mahasiswa

# Anggota kelompok project
1. Achmad Suva Raihan Abbas (1251420044)
2. Windu Athallah Ahmad (1251420045)
3. Muhamad Fariz Alfachrezi (1251420099)
4. Muhammad Revan Adrian Hadinata (1251420109)

# Deskripsi project 
Aplikasi untuk mewadahi mahasiswa dalam menyampaikan aspirasi terkait Universitas (Sistem Aspirasi Mahasiswa - ASMA).

---

## Tugas Praktik RPL: Software Construction & Good Coding Practices
**Fitur Terpilih:** FR-7 (Melihat daftar aspirasi yang diberikan - Aktor: Akademisi)

### Status Versi: SEBELUM REFACTORING
Pada tahap ini, fitur telah diimplementasikan secara fungsional dalam satu modul awal (`src/aspirationManager.js`), namun teridentifikasi beberapa *code smells* yang perlu ditingkatkan pada tahap *Code Review & Refactoring*:
1. **Pelanggaran DRY:** Penyamaran identitas pelapor anonim masih dilakukan secara manual dengan *looping* yang berulang.
2. **Ketiadaan Validasi Input Terpisah:** Filter query belum diverifikasi terhadap *whitelist enum* status dan kategori, serta belum memiliki proteksi karakter berbahaya (anti-SQL Injection).
3. **Pelanggaran Single Responsibility Principle:** Fungsi `getAspirationsController` bersifat monolitik (*god function*) karena mencampurkan otorisasi, penarikan data, filter kriteria, penyamaran identitas, dan format respons.

Tahap berikutnya akan dilakukan *refactoring* modular dan penambahan pengujian komprehensif.
