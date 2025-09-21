import { isMockMode } from './config.js';
import { UserApi } from './services/userApi.js';
import { MockUserApi } from './services/userApi.mock.js';

/**
 * Root API class that provides access to all API services
 * Automatically switches between real and mock APIs based on configuration
 */
class ApiManager {
  constructor() {
    this.initializeServices();
  }

  /**
   * Initialize API services based on current mode
   */
  initializeServices() {
    // User API service
    this.user = isMockMode() ? new MockUserApi() : new UserApi();
    
    // Future services can be added here, e.g.:
    // this.admin = isMockMode() ? new MockAdminApi() : new AdminApi();
    // this.notifications = isMockMode() ? new MockNotificationApi() : new NotificationApi();
    // this.files = isMockMode() ? new MockFileApi() : new FileApi();
  }

  /**
   * Reinitialize services (useful for switching modes at runtime)
   */
  reinitialize() {
    this.initializeServices();
  }

  /**
   * Get current API mode
   */
  getMode() {
    return isMockMode() ? 'mock' : 'real';
  }

  /**
   * Check if we're in mock mode
   */
  isMock() {
    return isMockMode();
  }

  /**
   * Check if we're in real mode  
   */
  isReal() {
    return !isMockMode();
  }

  /**
   * Helper method to get mock data (only available in mock mode)
   */
  getMockData() {
    if (!this.isMock()) {
      console.warn('getMockData() is only available in mock mode');
      return null;
    }

    return {
      testUsers: [
        { username: 'testuser', password: 'password123', role: 'user' },
        { username: 'admin', password: 'admin123', role: 'admin' },
      ],
      sampleResetToken: 'reset-sample-token-123',
    };
  }
}

// Create and export a singleton instance
export const API = new ApiManager();

// Export the class for testing purposes
export { ApiManager };

// Export configuration helpers
export { API_CONFIG, isMockMode, isRealMode } from './config.js';

// Export individual service classes for advanced usage
export { UserApi } from './services/userApi.js';
export { MockUserApi } from './services/userApi.mock.js';
