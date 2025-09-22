import { createSignal, onMount, Show } from 'solid-js';
import { A, useSearchParams, useNavigate } from '@solidjs/router';
import { API } from '../api/index.js';

export const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = createSignal(true);
  const [verificationSuccess, setVerificationSuccess] = createSignal(false);
  const [error, setError] = createSignal('');
  const [redirectCountdown, setRedirectCountdown] = createSignal(4);

  onMount(async () => {
    const token = searchParams.token;
    
    if (!token) {
      setError('No verification token provided.');
      setIsVerifying(false);
      return;
    }

    try {
      const response = await API.user.verifyEmail(token);
      setVerificationSuccess(true);
      startRedirectCountdown();
    } catch (err) {
      setError(err.message || 'Email verification failed. The link may be expired or invalid.');
    } finally {
      setIsVerifying(false);
    }
  });

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
          <Show when={isVerifying()}>
            <div class="auth-loading">
              <div class="loading-spinner"></div>
              <h1>Verifying Email</h1>
              <p>Please wait while we verify your email address...</p>
            </div>
          </Show>

          <Show when={!isVerifying() && verificationSuccess()}>
            <div class="success-message">
              <div class="success-icon">✅</div>
              <h1>Email Verified Successfully!</h1>
              <p>Your account has been verified and is now active.</p>
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

          <Show when={!isVerifying() && !verificationSuccess()}>
            <div class="error-message">
              <h1>Email Verification Failed</h1>
              <p>{error()}</p>
            </div>
            
            <div class="verification-help">
              <h4>Need help?</h4>
              <ul>
                <li>The verification link may have expired</li>
                <li>You may have already verified your email</li>
                <li>Try registering again with a valid email address</li>
              </ul>
            </div>
            
            <div class="auth-links">
              <A href="/register" class="btn btn-primary btn-full">
                Register Again
              </A>
              <div style="margin-top: 1rem;">
                <A href="/login">← Back to Login</A>
              </div>
            </div>
          </Show>
        </div>
      </div>
    </div>
  );
};
