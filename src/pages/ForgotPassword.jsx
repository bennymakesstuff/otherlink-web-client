import { createSignal } from 'solid-js';
import { A } from '@solidjs/router';
import { API } from '../api/index.js';

export const ForgotPassword = () => {
  const [email, setEmail] = createSignal('');
  const [isLoading, setIsLoading] = createSignal(false);
  const [message, setMessage] = createSignal('');
  const [emailSent, setEmailSent] = createSignal(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await API.user.forgotPassword(email());
      
      setEmailSent(true);
      setMessage(response.message || 'Password reset instructions have been sent to your email.');
    } catch (error) {
      setMessage('Error: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div class="auth-page">
      <div class="auth-container">
        <div class="auth-card">
          <h1>Reset Password</h1>
          
          {!emailSent() ? (
            <>
              <p>Enter your email address and we'll send you instructions to reset your password.</p>
              
              {message() && message().includes('Error') && (
                <div class="error-message">
                  {message()}
                </div>
              )}
              
              <form onSubmit={handleSubmit} class="auth-form">
                <div class="form-group">
                  <label for="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    value={email()}
                    onInput={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading()}
                    placeholder="Enter your email address"
                  />
                </div>
                
                <button 
                  type="submit" 
                  class="btn btn-primary btn-full"
                  disabled={isLoading()}
                >
                  {isLoading() ? 'Sending...' : 'Send Reset Instructions'}
                </button>
              </form>
            </>
          ) : (
            <>
              <div class="success-message">
                <div class="success-icon">✓</div>
                <h2>Check Your Email</h2>
                <p>{message()}</p>
                <p>If you don't receive an email within a few minutes, please check your spam folder.</p>
              </div>
              
              <button 
                type="button" 
                class="btn btn-secondary btn-full"
                onClick={() => {
                  setEmailSent(false);
                  setEmail('');
                  setMessage('');
                }}
              >
                Send Again
              </button>
            </>
          )}
          
          <div class="auth-links">
            <A href="/login">← Back to Login</A>
            <p>Remember your password? <A href="/login">Sign in</A></p>
          </div>
        </div>
      </div>
    </div>
  );
};
