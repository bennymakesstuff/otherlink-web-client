import { A, useLocation } from '@solidjs/router';
import { createSignal, onMount } from 'solid-js';
import { UnauthenticatedNavigation } from '../components/UnauthenticatedNavigation.jsx';

export const VerificationSent = () => {
  const location = useLocation();
  const [email, setEmail] = createSignal('');

  onMount(() => {
    // Get email from navigation state if available
    const userEmail = location.state?.email;
    if (userEmail) {
      setEmail(userEmail);
    }
  });

  return (
    <div class="auth-page">
      <div class="auth-container">
        <div class="auth-hero"></div>
        <div class="auth-card">
          <UnauthenticatedNavigation />
          <div class="auth-card-content">
          <div class="success-message">
            <div class="success-icon">📧</div>
            <h1>Check Your Email</h1>
            <p>
              We've sent a verification email to <strong>{email() || 'your email address'}</strong>.
            </p>
            <p>
              Please click the verification link in the email to activate your account.
            </p>
          </div>
          
          <div class="verification-instructions">
            <h3>What to do next:</h3>
            <ol>
              <li>Check your email inbox (and spam folder)</li>
              <li>Click the verification link in the email</li>
              <li>You'll be redirected back here to complete the process</li>
            </ol>
          </div>
          
          <div class="verification-help">
            <h4>Didn't receive the email?</h4>
            <ul>
              <li>Check your spam or junk folder</li>
              <li>Make sure you entered the correct email address</li>
              <li>Wait a few minutes and check again</li>
            </ul>
          </div>
          
          <div class="auth-links">
            <A href="/register" class="btn btn-secondary btn-full">
              Try Different Email
            </A>
            <div style="margin-top: 1rem;">
              <A href="/login">← Back to Login</A>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};
