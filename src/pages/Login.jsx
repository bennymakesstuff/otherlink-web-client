import { createSignal } from 'solid-js';
import { A, useNavigate } from '@solidjs/router';
import { authStore } from '../stores/authStore';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { AppleSignInButton } from '../components/AppleSignInButton';
import { AccountLinkingModal } from '../components/AccountLinkingModal';
import { isOAuthConfigured, isAnyOAuthConfigured } from '../config/oauth';
import { UnauthenticatedNavigation } from '../components/UnauthenticatedNavigation.jsx';

export const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [error, setError] = createSignal('');
  const [linkingData, setLinkingData] = createSignal(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await authStore.login({
        username: username(),
        password: password()
      });
      
      // Check if 2FA is required - handle server response format
      const twoFactorData = response.data || response;
      if (twoFactorData.two_factor_required) {
        console.log('2FA required, navigating to verification page');
        console.log('2FA data:', twoFactorData);
        
        // Navigate to 2FA verification page with session data
        navigate('/2fa-verify', {
          state: {
            twoFactorData: {
              session_id: twoFactorData.session_id,
              expires_in: twoFactorData.expires_in,
              user: twoFactorData.user
            }
          }
        });
        return;
      }
      
      // Login successful without 2FA - auth state updated
      
      // Small delay to ensure auth state is fully updated
      setTimeout(() => {
        navigate('/dashboard');
      }, 100);
      
    } catch (err) {
      console.error('Login error:', err);
      // Handle specific 401 error
      if (err.status === 401) {
        setError('Username or password is incorrect');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
    }
  };

  // OAuth Handlers
  const handleOAuthSuccess = () => {
    setError('');
    setTimeout(() => {
      navigate('/dashboard');
    }, 100);
  };

  const handleOAuthError = (err) => {
    console.error('OAuth error:', err);
    setError(err.message || 'OAuth authentication failed');
  };

  const handleAccountLinkingRequired = (data) => {
    setError('');
    setLinkingData(data);
  };

  const handleOAuthTwoFactorRequired = (twoFactorData) => {
    setError('');
    navigate('/2fa-verify', {
      state: { twoFactorData }
    });
  };

  const handleLinkingSuccess = () => {
    setLinkingData(null);
    handleOAuthSuccess();
  };

  const handleLinkingCancel = () => {
    setLinkingData(null);
    setError('');
  };

  const handleLinkingTwoFactor = (twoFactorData) => {
    setLinkingData(null);
    handleOAuthTwoFactorRequired(twoFactorData);
  };

  return (
    <div class="auth-page">
      <div class="auth-container">
        <div class="auth-hero"></div>
        <div class="auth-card">
          <UnauthenticatedNavigation />
          <div class="auth-card-content">
          <h1>Login</h1>
          <p>Welcome back! Please sign in to your account.</p>
          
          {error() && (
            <div class="error-message">
              {error()}
            </div>
          )}

          {/* OAuth Sign In Options - only show if any provider is configured */}
          {isAnyOAuthConfigured() && (
            <>
              <div class="oauth-buttons">
                {isOAuthConfigured('google') && (
                  <GoogleSignInButton
                    context="signin"
                    text="signin_with"
                    onSuccess={handleOAuthSuccess}
                    onError={handleOAuthError}
                    onAccountLinkingRequired={handleAccountLinkingRequired}
                    onTwoFactorRequired={handleOAuthTwoFactorRequired}
                  />
                )}
                {isOAuthConfigured('apple') && (
                  <AppleSignInButton
                    onSuccess={handleOAuthSuccess}
                    onError={handleOAuthError}
                    onAccountLinkingRequired={handleAccountLinkingRequired}
                    onTwoFactorRequired={handleOAuthTwoFactorRequired}
                  />
                )}
              </div>

              <div class="oauth-divider">
                <span>or continue with email</span>
              </div>
            </>
          )}
          
          <form onSubmit={handleSubmit} class="auth-form">
            <div class="form-group">
              <label for="username">Username</label>
              <input
                type="text"
                id="username"
                value={username()}
                onInput={(e) => setUsername(e.target.value)}
                required
                disabled={authStore.isLoading}
                placeholder="Enter your username"
              />
            </div>
            
            <div class="form-group">
              <label for="password">Password</label>
              <input
                type="password"
                id="password"
                value={password()}
                onInput={(e) => setPassword(e.target.value)}
                required
                disabled={authStore.isLoading}
              />
            </div>
            
            <button 
              type="submit" 
              class="btn btn-primary btn-full"
              disabled={authStore.isLoading}
            >
              {authStore.isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          
          <div class="auth-links">
            <A href="/forgot-password">Forgot your password?</A>
            <p>Don't have an account? <A href="/register">Register here</A></p>
          </div>
          </div>
        </div>
      </div>

      {/* Account Linking Modal */}
      {linkingData() && (
        <AccountLinkingModal
          linkingData={linkingData()}
          onSuccess={handleLinkingSuccess}
          onCancel={handleLinkingCancel}
          onTwoFactorRequired={handleLinkingTwoFactor}
        />
      )}
    </div>
  );
};
