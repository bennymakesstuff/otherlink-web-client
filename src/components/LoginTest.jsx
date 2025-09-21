import { createSignal } from 'solid-js';
import { API } from '../api/index.js';
import { authStore } from '../stores/authStore.js';

/**
 * Login test component to verify API integration
 * This component helps test the login flow with mock data
 */
export const LoginTest = () => {
  const [testResults, setTestResults] = createSignal([]);
  const [isRunning, setIsRunning] = createSignal(false);

  const addResult = (test, success, message) => {
    setTestResults(prev => [...prev, { test, success, message, timestamp: new Date() }]);
  };

  const runLoginTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    try {
      // Test 1: Check API mode
      addResult('API Mode Check', true, `Current mode: ${API.getMode()}`);

      // Test 2: Get mock data (only works in mock mode)
      if (API.isMock()) {
        const mockData = API.getMockData();
        addResult('Mock Data', true, `Found ${mockData.testUsers.length} test users`);
      }

      // Test 3: Login with test credentials
      const testUsername = API.isMock() ? 'testuser' : 'your-real-username';
      const testPassword = API.isMock() ? 'password123' : 'your-real-password';
      
      try {
        const loginResponse = await API.user.login({
          username: testUsername,
          password: testPassword
        });
        
        addResult('Login Test', true, `Login successful - got tokens and user data`);
        console.log('Login response:', loginResponse);
        
        // Show the response structure
        if (loginResponse.data && loginResponse.data.tokens && 
            (loginResponse.data.tokens.access_token || loginResponse.data.tokens.access)) {
          addResult('Token Format', true, 'Server response contains tokens in Symfony format');
        } else if (loginResponse.tokens && 
                  (loginResponse.tokens.access_token || loginResponse.tokens.access)) {
          addResult('Token Format', true, 'Server response contains tokens in direct format');
        } else if (loginResponse.accessToken && loginResponse.refreshToken) {
          addResult('Token Format', true, 'Server response contains tokens in mock format');
        } else {
          addResult('Token Format', false, 'Unexpected token response format');
        }

        // Test 4: Check auth store state
        const isAuthenticated = authStore.isAuthenticated;
        addResult('Auth State', isAuthenticated, `Is authenticated: ${isAuthenticated}`);

        // Test 5: Test token validation
        try {
          const validationResponse = await API.user.validateToken(authStore.accessToken);
          addResult('Token Validation', true, 'Token is valid');
        } catch (error) {
          addResult('Token Validation', false, error.message);
        }

        // Test 6: Test refresh token
        try {
          const refreshResponse = await API.user.refreshToken(authStore.refreshToken);
          addResult('Token Refresh', true, 'Token refresh successful');
        } catch (error) {
          addResult('Token Refresh', false, error.message);
        }

        // Test 7: Test logout
        try {
          await authStore.logout();
          const isStillAuthenticated = authStore.isAuthenticated;
          addResult('Logout Test', !isStillAuthenticated, `Logout successful - authenticated: ${isStillAuthenticated}`);
        } catch (error) {
          addResult('Logout Test', false, error.message);
        }

      } catch (error) {
        addResult('Login Test', false, `Login failed: ${error.message}`);
      }

      // Test 8: Test invalid login
      try {
        await API.user.login({
          username: 'invaliduser',
          password: 'wrongpassword'
        });
        addResult('Invalid Login Test', false, 'Should have failed but succeeded');
      } catch (error) {
        addResult('Invalid Login Test', true, `Correctly rejected invalid credentials: ${error.message}`);
      }

    } catch (error) {
      addResult('General Error', false, error.message);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div class="login-test">
      <div class="test-header">
        <h2>🧪 Login API Test Suite</h2>
        <p>Test the login/logout/refresh token functionality</p>
        
        <div class="api-info">
          <strong>API Mode:</strong> {API.getMode()} | 
          <strong>Authenticated:</strong> {authStore.isAuthenticated ? '✅' : '❌'}
          {authStore.user && <span> | <strong>User:</strong> {authStore.user.firstName} {authStore.user.lastName}</span>}
          {API.isReal() && (
            <div style="margin-top: 0.5rem; font-size: 0.8rem; color: #dc2626;">
              <strong>Note:</strong> Real API mode - update test credentials in the code or use your actual login credentials
            </div>
          )}
        </div>

        <button 
          onClick={runLoginTests} 
          disabled={isRunning()}
          class="btn btn-primary"
        >
          {isRunning() ? 'Running Tests...' : 'Run Login Tests'}
        </button>
      </div>

      <div class="test-results">
        <h3>Test Results ({testResults().length})</h3>
        {testResults().map((result, index) => (
          <div class={`test-result ${result.success ? 'success' : 'failure'}`}>
            <div class="result-header">
              <span class="result-icon">{result.success ? '✅' : '❌'}</span>
              <strong>{result.test}</strong>
              <span class="result-time">{result.timestamp.toLocaleTimeString()}</span>
            </div>
            <div class="result-message">{result.message}</div>
          </div>
        ))}
        
        {testResults().length === 0 && !isRunning() && (
          <p class="no-results">Click "Run Login Tests" to start testing</p>
        )}
      </div>

      <div class="info-section">
        {API.isMock() ? (
          <div class="mock-info">
            <h3>📝 Mock API Test Credentials</h3>
            <div class="credentials">
              <div class="credential-item">
                <strong>Regular User:</strong>
                <br />Username: testuser
                <br />Password: password123
              </div>
              <div class="credential-item">
                <strong>Admin User:</strong>
                <br />Username: admin  
                <br />Password: admin123
              </div>
            </div>
          </div>
        ) : (
          <div class="real-api-info">
            <h3>🔗 Real API Integration</h3>
            <div class="api-details">
              <p><strong>Expected Response Format:</strong></p>
              <pre class="code-block">{`{
  "data": {
    "tokens": {
      "access_token": "jwt-access-token...",
      "refresh_token": "jwt-refresh-token..."
    },
    "user": {
      "id": 1,
      "username": "user123",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}`}</pre>
              <p><strong>On 401:</strong> "Username or password is incorrect" will be displayed</p>
              <p><strong>On Success:</strong> Tokens stored in localStorage, navigate to dashboard</p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
