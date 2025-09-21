# API Structure Documentation

## Overview

This API structure provides a clean, modular way to manage API calls with easy switching between real and mock APIs for testing.

## Usage

### Basic Usage

```javascript
import { API } from '../api/index.js';

// Login user
const response = await API.user.login({
  username: 'testuser',
  password: 'password123'
});

// Register user
await API.user.register({
  email: 'new@example.com',
  password: 'newpassword',
  firstName: 'John',
  lastName: 'Doe'
});

// Update profile
const updatedUser = await API.user.updateProfile({
  firstName: 'Jane',
  email: 'jane@example.com'
});

// Response format from login:
{
  "data": {
    "tokens": {
      "access_token": "jwt-access-token...",
      "refresh_token": "jwt-refresh-token..."
    },
    "user": {
      "id": 1,
      "username": "testuser",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

## Switching Between Real and Mock APIs

### Configuration

Edit `src/api/config.js`:

```javascript
export const API_CONFIG = {
  MODE: 'mock', // Change to 'real' for production API calls
  // ... other config
};
```

**Current Mode**: `mock` (perfect for development and testing)

### Modes

- **Mock Mode** (`'mock'`)
  - Uses dummy data for testing
  - Simulates network delays and random failures
  - No real HTTP requests
  - Perfect for development without backend

- **Real Mode** (`'real'`)
  - Makes actual HTTP requests to your Symfony server
  - Configure `REAL_API.BASE_URL` in config.js
  - Handles authentication headers automatically

## Available API Methods

### User API (`API.user`)

#### Authentication
- `login(credentials)` - Login with username/password
- `register(userData)` - Register new user
- `logout(refreshToken)` - Logout user
- `validateToken(token)` - Validate access token
- `refreshToken(refreshToken)` - Get new access token

#### Password Management
- `forgotPassword(email)` - Request password reset
- `resetPassword({token, password})` - Reset password
- `changePassword({currentPassword, newPassword})` - Change password

#### Profile Management
- `getProfile()` - Get user profile
- `updateProfile(profileData)` - Update profile
- `getPreferences()` - Get user preferences
- `updatePreferences(preferences)` - Update preferences

#### Advanced
- `getRolesAndPermissions()` - Get user roles/permissions
- `getActivityLog(params)` - Get activity history
- `deleteAccount(confirmationData)` - Delete account

## Mock Data

When in mock mode, you can use these test accounts:

```javascript
// Regular user
username: 'testuser'
password: 'password123'

// Admin user
username: 'admin'
password: 'admin123'
```

Access mock data:
```javascript
const mockData = API.getMockData();
console.log(mockData.testUsers);
```

## Error Handling

All API methods throw errors with descriptive messages:

```javascript
try {
  const response = await API.user.login(credentials);
  // Success - tokens are automatically stored in localStorage
  // Navigate user to dashboard
} catch (error) {
  if (error.status === 401) {
    console.error('Invalid credentials');
  } else {
    console.error('Login failed:', error.message);
  }
  // error.status contains HTTP status code (real API only)
}
```

## Adding New Services

1. Create real service: `src/api/services/newService.js`
2. Create mock service: `src/api/services/newService.mock.js`
3. Add to root API: `src/api/index.js`

```javascript
// In src/api/index.js
initializeServices() {
  this.user = isMockMode() ? new MockUserApi() : new UserApi();
  this.newService = isMockMode() ? new MockNewService() : new NewService();
}
```

## Best Practices

1. **Always use the API singleton**: `import { API } from '../api/index.js'`
2. **Handle errors appropriately** in your components
3. **Test with mock mode** during development
4. **Switch to real mode** for production
5. **Keep API methods async** for consistency
