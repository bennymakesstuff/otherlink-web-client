import { BaseApi } from '../baseApi.js';

/**
 * Link API Service
 * Handles all link-related API calls to the Symfony backend
 */
export class LinkApi extends BaseApi {
  constructor() {
    super();
  }

  /**
   * Get all links for a specific otherlink with pagination
   * @param {string} otherlinkId - The otherlink ID (UUID)
   * @param {number} page - Page number (1-indexed)
   * @param {number} limit - Number of items per page
   * @param {Object} filters - Optional filters {active, link_type, search}
   * @returns {Promise<Object>} - {links, pagination}
   */
  async getLinks(otherlinkId, page = 1, limit = 10, filters = {}) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });

    return this.get(`/links/otherlink/${otherlinkId}?${params.toString()}`);
  }

  /**
   * Get recent links for a specific otherlink (for dashboard widget)
   * @param {string} otherlinkId - The otherlink ID (UUID)
   * @param {number} limit - Number of links to retrieve (default 5)
   * @returns {Promise<Object>} - {links}
   */
  async getRecentLinks(otherlinkId, limit = 5) {
    return this.get(`/links/otherlink/${otherlinkId}/recent?limit=${limit}`);
  }

  /**
   * Get a specific link by ID
   * @param {string} otherlinkId - The otherlink ID (UUID)
   * @param {string} linkId - The link ID (UUID)
   * @returns {Promise<Object>} - {link}
   */
  async getLink(otherlinkId, linkId) {
    return this.get(`/links/otherlink/${otherlinkId}/${linkId}`);
  }

  /**
   * Create a new link
   * @param {string} otherlinkId - The otherlink ID (UUID)
   * @param {Object} linkData - {name, description, shortcode, url, link_type, active}
   * @returns {Promise<Object>} - {link}
   */
  async createLink(otherlinkId, linkData) {
    return this.post(`/links/otherlink/${otherlinkId}`, linkData);
  }

  /**
   * Update an existing link
   * @param {string} otherlinkId - The otherlink ID (UUID)
   * @param {string} linkId - The link ID (UUID)
   * @param {Object} linkData - Fields to update
   * @returns {Promise<Object>} - {link}
   */
  async updateLink(otherlinkId, linkId, linkData) {
    return this.put(`/links/otherlink/${otherlinkId}/${linkId}`, linkData);
  }

  /**
   * Delete a link
   * @param {string} otherlinkId - The otherlink ID (UUID)
   * @param {string} linkId - The link ID (UUID)
   * @returns {Promise<Object>} - Success response
   */
  async deleteLink(otherlinkId, linkId) {
    return this.delete(`/links/otherlink/${otherlinkId}/${linkId}`);
  }

  /**
   * Check if a shortcode is available within an otherlink
   * @param {string} otherlinkId - The otherlink ID (UUID)
   * @param {string} shortcode - The shortcode to check
   * @param {string} excludeLinkId - Optional link ID to exclude from check (for editing)
   * @returns {Promise<Object>} - {shortcode, available}
   */
  async checkShortcode(otherlinkId, shortcode, excludeLinkId = null) {
    const params = excludeLinkId ? `?exclude=${excludeLinkId}` : '';
    return this.get(`/links/otherlink/${otherlinkId}/check-shortcode/${shortcode}${params}`);
  }

  /**
   * Generate a unique shortcode for an otherlink
   * @param {string} otherlinkId - The otherlink ID (UUID)
   * @returns {Promise<Object>} - {shortcode}
   */
  async generateShortcode(otherlinkId) {
    return this.post(`/links/otherlink/${otherlinkId}/generate-shortcode`, {});
  }

  /**
   * Get link statistics for a specific otherlink
   * @param {string} otherlinkId - The otherlink ID (UUID)
   * @returns {Promise<Object>} - {stats: {total, active, inactive, by_type}}
   */
  async getLinkStats(otherlinkId) {
    return this.get(`/links/otherlink/${otherlinkId}/stats`);
  }
}

