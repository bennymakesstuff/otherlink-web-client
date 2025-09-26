import { BaseApi } from '../baseApi.js';
import { isRealMode, API_CONFIG } from '../config.js';

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

  // OAuth Authentication
  
  /**
   * Authenticate user with Google ID token
   * @param {string} idToken - Google ID token
   * @returns {Promise<Object>} - Authentication response with tokens
   */
  async googleAuth(idToken) {
    return this.post('/auth/google', { id_token: idToken });
  }

  /**
   * Authenticate user with Apple ID token
   * @param {string} idToken - Apple ID token
   * @param {string} authorizationCode - Apple authorization code (optional)
   * @returns {Promise<Object>} - Authentication response with tokens
   */
  async appleAuth(idToken, authorizationCode = null) {
    const payload = { id_token: idToken };
    if (authorizationCode) {
      payload.authorization_code = authorizationCode;
    }
    return this.post('/auth/apple', payload);
  }

  /**
   * Link OAuth account to existing user
   * @param {Object} linkData - {provider, id_token, existing_password}
   * @returns {Promise<Object>} - Link response
   */
  async linkOAuthAccount(linkData) {
    return this.post('/auth/oauth/link', linkData);
  }

  /**
   * Unlink OAuth account from user
   * @param {string} provider - OAuth provider (google, apple)
   * @returns {Promise<Object>} - Unlink response
   */
  async unlinkOAuthAccount(provider) {
    return this.delete(`/auth/oauth/unlink/${provider}`);
  }

  /**
   * Get list of connected OAuth providers for current user
   * @returns {Promise<Object>} - List of connected providers
   */
  async getOAuthProviders() {
    return this.get('/auth/oauth/providers');
  }

  /**
   * Get user's OAuth account connections
   * @returns {Promise<Object>} - List of OAuth accounts
   */
  async getOAuthAccounts() {
    return this.get('/user/oauth-accounts');
  }

  /**
   * Remove OAuth connection for specific provider
   * @param {string} provider - OAuth provider to remove
   * @returns {Promise<Object>} - Removal response
   */
  async removeOAuthConnection(provider) {
    return this.delete(`/user/oauth-accounts/${provider}`);
  }

  // Avatar Management
  
  /**
   * Upload user avatar image
   * @param {File} avatarFile - Image file to upload
   * @returns {Promise<Object>} - Upload response with avatar data
   */
  async uploadAvatar(avatarFile) {
    if (!isRealMode()) {
      throw new Error('BaseApi.uploadAvatar should only be used in real API mode');
    }

    const formData = new FormData();
    formData.append('avatar', avatarFile);
    
    // Try adding category field (common requirement for file upload endpoints)
    formData.append('category', 'avatar');
    formData.append('is_public', true);
    formData.append('description', 'image');
    formData.append('alt_text', 'image');
    formData.append('check_duplicates', false);

    const url = `${this.baseUrl}/files/upload/avatar`;
    
    // Use fetch directly to avoid automatic Content-Type setting
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.REAL_API.TIMEOUT);

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          // Only include auth headers, NO Content-Type for FormData
          ...this.getAuthHeaders(),
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorData = {};
        try {
          errorData = await response.json();
        } catch (e) {
          // Response might not be JSON
        }
        
        const error = new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        error.status = response.status;
        error.statusText = response.statusText;
        error.data = errorData;
        throw error;
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        return null;
      }
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      
      throw error;
    }
  }

  /**
   * Upload user avatar with custom parameters (for testing)
   * @param {File} avatarFile - Image file to upload
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} - Upload response with avatar data
   */
  async uploadAvatarTest(avatarFile, options = {}) {
    if (!isRealMode()) {
      throw new Error('BaseApi.uploadAvatarTest should only be used in real API mode');
    }

    const {
      fieldName = 'avatar',
      category = null,
      type = null,
      fileType = null,
      includeMetadata = false
    } = options;

    const formData = new FormData();
    formData.append(fieldName, avatarFile);
    
    // Conditionally add category fields
    if (category) formData.append('category', category);
    if (type) formData.append('type', type);
    if (fileType) formData.append('file_type', fileType);
    
    // Add metadata if requested
    if (includeMetadata) {
      formData.append('filename', avatarFile.name);
      formData.append('mime_type', avatarFile.type);
      formData.append('file_size', avatarFile.size.toString());
    }

    // Debug logging
    console.log(`FormData contents (testing with options):`, options);
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    const url = `${this.baseUrl}/files/upload/avatar`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.REAL_API.TIMEOUT);

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          ...this.getAuthHeaders(),
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorData = {};
        try {
          errorData = await response.json();
        } catch (e) {
          // Response might not be JSON
        }
        
        const error = new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        error.status = response.status;
        error.statusText = response.statusText;
        error.data = errorData;
        throw error;
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        return null;
      }
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      
      throw error;
    }
  }

  /**
   * Upload user avatar with alternative field name (for testing)
   * @param {File} avatarFile - Image file to upload
   * @param {string} fieldName - Field name to use (default: 'avatar')
   * @returns {Promise<Object>} - Upload response with avatar data
   */
  async uploadAvatarWithFieldName(avatarFile, fieldName = 'avatar') {
    if (!isRealMode()) {
      throw new Error('BaseApi.uploadAvatarWithFieldName should only be used in real API mode');
    }

    const formData = new FormData();
    formData.append(fieldName, avatarFile);

    // Debug logging
    console.log(`FormData contents (field: ${fieldName}):`);
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    const url = `${this.baseUrl}/files/upload/avatar`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.REAL_API.TIMEOUT);

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          ...this.getAuthHeaders(),
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorData = {};
        try {
          errorData = await response.json();
        } catch (e) {
          // Response might not be JSON
        }
        
        const error = new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        error.status = response.status;
        error.statusText = response.statusText;
        error.data = errorData;
        throw error;
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        return null;
      }
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      
      throw error;
    }
  }

  /**
   * Remove user avatar
   * @param {boolean} deleteFile - Whether to delete the file from storage
   * @returns {Promise<Object>} - Removal response
   */
  async removeAvatar(deleteFile = true) {
    return this.delete(`/files/avatar?delete_file=${deleteFile}`);
  }

  /**
   * Get user profile with avatar information
   * @returns {Promise<Object>} - User profile including avatar data
   */
  async getUserProfile() {
    return this.get('/user/profile');
  }
}
