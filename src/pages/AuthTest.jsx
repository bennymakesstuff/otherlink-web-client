import { authStore } from '../stores/authStore';
import { A } from '@solidjs/router';

export const AuthTest = () => {
  const authState = () => ({
    isAuthenticated: authStore.isAuthenticated,
    hasAccessToken: !!authStore.accessToken,
    hasRefreshToken: !!authStore.refreshToken,
    hasUser: !!authStore.user,
    isLoading: authStore.isLoading,
    user: authStore.user
  });

  return (
    <div style="padding: 2rem; font-family: monospace;">
      <h2>🔍 Auth State Debug</h2>
      
      <div style="background: #f5f5f5; padding: 1rem; border-radius: 6px; margin: 1rem 0;">
        <h3>Current Authentication State:</h3>
        <pre style="font-size: 0.9rem; white-space: pre-wrap;">
{JSON.stringify(authState(), null, 2)}
        </pre>
      </div>

      <div style="background: #e3f2fd; padding: 1rem; border-radius: 6px; margin: 1rem 0;">
        <h3>LocalStorage Tokens:</h3>
        <div>Access Token: {localStorage.getItem('accessToken') ? '✅ Present' : '❌ Missing'}</div>
        <div>Refresh Token: {localStorage.getItem('refreshToken') ? '✅ Present' : '❌ Missing'}</div>
        
        {localStorage.getItem('accessToken') && (
          <details style="margin-top: 0.5rem;">
            <summary>Show Access Token</summary>
            <div style="font-size: 0.8rem; word-break: break-all; background: white; padding: 0.5rem; margin-top: 0.5rem; border-radius: 4px;">
              {localStorage.getItem('accessToken')}
            </div>
          </details>
        )}
      </div>

      <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
        <A href="/login" class="btn btn-secondary">← Back to Login</A>
        <A href="/admin/dashboard" class="btn btn-primary">Try Dashboard →</A>
        <button 
          onClick={() => window.location.reload()} 
          class="btn btn-outline"
        >
          🔄 Reload Page
        </button>
      </div>
    </div>
  );
};
