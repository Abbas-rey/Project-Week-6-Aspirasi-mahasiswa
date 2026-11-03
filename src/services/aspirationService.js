import { AspirationRepository } from '../repositories/aspirationRepository.js';
import { 
  validateAcademicAuthorization, 
  validateAspirationFilter 
} from '../utils/aspirationValidator.js';

/**
 * Service layer orchestrating business logic for viewing aspirations.
 */
export class AspirationService {
  constructor(aspirationRepository = new AspirationRepository()) {
    this.aspirationRepository = aspirationRepository;
  }

  /**
   * Masks student identity if the aspiration was submitted anonymously.
   * Pure function to adhere to DRY and SRP.
   * @param {Object} aspiration
   * @returns {Object}
   */
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

  /**
   * Main business flow for FR-7: Academic viewing aspiration list.
   * @param {Object} currentUser
   * @param {Object} rawFilters
   * @returns {{ success: boolean, statusCode: number, message: string, data?: Object }}
   */
  getAcademicAspirations(currentUser, rawFilters = {}) {
    // 1. Authorization check
    const authResult = validateAcademicAuthorization(currentUser);
    if (!authResult.isValid) {
      return {
        success: false,
        statusCode: 403,
        message: authResult.message
      };
    }

    // 2. Input validation & sanitization
    const filterResult = validateAspirationFilter(rawFilters);
    if (!filterResult.isValid) {
      return {
        success: false,
        statusCode: 400,
        message: filterResult.message
      };
    }

    // 3. Data retrieval from repository
    const rawAspirations = this.aspirationRepository.findAllWithDetails(filterResult.sanitizedFilter);

    // 4. Anonymization & formatting (DRY / SRP)
    const formattedAspirations = rawAspirations.map((item) => this.maskAnonymousIdentity(item));

    // 5. Response generation
    const responsePayload = {
      totalData: formattedAspirations.length,
      appliedFilters: filterResult.sanitizedFilter,
      aspirations: formattedAspirations
    };

    if (formattedAspirations.length === 0) {
      return {
        success: true,
        statusCode: 200,
        message: 'Belum ada data aspirasi baru yang sesuai dengan kriteria.',
        data: responsePayload
      };
    }

    return {
      success: true,
      statusCode: 200,
      message: 'Berhasil memuat daftar aspirasi untuk akademisi.',
      data: responsePayload
    };
  }
}
