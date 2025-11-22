import { BaseApi } from '../baseApi.js';

/**
 * Otherlink API Service
 * Handles all otherlink-related API calls to the Symfony backend
 */
export class OtherlinkApi extends BaseApi {
  constructor() {
    super();
  }

  /**
   * Get all otherlinks for the authenticated user with pagination
   * @param {number} page - Page number (1-indexed)
   * @param {number} limit - Number of items per page
   * @param {Object} filters - Optional filters {active, search}
   * @returns {Promise<Object>} - {otherlinks, pagination}
   */
  async getOtherlinks(page = 1, limit = 10, filters = {}) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });

    return this.get(`/otherlinks?${params.toString()}`);
  }

  /**
   * Get recent otherlinks (for dashboard widget)
   * @param {number} limit - Number of otherlinks to retrieve (default 5)
   * @returns {Promise<Object>} - {otherlinks}
   */
  async getRecentOtherlinks(limit = 5) {
    return this.get(`/otherlinks/recent?limit=${limit}`);
  }

  /**
   * Get a specific otherlink by ID
   * @param {string} otherlinkId - The otherlink ID (UUID)
   * @returns {Promise<Object>} - {otherlink}
   */
  async getOtherlink(otherlinkId) {
    return this.get(`/otherlinks/${otherlinkId}`);
  }

  /**
   * Check if a display name is available
   * @param {string} displayName - The display name to check
   * @returns {Promise<Object>} - {available, display_name}
   */
  async checkDisplayName(displayName) {
    return this.get(`/otherlinks/check-display-name/${encodeURIComponent(displayName)}`);
  }

  /**
   * Create a new otherlink
   * @param {Object} otherlinkData - {name, description, active, display_name}
   * @returns {Promise<Object>} - {otherlink}
   */
  async createOtherlink(otherlinkData) {
    return this.post('/otherlinks', otherlinkData);
  }

  /**
   * Update an existing otherlink
   * @param {string} otherlinkId - The otherlink ID (UUID)
   * @param {Object} otherlinkData - {name, description, active}
   * @returns {Promise<Object>} - {otherlink}
   */
  async updateOtherlink(otherlinkId, otherlinkData) {
    return this.put(`/otherlinks/${otherlinkId}`, otherlinkData);
  }

  /**
   * Delete an otherlink
   * @param {string} otherlinkId - The otherlink ID (UUID)
   * @returns {Promise<Object>}
   */
  async deleteOtherlink(otherlinkId) {
    return this.delete(`/otherlinks/${otherlinkId}`);
  }

  /**
   * Get statistics for user's otherlinks
   * @returns {Promise<Object>} - {stats}
   */
  async getOtherlinkStats() {
    return this.get('/otherlinks/stats/summary');
  }

  /**
   * Get collaborators for an otherlink
   * @param {string} otherlinkId - The otherlink ID (UUID)
   * @returns {Promise<Object>} - {collaborators}
   */
  async getCollaborators(otherlinkId) {
    return this.get(`/otherlinks/${otherlinkId}/collaborators`);
  }

  /**
   * Add a collaborator to an otherlink
   * @param {string} otherlinkId - The otherlink ID (UUID)
   * @param {string} userId - The user ID (UUID) to add as collaborator
   * @returns {Promise<Object>}
   */
  async addCollaborator(otherlinkId, userId) {
    return this.post(`/otherlinks/${otherlinkId}/collaborators`, { user_id: userId });
  }

  /**
   * Remove a collaborator from an otherlink
   * @param {string} otherlinkId - The otherlink ID (UUID)
   * @param {string} userId - The user ID (UUID) to remove
   * @returns {Promise<Object>}
   */
  async removeCollaborator(otherlinkId, userId) {
    return this.delete(`/otherlinks/${otherlinkId}/collaborators/${userId}`);
  }

  /**
   * Get links for a specific otherlink
   * @param {string} otherlinkId - The otherlink ID (UUID)
   * @param {number} page - Page number (1-indexed)
   * @param {number} limit - Number of items per page
   * @param {Object} filters - Optional filters {active, link_type, search}
   * @returns {Promise<Object>} - {links, pagination}
   */
  async getOtherlinkLinks(otherlinkId, page = 1, limit = 10, filters = {}) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });

    return this.get(`/links/otherlink/${otherlinkId}?${params.toString()}`);
  }
}

