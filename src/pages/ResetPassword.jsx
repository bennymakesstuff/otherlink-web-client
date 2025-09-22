import { createSignal, onMount, Show } from 'solid-js';
import { A, useSearchParams, useNavigate } from '@solidjs/router';
import { API } from '../api/index.js';

export const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = createSignal({
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = createSignal(false);
  const [isValidating, setIsValidating] = createSignal(true);
  const [tokenValid, setTokenValid] = createSignal(false);
  const [error, setError] = createSignal('');
  const [token, setToken] = createSignal('');
  const [resetSuccess, setResetSuccess] = createSignal(false);
  const [redirectCountdown, setRedirectCountdown] = createSignal(5);

  onMount(async () => {
    const resetToken = searchParams.token;
    if (!resetToken) {
      // No token provided, redirect to forgot password
      navigate('/forgot-password');
      return;
    }
    setToken(resetToken);

    // Validate the token
    try {
      await API.user.validateResetToken(resetToken);
      setTokenValid(true);
    } catch (err) {
      setTokenValid(false);
      if (err.status === 400 || err.status === 410) {
        setError('This password reset link has expired or is invalid.');
      } else {
        setError('Unable to validate reset token. Please try again.');
      }
    } finally {
      setIsValidating(false);
    }
  });

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const data = formData();
    
    if (!data.password || !data.confirmPassword) {
      setError('Please fill in all fields');
      return false;
    }

    if (data.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    if (data.password !== data.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await API.user.completePasswordReset({
        token: token(),
        password: formData().password,
        password_confirm: formData().confirmPassword
      });

      // Success - show success message and start countdown
      setResetSuccess(true);
      startRedirectCountdown();
    } catch (err) {
      // Check if token is expired or invalid
      if (err.status === 400 || err.status === 410) {
        navigate('/reset-expired');
        return;
      }
      
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const startRedirectCountdown = () => {
    const interval = setInterval(() => {
      setRedirectCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          navigate('/login');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div class="auth-page">
      <div class="auth-container">
        <div class="auth-card">
          <Show when={isValidating()}>
            <div class="auth-loading">
              <div class="loading-spinner"></div>
              <p>Validating reset token...</p>
            </div>
          </Show>

          <Show when={!isValidating() && !tokenValid()}>
            <h1>Invalid Reset Link</h1>
            <div class="error-message">
              {error()}
            </div>
            <p>This password reset link has expired or is invalid. Please request a new one.</p>
            
            <div class="auth-links">
              <A href="/forgot-password" class="btn btn-primary btn-full">Request New Reset Link</A>
              <div style="margin-top: 1rem;">
                <A href="/login">← Back to Login</A>
              </div>
            </div>
          </Show>

          <Show when={!isValidating() && tokenValid() && !resetSuccess()}>
            <h1>Create New Password</h1>
            <p>Enter your new password below. Make sure it's strong and memorable.</p>
            
            {error() && (
              <div class="error-message">
                {error()}
              </div>
            )}
            
            <form onSubmit={handleSubmit} class="auth-form">
              <div class="form-group">
                <label for="password">New Password</label>
                <input
                  type="password"
                  id="password"
                  value={formData().password}
                  onInput={(e) => updateFormData('password', e.target.value)}
                  required
                  disabled={isLoading()}
                  minLength="8"
                  placeholder="Enter your new password"
                />
                <div class="form-help">
                  Must be at least 8 characters long
                </div>
              </div>
              
              <div class="form-group">
                <label for="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={formData().confirmPassword}
                  onInput={(e) => updateFormData('confirmPassword', e.target.value)}
                  required
                  disabled={isLoading()}
                  minLength="8"
                  placeholder="Confirm your new password"
                />
              </div>
              
              <button 
                type="submit" 
                class="btn btn-primary btn-full"
                disabled={isLoading()}
              >
                {isLoading() ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
            
            <div class="auth-links">
              <A href="/login">← Back to Login</A>
              <p>Remember your password? <A href="/login">Sign in</A></p>
            </div>
          </Show>

          <Show when={resetSuccess()}>
            <div class="success-message">
              <div class="success-icon">✓</div>
              <h1>Password Reset Successful!</h1>
              <p>Your password has been successfully updated. You can now sign in with your new password.</p>
              <p class="redirect-notice">
                Redirecting to login in {redirectCountdown()} seconds...
              </p>
            </div>
            
            <A href="/login" class="btn btn-primary btn-full">
              Sign In Now
            </A>
            
            <div class="auth-links">
              <A href="/">← Back to Home</A>
            </div>
          </Show>
        </div>
      </div>
    </div>
  );
};
