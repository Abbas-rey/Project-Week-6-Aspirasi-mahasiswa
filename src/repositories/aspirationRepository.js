import { mockAspirations, mockCategories, mockUsers } from '../data/mockDatabase.js';

/**
 * Repository layer for querying aspiration data.
 */
export class AspirationRepository {
  constructor(aspirations = mockAspirations, categories = mockCategories, users = mockUsers) {
    this.aspirations = aspirations;
    this.categories = categories;
    this.users = users;
  }

  /**
   * Retrieves all aspirations joined with category and submitter information.
   * @param {Object} filter
   * @returns {Array<Object>}
   */
  findAllWithDetails(filter = {}) {
    const { status, category, searchKeyword } = filter;

    return this.aspirations
      .map((aspiration) => {
        const categoryData = this.categories.find((c) => c.categoryId === aspiration.categoryId);
        const studentData = this.users.find((u) => u.userId === aspiration.studentId);

        return {
          aspirationId: aspiration.aspirationId,
          title: aspiration.title,
          categoryName: categoryData ? categoryData.categoryName : 'Umum',
          incidentDetail: aspiration.incidentDetail,
          incidentDate: aspiration.incidentDate,
          incidentTime: aspiration.incidentTime,
          isAnonymous: aspiration.isAnonymous,
          status: aspiration.status,
          createdAt: aspiration.createdAt,
          submitter: {
            studentId: studentData ? studentData.userId : null,
            fullName: studentData ? studentData.fullName : 'Tidak Diketahui',
            nim: studentData ? studentData.nim : '-'
          }
        };
      })
      .filter((item) => {
        if (status && item.status !== status) {
          return false;
        }

        if (category && item.categoryName.toLowerCase() !== category.toLowerCase()) {
          return false;
        }

        if (searchKeyword) {
          const keyword = searchKeyword.toLowerCase();
          const matchTitle = item.title.toLowerCase().includes(keyword);
          const matchDetail = item.incidentDetail.toLowerCase().includes(keyword);
          if (!matchTitle && !matchDetail) {
            return false;
          }
        }

        return true;
      });
  }
}
