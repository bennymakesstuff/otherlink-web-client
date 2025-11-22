import { createSignal } from 'solid-js';
import { A } from '@solidjs/router';
import { API } from '../api/index.js';
import { UnauthenticatedNavigation } from '../components/UnauthenticatedNavigation.jsx';

export const ForgotPassword = () => {
  const [username, setUsername] = createSignal('');
  const [isLoading, setIsLoading] = createSignal(false);
  const [message, setMessage] = createSignal('');
  const [requestSent, setRequestSent] = createSignal(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await API.user.forgotPassword(username());
      
      setRequestSent(true);
      setMessage(response.message || 'Password reset instructions have been sent to your registered email address.');
    } catch (error) {
      setMessage('Error: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div class="auth-page">
      <div class="auth-container">
        <div class="auth-hero"></div>
        <div class="auth-card">
          <UnauthenticatedNavigation />
          <div class="auth-card-content">
          <h1>Reset Password</h1>
          
          {!requestSent() ? (
            <>
              <p>Enter your username and we'll send password reset instructions to your registered email address.</p>
              
              {message() && message().includes('Error') && (
                <div class="error-message">
                  {message()}
                </div>
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
                    disabled={isLoading()}
                    placeholder="Enter your username"
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
                <h2>Reset Request Sent</h2>
                <p>{message()}</p>
                <p>If you don't receive an email within a few minutes, please check your spam folder or contact support.</p>
              </div>
              
              <button 
                type="button" 
                class="btn btn-secondary btn-full"
                onClick={() => {
                  setRequestSent(false);
                  setUsername('');
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
    </div>
  );
};
