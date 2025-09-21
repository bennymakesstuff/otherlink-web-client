import { A } from '@solidjs/router';

export const ResetComplete = () => {
  return (
    <div class="auth-page">
      <div class="auth-container">
        <div class="auth-card">
          <div class="success-message">
            <div class="success-icon">🎉</div>
            <h1>Password Reset Successful!</h1>
            <p>Your password has been successfully updated. You can now sign in with your new password.</p>
          </div>
          
          <div class="reset-complete-actions">
            <A href="/login" class="btn btn-primary btn-full">
              Sign In Now
            </A>
          </div>
          
          <div class="security-notice">
            <h3>Security Notice</h3>
            <ul>
              <li>Your password has been changed successfully</li>
              <li>All active sessions have been terminated for security</li>
              <li>If you didn't request this change, please contact support immediately</li>
            </ul>
          </div>
          
          <div class="auth-links">
            <A href="/">← Back to Home</A>
            <p>Need help? <a href="mailto:support@yourapp.com">Contact Support</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};
