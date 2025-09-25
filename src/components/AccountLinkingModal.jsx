import { createSignal } from 'solid-js';
import { authStore } from '../stores/authStore';

export const AccountLinkingModal = (props) => {
  const [password, setPassword] = createSignal('');
  const [error, setError] = createSignal('');
  const [isLoading, setIsLoading] = createSignal(false);

  // Props: linkingData, onSuccess, onCancel
  const { linkingData } = props;

  const handleLinkAccount = async (e) => {
    e.preventDefault();
    if (!password().trim()) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const linkData = {
        provider: linkingData.pendingOAuthData.provider,
        id_token: linkingData.pendingOAuthData.id_token,
        existing_password: password()
      };

      const result = await authStore.linkOAuthAccount(linkData);
      
      // Check for 2FA requirement
      const responseData = result.data || result;
      if (responseData.two_factor_required) {
        props.onTwoFactorRequired?.(responseData);
        return;
      }
      
      // Success
      props.onSuccess?.();
    } catch (err) {
      console.error('Account linking error:', err);
      if (err.status === 401) {
        setError('Incorrect password. Please try again.');
      } else {
        setError(err.message || 'Failed to link account. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    props.onCancel?.();
  };

  // Don't render if no linking data
  if (!linkingData) return null;

  return (
    <div class="account-linking-modal" onClick={(e) => e.target === e.currentTarget && handleCancel()}>
      <div class="account-linking-content">
        <h2>Link Your Account</h2>
        <p>
          An account with the email <strong>{linkingData.existingEmail}</strong> already exists. 
          Enter your password to link your {linkingData.pendingOAuthData.provider} account.
        </p>

        {error() && (
          <div class="error-message">
            {error()}
          </div>
        )}

        <form onSubmit={handleLinkAccount} class="linking-form">
          <div class="form-group">
            <label for="linking-password">Your Current Password</label>
            <input
              type="password"
              id="linking-password"
              value={password()}
              onInput={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading()}
              placeholder="Enter your password"
              autocomplete="current-password"
            />
          </div>

          <div class="linking-buttons">
            <button 
              type="submit" 
              class="btn btn-primary btn-link-account"
              disabled={isLoading() || !password().trim()}
            >
              {isLoading() ? 'Linking...' : 'Link Account'}
            </button>
            <button 
              type="button" 
              class="btn btn-cancel-linking"
              disabled={isLoading()}
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </form>

        <div class="linking-info">
          <p style="font-size: 0.75rem; color: #6b7280; margin-top: 1rem; line-height: 1.4;">
            By linking your accounts, you'll be able to sign in using either your email/password or your {linkingData.pendingOAuthData.provider} account.
          </p>
        </div>
      </div>
    </div>
  );
};
