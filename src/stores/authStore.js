import { createSignal } from 'solid-js';
import { API } from '../api/index.js';

// Token management
const [accessToken, setAccessToken] = createSignal(localStorage.getItem('accessToken'));
const [refreshToken, setRefreshToken] = createSignal(localStorage.getItem('refreshToken'));
const [user, setUser] = createSignal(null);
const [isLoading, setIsLoading] = createSignal(false);

// Auth store functions
export const authStore = {
  // Getters
  get accessToken() { return accessToken(); },
  get refreshToken() { return refreshToken(); },
  get user() { return user(); },
  get isLoading() { return isLoading(); },
  get isAuthenticated() { return !!accessToken() && !!user(); },

  // Check if user has specific role
  hasRole(roleName) {
    const currentUser = user();
    return currentUser?.roles?.some(role => role.name === roleName) || false;
  },

  // Check if user has specific permission
  hasPermission(permissionName) {
    const currentUser = user();
    if (!currentUser?.roles) return false;
    
    return currentUser.roles.some(role => 
      role.permissions?.some(permission => permission.name === permissionName)
    );
  },

  // Authentication methods
  async login(credentials) {
    setIsLoading(true);
    try {
      const response = await API.user.login(credentials);
      
      // Handle response format: Symfony server format
      let accessToken, refreshToken, user;
      
      if (response.data && response.data.tokens) {
        // Server responds with { data: { tokens: { access_token: '...', refresh_token: '...' }, user: {...} } }
        accessToken = response.data.tokens.access_token;
        refreshToken = response.data.tokens.refresh_token;
        user = response.data.user;
      } else if (response.tokens) {
        // Alternative format: { tokens: { access_token: '...', refresh_token: '...' }, user: {...} }
        accessToken = response.tokens.access_token || response.tokens.access;
        refreshToken = response.tokens.refresh_token || response.tokens.refresh;
        user = response.user;
      } else {
        // Fallback to direct properties (mock API format)
        accessToken = response.accessToken;
        refreshToken = response.refreshToken;
        user = response.user;
      }
      
      if (!accessToken || !refreshToken) {
        throw new Error('Invalid response: missing tokens');
      }
      
      setAccessToken(accessToken);
      setRefreshToken(refreshToken);
      setUser(user);
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  },

  async logout() {
    setIsLoading(true);
    try {
      const currentRefreshToken = refreshToken();
      if (currentRefreshToken) {
        await API.user.logout(currentRefreshToken);
      }
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);
      
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      setIsLoading(false);
    }
  },

  async validateAndRefresh() {
    const currentAccessToken = accessToken();
    const currentRefreshToken = refreshToken();
    
    if (!currentAccessToken || !currentRefreshToken) {
      this.logout();
      return false;
    }

    setIsLoading(true);
    try {
      // Try to validate current access token
      const response = await API.user.validateToken(currentAccessToken);
      
      // Handle validation response format (might be different from login)
      let validatedUser;
      if (response.data && response.data.user) {
        validatedUser = response.data.user;
      } else if (response.user) {
        validatedUser = response.user;
      } else {
        validatedUser = response; // Fallback if response is the user object directly
      }
      
      if (validatedUser) {
        setUser(validatedUser);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      // Access token is invalid, try to refresh
      try {
        const refreshResponse = await API.user.refreshToken(currentRefreshToken);
        
        // Handle refresh response format similar to login
        let newAccessToken, newUser;
        
        if (refreshResponse.data && refreshResponse.data.tokens) {
          // Symfony server format
          newAccessToken = refreshResponse.data.tokens.access_token;
          newUser = refreshResponse.data.user;
        } else if (refreshResponse.tokens) {
          // Alternative format
          newAccessToken = refreshResponse.tokens.access_token || refreshResponse.tokens.access;
          newUser = refreshResponse.user;
        } else {
          // Fallback format
          newAccessToken = refreshResponse.accessToken;
          newUser = refreshResponse.user;
        }
        
        if (newAccessToken) {
          setAccessToken(newAccessToken);
          localStorage.setItem('accessToken', newAccessToken);
          if (newUser) {
            setUser(newUser);
          }
          return true;
        } else {
          throw new Error('No access token in refresh response');
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        this.logout();
        return false;
      }
    } finally {
      setIsLoading(false);
    }
  },

  // Initialize auth state on app start
  async initialize() {
    const token = localStorage.getItem('accessToken');
    const refresh = localStorage.getItem('refreshToken');
    
    if (token && refresh) {
      setAccessToken(token);
      setRefreshToken(refresh);
      return await this.validateAndRefresh();
    }
    
    return false;
  },
};
