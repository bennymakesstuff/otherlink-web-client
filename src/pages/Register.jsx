import { createSignal } from 'solid-js';
import { A, useNavigate } from '@solidjs/router';
import { API } from '../api/index.js';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { AppleSignInButton } from '../components/AppleSignInButton';
import { AccountLinkingModal } from '../components/AccountLinkingModal';
import { isOAuthConfigured, isAnyOAuthConfigured } from '../config/oauth';
import { UnauthenticatedNavigation } from '../components/UnauthenticatedNavigation.jsx';

export const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = createSignal({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const [error, setError] = createSignal('');
  const [isLoading, setIsLoading] = createSignal(false);
  const [linkingData, setLinkingData] = createSignal(null);

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const data = formData();
    
    // Basic validation
    if (data.password !== data.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (data.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);
    
    try {
      // Make API call to register using new API structure
      const response = await API.user.register({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName
      });

      // Navigate to verification sent page on successful registration
      navigate('/verification-sent', { 
        state: { email: data.email }
      });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
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
          
          <h1>Create Account</h1>
          <p>Join us and start your journey today.</p>
          
          {error() && (
            <div class="error-message">
              {error()}
            </div>
          )}

          {/* OAuth Sign Up Options - only show if any provider is configured */}
          {isAnyOAuthConfigured() && (
            <>
              <div class="oauth-buttons">
                {isOAuthConfigured('google') && (
                  <GoogleSignInButton
                    context="signup"
                    text="signup_with"
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
                <span>or sign up with email</span>
              </div>
            </>
          )}
          
          <form onSubmit={handleSubmit} class="auth-form">
            <div class="form-row">
              <div class="form-group">
                <label for="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  value={formData().firstName}
                  onInput={(e) => updateFormData('firstName', e.target.value)}
                  required
                  disabled={isLoading()}
                />
              </div>
              
              <div class="form-group">
                <label for="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  value={formData().lastName}
                  onInput={(e) => updateFormData('lastName', e.target.value)}
                  required
                  disabled={isLoading()}
                />
              </div>
            </div>
            
            <div class="form-group">
              <label for="email">Email</label>
              <input
                type="email"
                id="email"
                value={formData().email}
                onInput={(e) => updateFormData('email', e.target.value)}
                required
                disabled={isLoading()}
              />
            </div>
            
            <div class="form-group">
              <label for="password">Password</label>
              <input
                type="password"
                id="password"
                value={formData().password}
                onInput={(e) => updateFormData('password', e.target.value)}
                required
                disabled={isLoading()}
                minLength="8"
              />
            </div>
            
            <div class="form-group">
              <label for="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={formData().confirmPassword}
                onInput={(e) => updateFormData('confirmPassword', e.target.value)}
                required
                disabled={isLoading()}
                minLength="8"
              />
            </div>
            
            <button 
              type="submit" 
              class="btn btn-primary btn-full"
              disabled={isLoading()}
            >
              {isLoading() ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          
          <div class="auth-links">
            <p>Already have an account? <A href="/login">Sign in here</A></p>
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
