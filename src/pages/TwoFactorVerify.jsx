import { createSignal, onMount, onCleanup } from 'solid-js';
import { A, useNavigate, useLocation } from '@solidjs/router';
import { API } from '../api/index.js';
import { authStore } from '../stores/authStore';
import { UnauthenticatedNavigation } from '../components/UnauthenticatedNavigation.jsx';

export const TwoFactorVerify = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [code, setCode] = createSignal('');
  const [error, setError] = createSignal('');
  const [isVerifying, setIsVerifying] = createSignal(false);
  const [isResending, setIsResending] = createSignal(false);
  const [timeLeft, setTimeLeft] = createSignal(600); // 10 minutes default
  const [sessionId, setSessionId] = createSignal('');
  const [userInfo, setUserInfo] = createSignal(null);

  let countdownInterval;

  onMount(() => {
    // Get 2FA session data from navigation state
    const twoFactorData = location.state?.twoFactorData;
    
    if (!twoFactorData) {
      // No 2FA session data, redirect to login
      navigate('/login');
      return;
    }

    setSessionId(twoFactorData.session_id);
    setUserInfo(twoFactorData.user);
    setTimeLeft(twoFactorData.expires_in || 600);

    // Start countdown timer
    startCountdown();
  });

  onCleanup(() => {
    if (countdownInterval) {
      clearInterval(countdownInterval);
    }
  });

  const startCountdown = () => {
    countdownInterval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setError('Verification code has expired. Please request a new one.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!code() || code().length !== 6) {
      setError('Please enter a 6-digit verification code');
      return;
    }

    setIsVerifying(true);

    try {
      const response = await API.user.verify2FA({
        session_id: sessionId(),
        code: code()
      });

      // Handle successful 2FA verification - handle server response format
      console.log('2FA verification response:', response);
      
      let accessToken, refreshToken, user;
      
      // Handle server response format: { data: { tokens: { access_token: '...', refresh_token: '...' }, user: {...} } }
      if (response.data && response.data.tokens) {
        accessToken = response.data.tokens.access_token;
        refreshToken = response.data.tokens.refresh_token;
        user = response.data.user;
      } else if (response.tokens) {
        // Fallback to direct tokens format (mock API)
        accessToken = response.tokens.access_token;
        refreshToken = response.tokens.refresh_token;
        user = response.user;
      }
      
      if (!accessToken || !refreshToken) {
        console.error('Token extraction failed. Response structure:', response);
        throw new Error('Invalid response: missing tokens');
      }
      
      console.log('Extracted tokens successfully:', { accessToken: accessToken.substring(0, 20) + '...', refreshToken: refreshToken.substring(0, 20) + '...' });

      // Store tokens and user data
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      // Update auth store (we'll need to add a method for this)
      await authStore.setAuthenticatedUser(user, accessToken, refreshToken);

      // Navigate to dashboard
      navigate('/dashboard');

    } catch (err) {
      console.error('2FA verification error:', err);
      if (err.status === 400) {
        setError('Invalid verification code. Please try again.');
      } else {
        setError(err.message || 'Verification failed. Please try again.');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setIsResending(true);

    try {
      const response = await API.user.resend2FA(sessionId());
      
      // Update timer with new expiration
      setTimeLeft(response.expires_in || 600);
      
      // Restart countdown
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
      startCountdown();

      // Show success message temporarily
      setError(''); // Clear any existing errors
      setTimeout(() => {
        // Could show a success message here
      }, 100);

    } catch (err) {
      console.error('Resend 2FA error:', err);
      setError(err.message || 'Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleCodeInput = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    if (value.length <= 6) {
      setCode(value);
    }
  };

  return (
    <div class="auth-page">
      <div class="auth-container">
        <div class="auth-hero"></div>
        <div class="auth-card">
          <UnauthenticatedNavigation />
          <div class="auth-card-content">
          <h1>Two-Factor Authentication</h1>
          <p>
            We've sent a 6-digit verification code to your email address
            {userInfo() && (
              <><br/><strong>{userInfo().first_name} {userInfo().last_name}</strong></>
            )}
          </p>
          
          {error() && (
            <div class="error-message">
              {error()}
            </div>
          )}

          <div class="countdown-timer">
            <p>Code expires in: <strong>{formatTime(timeLeft())}</strong></p>
          </div>
          
          <form onSubmit={handleSubmit} class="auth-form">
            <div class="form-group">
              <label for="code">Verification Code</label>
              <input
                type="text"
                id="code"
                value={code()}
                onInput={handleCodeInput}
                required
                disabled={isVerifying() || timeLeft() === 0}
                placeholder="123456"
                maxLength="6"
                class="verification-code-input"
                autocomplete="one-time-code"
              />
              <div class="form-help">
                Enter the 6-digit code sent to your email
              </div>
            </div>
            
            <button 
              type="submit" 
              class="btn btn-primary btn-full"
              disabled={isVerifying() || timeLeft() === 0 || code().length !== 6}
            >
              {isVerifying() ? 'Verifying...' : 'Verify Code'}
            </button>
          </form>

          <div class="two-factor-actions">
            <button 
              type="button"
              class="btn btn-secondary btn-full"
              onClick={handleResend}
              disabled={isResending() || timeLeft() > 540} // Allow resend only in last minute or if expired
            >
              {isResending() ? 'Sending...' : 'Resend Code'}
            </button>
          </div>
          
          <div class="auth-links">
            <A href="/login">← Back to Login</A>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};
