import { userRoles, aspirationStatuses, aspirationCategories } from '../constants/appConstants.js';

/**
 * Validates whether the requesting user has the authority to view academic aspirations.
 * @param {Object} currentUser
 * @returns {{ isValid: boolean, message?: string }}
 */
export function validateAcademicAuthorization(currentUser) {
  if (!currentUser || typeof currentUser !== 'object') {
    return { isValid: false, message: 'Autentikasi gagal: Informasi pengguna tidak ditemukan.' };
  }

  if (currentUser.role !== userRoles.AKADEMISI) {
    return { 
      isValid: false, 
      message: 'Akses ditolak: Hanya pihak Akademisi (Dosen / Kaprodi) yang memiliki hak akses melihat daftar aspirasi ini.' 
    };
  }

  return { isValid: true };
}

/**
 * Validates and sanitizes filter parameters for listing aspirations.
 * @param {Object} filterParams
 * @returns {{ isValid: boolean, sanitizedFilter?: Object, message?: string }}
 */
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
    
    // Guard against SQL injection-like malicious character patterns
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
