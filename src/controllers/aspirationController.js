import { AspirationService } from '../services/aspirationService.js';

/**
 * Controller handling incoming requests for viewing aspirations.
 */
export class AspirationController {
  constructor(aspirationService = new AspirationService()) {
    this.aspirationService = aspirationService;
  }

  /**
   * Handles request to retrieve list of aspirations for academics.
   * @param {Object} req - Request object containing user and query params
   * @param {Object} res - Response mock or handler
   * @returns {Object} JSON response
   */
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
