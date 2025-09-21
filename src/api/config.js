// API Configuration
export const API_CONFIG = {
  // Set to 'mock' for testing with dummy data, 'real' for actual API calls
  MODE: 'real', // Change this to 'real' when connecting to your Symfony server
  
  // Real API settings
  REAL_API: {
    BASE_URL: 'http://localhost:8000/api',
    TIMEOUT: 10000, // 10 seconds
  },
  
  // Mock API settings  
  MOCK_API: {
    SIMULATE_DELAY: true,
    MIN_DELAY: 500,  // Minimum delay in ms
    MAX_DELAY: 1500, // Maximum delay in ms
    FAILURE_RATE: 0.1, // 10% chance of simulated failures
  }
};

// Helper function to get current API mode
export const isMockMode = () => API_CONFIG.MODE === 'mock';
export const isRealMode = () => API_CONFIG.MODE === 'real';

// Helper function to get API base URL
export const getApiBaseUrl = () => {
  return isRealMode() ? API_CONFIG.REAL_API.BASE_URL : null;
};

// Helper function to simulate network delay in mock mode
export const simulateDelay = async () => {
  if (!isMockMode() || !API_CONFIG.MOCK_API.SIMULATE_DELAY) return;
  
  const delay = Math.random() * 
    (API_CONFIG.MOCK_API.MAX_DELAY - API_CONFIG.MOCK_API.MIN_DELAY) + 
    API_CONFIG.MOCK_API.MIN_DELAY;
    
  await new Promise(resolve => setTimeout(resolve, delay));
};

// Helper function to simulate random failures in mock mode
export const simulateRandomFailure = () => {
  if (!isMockMode()) return false;
  return Math.random() < API_CONFIG.MOCK_API.FAILURE_RATE;
};
