/**
 * OAuth Configuration
 * 
 * Update these values with your actual OAuth provider credentials.
 * You can get these from:
 * - Google: https://console.developers.google.com/
 * - Apple: https://developer.apple.com/account/resources/identifiers/list/serviceId
 */

export const OAUTH_CONFIG = {
  GOOGLE: {
    CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || null,
    // Optional: restrict to specific domains
    HOSTED_DOMAIN: import.meta.env.VITE_GOOGLE_HOSTED_DOMAIN || null,
  },
  
  APPLE: {
    CLIENT_ID: import.meta.env.VITE_APPLE_CLIENT_ID || null,
    REDIRECT_URI: import.meta.env.VITE_APPLE_REDIRECT_URI || window.location.origin,
    // Optional: Apple team ID
    TEAM_ID: import.meta.env.VITE_APPLE_TEAM_ID || null,
  }
};

/**
 * Check if OAuth provider is properly configured
 */
export const isOAuthConfigured = (provider) => {
  switch (provider.toLowerCase()) {
    case 'google':
      return OAUTH_CONFIG.GOOGLE.CLIENT_ID && 
             OAUTH_CONFIG.GOOGLE.CLIENT_ID !== 'null' &&
             OAUTH_CONFIG.GOOGLE.CLIENT_ID.trim() !== '';
    
    case 'apple':
      return OAUTH_CONFIG.APPLE.CLIENT_ID && 
             OAUTH_CONFIG.APPLE.CLIENT_ID !== 'null' &&
             OAUTH_CONFIG.APPLE.CLIENT_ID.trim() !== '';
    
    default:
      return false;
  }
};

/**
 * Check if any OAuth providers are configured
 */
export const isAnyOAuthConfigured = () => {
  return isOAuthConfigured('google') || isOAuthConfigured('apple');
};

/**
 * Get list of configured OAuth providers
 */
export const getConfiguredProviders = () => {
  const providers = [];
  if (isOAuthConfigured('google')) providers.push('google');
  if (isOAuthConfigured('apple')) providers.push('apple');
  return providers;
};

/**
 * Get OAuth configuration for a provider
 */
export const getOAuthConfig = (provider) => {
  switch (provider.toLowerCase()) {
    case 'google':
      return OAUTH_CONFIG.GOOGLE;
    
    case 'apple':
      return OAUTH_CONFIG.APPLE;
    
    default:
      return null;
  }
};
