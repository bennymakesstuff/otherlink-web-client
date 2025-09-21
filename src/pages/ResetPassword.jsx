import { createSignal, onMount } from 'solid-js';
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
  const [error, setError] = createSignal('');
  const [token, setToken] = createSignal('');

  onMount(() => {
    const resetToken = searchParams.token;
    if (!resetToken) {
      // No token provided, redirect to forgot password
      navigate('/forgot-password');
      return;
    }
    setToken(resetToken);
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
      await API.user.resetPassword({
        token: token(),
        password: formData().password
      });

      // Success - redirect to completion page
      navigate('/reset-complete');
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

  return (
    <div class="auth-page">
      <div class="auth-container">
        <div class="auth-card">
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
        </div>
      </div>
    </div>
  );
};
