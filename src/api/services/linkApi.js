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
   * Get recent links for dashboard widget (global, not per-otherlink)
   * @param {number} limit - Number of links to retrieve (default 5)
   * @returns {Promise<Object>} - {links}
   */
  async getRecentLinks(limit = 5) {
    return this.get(`/links/recent?limit=${limit}`);
  }

  /**
   * Get a specific link by ID
   * @param {string} linkId - The link ID (UUID)
   * @returns {Promise<Object>} - {link}
   */
  async getLink(linkId) {
    return this.get(`/links/${linkId}`);
  }

  /**
   * Create a new link
   * @param {Object} linkData - {name, description, shortcode, url, link_type, active, otherlink_id}
   * @returns {Promise<Object>} - {link}
   */
  async createLink(linkData) {
    return this.post(`/links`, linkData);
  }

  /**
   * Update an existing link
   * @param {string} linkId - The link ID (UUID)
   * @param {Object} linkData - Fields to update
   * @returns {Promise<Object>} - {link}
   */
  async updateLink(linkId, linkData) {
    return this.put(`/links/${linkId}`, linkData);
  }

  /**
   * Delete a link
   * @param {string} linkId - The link ID (UUID)
   * @returns {Promise<Object>} - Success response
   */
  async deleteLink(linkId) {
    return this.delete(`/links/${linkId}`);
  }

  /**
   * Check if a shortcode is available (global, not per-otherlink)
   * @param {string} shortcode - The shortcode to check
   * @param {string} excludeLinkId - Optional link ID to exclude from check (for editing)
   * @returns {Promise<Object>} - {shortcode, available}
   */
  async checkShortcode(shortcode, excludeLinkId = null) {
    const params = excludeLinkId ? `?exclude=${excludeLinkId}` : '';
    return this.get(`/links/shortcode/${shortcode}${params}`);
  }

  /**
   * Generate a unique shortcode from a name
   * @param {string} name - The name to generate shortcode from
   * @returns {Promise<Object>} - {shortcode}
   */
  async generateShortcode(name) {
    return this.post(`/links/generate-shortcode`, { name });
  }

  /**
   * Get link statistics for the user
   * @returns {Promise<Object>} - {stats: {total, active, inactive, by_type}}
   */
  async getLinkStats() {
    return this.get(`/links/stats/summary`);
  }
}
