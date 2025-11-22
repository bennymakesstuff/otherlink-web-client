import { A } from '@solidjs/router';
import { UnauthenticatedNavigation } from '../components/UnauthenticatedNavigation.jsx';

export const ResetExpired = () => {
  return (
    <div class="auth-page">
      <div class="auth-container">
        <div class="auth-hero"></div>
        <div class="auth-card">
          <UnauthenticatedNavigation />
          <div class="auth-card-content">
          <div class="error-state">
            <div class="error-icon">⏰</div>
            <h1>Reset Link Expired</h1>
            <p>This password reset link has expired or is no longer valid.</p>
          </div>
          
          <div class="expired-info">
            <h3>What happened?</h3>
            <ul>
              <li>Password reset links expire after 24 hours for security</li>
              <li>The link may have already been used</li>
              <li>The link might be incorrect or incomplete</li>
            </ul>
          </div>
          
          <div class="reset-expired-actions">
            <A href="/forgot-password" class="btn btn-primary btn-full">
              Request New Reset Link
            </A>
            
            <A href="/login" class="btn btn-secondary btn-full">
              Back to Login
            </A>
          </div>
          
          <div class="help-section">
            <h3>Need Help?</h3>
            <p>If you continue to experience issues, please:</p>
            <ul>
              <li>Check your email spam/junk folder</li>
              <li>Make sure you're using the most recent reset email</li>
              <li>Contact our support team for assistance</li>
            </ul>
          </div>
          
          <div class="auth-links">
            <A href="/">← Back to Home</A>
            <p>Need assistance? <a href="mailto:support@yourapp.com">Contact Support</a></p>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};
