import { simulateDelay, simulateRandomFailure } from '../config.js';

/**
 * Mock User API Service
 * Provides dummy data for testing without a real backend
 */
export class MockUserApi {
  constructor() {
    // Simulate some persistent storage
    this.storage = {
      users: new Map(),
      tokens: new Map(),
      resetTokens: new Map(),
    };

    // Create a default test user
    this.initializeTestData();
  }

  /**
   * Initialize test data with sample users
   */
  initializeTestData() {
    const testUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      roles: [
        {
          id: 1,
          name: 'user',
          permissions: [
            { id: 1, name: 'profile.read' },
            { id: 2, name: 'profile.update' },
          ]
        },
        {
          id: 2,
          name: 'admin',
          permissions: [
            { id: 3, name: 'user.manage' },
            { id: 4, name: 'admin.access' },
          ]
        }
      ],
      preferences: {
        darkMode: false,
        emailNotifications: true,
        showActivityFeed: true,
      },
      createdAt: '2024-01-01T00:00:00Z',
      lastLogin: new Date().toISOString(),
    };

    this.storage.users.set('testuser', {
      ...testUser,
      password: 'password123' // In real app, this would be hashed
    });

    // Add more test users
    this.storage.users.set('admin', {
      id: 2,
      username: 'admin',
      email: 'admin@example.com',
      firstName: 'Jane',
      lastName: 'Admin',
      password: 'admin123',
      roles: [
        {
          id: 2,
          name: 'admin',
          permissions: [
            { id: 3, name: 'user.manage' },
            { id: 4, name: 'admin.access' },
            { id: 5, name: 'system.config' },
          ]
        }
      ],
      preferences: {
        darkMode: true,
        emailNotifications: true,
        showActivityFeed: false,
      },
      createdAt: '2023-12-01T00:00:00Z',
      lastLogin: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    });
  }

  /**
   * Generate mock JWT tokens
   */
  generateTokens(user) {
    const accessToken = `mock-access-token-${user.id}-${Date.now()}`;
    const refreshToken = `mock-refresh-token-${user.id}-${Date.now()}`;
    
    this.storage.tokens.set(accessToken, { 
      userId: user.id, 
      type: 'access', 
      expires: Date.now() + 3600000 // 1 hour
    });
    
    this.storage.tokens.set(refreshToken, { 
      userId: user.id, 
      type: 'refresh', 
      expires: Date.now() + 604800000 // 7 days
    });

    return { accessToken, refreshToken };
  }

  /**
   * Simulate API failures randomly
   */
  async simulateApiCall() {
    await simulateDelay();
    
    if (simulateRandomFailure()) {
      throw new Error('Simulated API failure - please try again');
    }
  }

  /**
   * Get user by username (without password)
   */
  getUserByUsername(username) {
    const user = this.storage.users.get(username);
    if (!user) return null;
    
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Get user by email (without password) - for password reset functionality
   */
  getUserByEmail(email) {
    const user = Array.from(this.storage.users.values())
      .find(u => u.email === email);
    if (!user) return null;
    
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Mock login endpoint
   */
  async login(credentials) {
    await this.simulateApiCall();

    const user = this.storage.users.get(credentials.username);
    if (!user || user.password !== credentials.password) {
      throw new Error('Invalid username or password');
    }

    const tokens = this.generateTokens(user);
    const { password, ...userWithoutPassword } = user;

    return {
      ...tokens,
      user: userWithoutPassword
    };
  }

  /**
   * Mock register endpoint
   */
  async register(userData) {
    await this.simulateApiCall();

    // Check if username or email already exists
    if (this.storage.users.has(userData.username)) {
      throw new Error('User already exists with this username');
    }
    
    const emailExists = Array.from(this.storage.users.values())
      .some(user => user.email === userData.email);
    if (emailExists) {
      throw new Error('User already exists with this email');
    }

    const newUser = {
      id: Date.now(),
      username: userData.username,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      password: userData.password,
      roles: [
        {
          id: 1,
          name: 'user',
          permissions: [
            { id: 1, name: 'profile.read' },
            { id: 2, name: 'profile.update' },
          ]
        }
      ],
      preferences: {
        darkMode: false,
        emailNotifications: true,
        showActivityFeed: true,
      },
      createdAt: new Date().toISOString(),
      lastLogin: null,
    };

    this.storage.users.set(userData.username, newUser);

    return { 
      message: 'User registered successfully',
      userId: newUser.id 
    };
  }

  /**
   * Mock token validation
   */
  async validateToken(token) {
    await this.simulateApiCall();

    const tokenData = this.storage.tokens.get(token);
    if (!tokenData || tokenData.expires < Date.now()) {
      throw new Error('Token is invalid or expired');
    }

    const user = Array.from(this.storage.users.values())
      .find(u => u.id === tokenData.userId);

    if (!user) {
      throw new Error('User not found');
    }

    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword };
  }

  /**
   * Mock refresh token
   */
  async refreshToken(refreshToken) {
    await this.simulateApiCall();

    const tokenData = this.storage.tokens.get(refreshToken);
    if (!tokenData || tokenData.type !== 'refresh' || tokenData.expires < Date.now()) {
      throw new Error('Refresh token is invalid or expired');
    }

    const user = Array.from(this.storage.users.values())
      .find(u => u.id === tokenData.userId);

    if (!user) {
      throw new Error('User not found');
    }

    const tokens = this.generateTokens(user);
    const { password, ...userWithoutPassword } = user;

    return {
      accessToken: tokens.accessToken,
      user: userWithoutPassword
    };
  }

  /**
   * Mock logout
   */
  async logout(refreshToken) {
    await this.simulateDelay();

    // Remove tokens from storage
    this.storage.tokens.delete(refreshToken);
    
    return { message: 'Logged out successfully' };
  }

  /**
   * Mock forgot password
   */
  async forgotPassword(email) {
    await this.simulateApiCall();

    const user = this.getUserByEmail(email);
    if (!user) {
      // Don't reveal if user exists or not
      return { message: 'If an account exists with this email, you will receive reset instructions.' };
    }

    const resetToken = `reset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.storage.resetTokens.set(resetToken, {
      userId: user.id,
      expires: Date.now() + 86400000 // 24 hours
    });

    return { 
      message: 'Password reset instructions sent to your email',
      resetToken // In real app, this would be sent via email
    };
  }

  /**
   * Mock reset password
   */
  async resetPassword(resetData) {
    await this.simulateApiCall();

    const tokenData = this.storage.resetTokens.get(resetData.token);
    if (!tokenData || tokenData.expires < Date.now()) {
      const error = new Error('Reset token is invalid or expired');
      error.status = 410; // Gone
      throw error;
    }

    const user = Array.from(this.storage.users.values())
      .find(u => u.id === tokenData.userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Update password
    user.password = resetData.password;
    this.storage.users.set(user.email, user);

    // Remove used reset token
    this.storage.resetTokens.delete(resetData.token);

    return { message: 'Password reset successfully' };
  }

  /**
   * Mock get profile
   */
  async getProfile() {
    await this.simulateApiCall();

    // In a real app, you'd get user from token
    const user = this.getUserByUsername('testuser');
    return user;
  }

  /**
   * Mock update profile
   */
  async updateProfile(profileData) {
    await this.simulateApiCall();

    const user = this.storage.users.get('testuser');
    if (!user) {
      throw new Error('User not found');
    }

    // Update user data
    Object.assign(user, profileData);
    this.storage.users.set(user.username, user);

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Mock change password
   */
  async changePassword(passwordData) {
    await this.simulateApiCall();

    const user = this.storage.users.get('testuser');
    if (!user || user.password !== passwordData.currentPassword) {
      throw new Error('Current password is incorrect');
    }

    user.password = passwordData.newPassword;
    this.storage.users.set(user.username, user);

    return { message: 'Password changed successfully' };
  }

  /**
   * Mock get roles and permissions
   */
  async getRolesAndPermissions() {
    await this.simulateApiCall();

    const user = this.getUserByUsername('testuser');
    return {
      roles: user?.roles || [],
      permissions: user?.roles?.flatMap(role => role.permissions) || []
    };
  }

  /**
   * Mock delete account
   */
  async deleteAccount(confirmationData) {
    await this.simulateApiCall();

    const user = this.storage.users.get('testuser');
    if (!user || user.password !== confirmationData.password) {
      throw new Error('Password confirmation failed');
    }

    this.storage.users.delete('testuser');
    return { message: 'Account deleted successfully' };
  }

  /**
   * Mock activity log
   */
  async getActivityLog(params = {}) {
    await this.simulateApiCall();

    const mockActivities = [
      {
        id: 1,
        action: 'login',
        timestamp: new Date().toISOString(),
        ipAddress: '127.0.0.1',
        userAgent: navigator.userAgent,
      },
      {
        id: 2,
        action: 'profile_update',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        ipAddress: '127.0.0.1',
        userAgent: navigator.userAgent,
      },
    ];

    return {
      activities: mockActivities,
      pagination: {
        page: params.page || 1,
        limit: params.limit || 10,
        total: mockActivities.length,
        totalPages: 1,
      }
    };
  }

  /**
   * Mock update preferences
   */
  async updatePreferences(preferences) {
    await this.simulateApiCall();

    const user = this.storage.users.get('testuser');
    if (!user) {
      throw new Error('User not found');
    }

    user.preferences = { ...user.preferences, ...preferences };
    this.storage.users.set(user.username, user);

    return user.preferences;
  }

  /**
   * Mock get preferences
   */
  async getPreferences() {
    await this.simulateApiCall();

    const user = this.getUserByUsername('testuser');
    return user?.preferences || {};
  }
}
