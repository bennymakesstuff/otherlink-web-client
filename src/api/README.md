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

// Update profile (first_name and last_name only)
const updatedUser = await API.user.updateProfile({
  first_name: 'Jane',
  last_name: 'Smith'
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
- `forgotPassword(username)` - Request password reset
- `validateResetToken(token)` - Validate password reset token
- `completePasswordReset({token, password, password_confirm})` - Complete password reset
- `resetPassword({token, password})` - Reset password (legacy)
- `changePassword({current_password, new_password, confirm_password})` - Change password

#### Profile Management
- `getProfile()` - Get user profile
- `updateProfile({first_name, last_name})` - Update profile (excludes email)
- `getPreferences()` - Get user preferences
- `updatePreferences(preferences)` - Update preferences

#### Session Management
- `getSessions()` - Get all user sessions with device info
- `revokeSession(sessionId, currentRefreshToken)` - Revoke specific session by ID
- `revokeAllSessions()` - Revoke all other sessions

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
// User data: {id: 1, username: 'testuser', first_name: 'John', last_name: 'Doe', full_name: 'John Doe'}

// Admin user  
username: 'admin'
password: 'admin123'
// User data: {id: 2, username: 'admin', first_name: 'Jane', last_name: 'Admin', full_name: 'Jane Admin'}
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

// Password change with specific error handling
try {
  await API.user.changePassword({
    current_password: 'oldPassword123',
    new_password: 'newSecurePassword456',
    confirm_password: 'newSecurePassword456'
  });
  console.log('Password changed successfully');
} catch (error) {
  if (error.status === 400) {
    // Server validation errors (current password incorrect, passwords don't match, etc.)
    console.error('Password change failed:', error.message);
  } else {
    console.error('Unexpected error:', error.message);
  }
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
