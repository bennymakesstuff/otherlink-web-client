import { BaseApi } from '../baseApi.js';

/**
 * Real User API Service
 * Handles all user-related API calls to the Symfony backend
 */
export class UserApi extends BaseApi {
  constructor() {
    super();
  }

  /**
   * Authenticate user with username and password
   * @param {Object} credentials - {username, password}
   * @returns {Promise<Object>} - Server response (may contain tokens in various formats)
   */
  async login(credentials) {
    return this.post('/login', credentials);
  }

  /**
   * Register a new user account
   * @param {Object} userData - {email, password, firstName, lastName}
   * @returns {Promise<Object>} - Registration response
   */
  async register(userData) {
    return this.post('/register', userData);
  }

  /**
   * Validate current access token and get user data
   * @param {string} token - Access token to validate
   * @returns {Promise<Object>} - {user}
   */
  async validateToken(token) {
    return this.post('/token/validate', {}, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }

  /**
   * Refresh access token using refresh token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} - {accessToken, user}
   */
  async refreshToken(refreshToken) {
    return this.post('/token/refresh', { refreshToken });
  }

  /**
   * Logout user and invalidate tokens
   * @param {string} refreshToken - Refresh token to invalidate
   * @returns {Promise<void>}
   */
  async logout(refreshToken) {
    return this.post('/logout', { refreshToken });
  }

  /**
   * Request password reset email
   * @param {string} email - User email address
   * @returns {Promise<Object>} - Reset request response
   */
  async forgotPassword(email) {
    return this.post('/password/forgot', { email });
  }

  /**
   * Reset password using token from email
   * @param {Object} resetData - {token, password}
   * @returns {Promise<Object>} - Reset response
   */
  async resetPassword(resetData) {
    return this.post('/password/reset', resetData);
  }

  /**
   * Get current user profile
   * @returns {Promise<Object>} - User profile data
   */
  async getProfile() {
    return this.get('/user/profile');
  }

  /**
   * Update user profile information
   * @param {Object} profileData - Updated profile data
   * @returns {Promise<Object>} - Updated user data
   */
  async updateProfile(profileData) {
    return this.put('/user/profile', profileData);
  }

  /**
   * Change user password
   * @param {Object} passwordData - {currentPassword, newPassword}
   * @returns {Promise<Object>} - Change password response
   */
  async changePassword(passwordData) {
    return this.post('/user/change-password', passwordData);
  }

  /**
   * Get user's roles and permissions
   * @returns {Promise<Object>} - User roles and permissions
   */
  async getRolesAndPermissions() {
    return this.get('/user/roles-permissions');
  }

  /**
   * Delete user account
   * @param {Object} confirmationData - {password}
   * @returns {Promise<void>}
   */
  async deleteAccount(confirmationData) {
    return this.delete('/user/account', {
      body: JSON.stringify(confirmationData)
    });
  }

  /**
   * Get user activity/audit log
   * @param {Object} params - Query parameters {page, limit, dateFrom, dateTo}
   * @returns {Promise<Object>} - Activity log data
   */
  async getActivityLog(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/user/activity${queryString ? `?${queryString}` : ''}`);
  }

  /**
   * Update user preferences/settings
   * @param {Object} preferences - User preference settings
   * @returns {Promise<Object>} - Updated preferences
   */
  async updatePreferences(preferences) {
    return this.put('/user/preferences', preferences);
  }

  /**
   * Get user preferences/settings
   * @returns {Promise<Object>} - User preferences
   */
  async getPreferences() {
    return this.get('/user/preferences');
  }
}
