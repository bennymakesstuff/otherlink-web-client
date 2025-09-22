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
   * Request password reset
   * @param {string} username - User's username
   * @returns {Promise<Object>} - Reset request response
   */
  async forgotPassword(username) {
    return this.post('/password/forgot', { username });
  }

  /**
   * Validate password reset token
   * @param {string} token - Reset token
   * @returns {Promise<Object>} - Validation response
   */
  async validateResetToken(token) {
    return this.post('/password/reset/validate', { token });
  }

  /**
   * Complete password reset using validated token
   * @param {Object} resetData - {token, password, password_confirm}
   * @returns {Promise<Object>} - Reset response
   */
  async completePasswordReset(resetData) {
    return this.post('/password/reset/complete', resetData);
  }

  /**
   * Reset password using token from email (legacy method)
   * @param {Object} resetData - {token, password}
   * @returns {Promise<Object>} - Reset response
   */
  async resetPassword(resetData) {
    return this.post('/password/reset', resetData);
  }

  /**
   * Verify email address with token
   * @param {string} token - Email verification token
   * @returns {Promise<Object>} - Verification response
   */
  async verifyEmail(token) {
    return this.post('/email/verify', { token });
  }

  /**
   * Verify 2FA code
   * @param {Object} verificationData - {session_id, code}
   * @returns {Promise<Object>} - Verification response with tokens
   */
  async verify2FA(verificationData) {
    return this.post('/2fa/verify', verificationData);
  }

  /**
   * Resend 2FA code
   * @param {string} sessionId - 2FA session ID
   * @returns {Promise<Object>} - Resend response
   */
  async resend2FA(sessionId) {
    return this.post('/2fa/resend', { session_id: sessionId });
  }

  /**
   * Get 2FA status for current user
   * @returns {Promise<Object>} - 2FA status response
   */
  async get2FAStatus() {
    return this.get('/2fa/status');
  }

  /**
   * Enable 2FA for current user
   * @returns {Promise<Object>} - Enable response
   */
  async enable2FA() {
    return this.post('/2fa/enable');
  }

  /**
   * Disable 2FA for current user
   * @returns {Promise<Object>} - Disable response
   */
  async disable2FA() {
    return this.post('/2fa/disable');
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
   * @param {Object} profileData - {first_name, last_name}
   * @returns {Promise<Object>} - Updated user data
   */
  async updateProfile(profileData) {
    return this.post('/user/profile', profileData);
  }

  /**
   * Change user password
   * @param {Object} passwordData - {current_password, new_password, confirm_password}
   * @returns {Promise<Object>} - Change password response
   */
  async changePassword(passwordData) {
    return this.post('/password/change', passwordData);
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

  // Session Management
  
  /**
   * Get all user sessions
   * @returns {Promise<Object>} - List of user sessions
   */
  async getSessions() {
    return this.get('/user/sessions');
  }

  /**
   * Revoke all sessions except current
   * @returns {Promise<Object>} - Success response
   */
  async revokeAllSessions() {
    return this.post('/user/sessions/revoke-all');
  }

  /**
   * Revoke a specific session by session ID
   * @param {number} sessionId - The session ID to revoke
   * @param {string} currentRefreshToken - The current refresh token for authentication
   * @returns {Promise<Object>} - Success response
   */
  async revokeSession(sessionId, currentRefreshToken) {
    return this.post('/token/revoke', { 
      session_id: sessionId,
      refresh_token: currentRefreshToken
    });
  }
}
