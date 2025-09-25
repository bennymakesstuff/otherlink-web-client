import { createSignal, onMount, onCleanup } from 'solid-js';
import { authStore } from '../stores/authStore';
import { getOAuthConfig, isOAuthConfigured } from '../config/oauth';

export const AppleSignInButton = (props) => {
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal('');
  let buttonContainer;

  // Apple OAuth configuration
  const appleConfig = getOAuthConfig('apple');
  const isConfigured = isOAuthConfigured('apple');

  const handleAppleResponse = async (response) => {
    setError('');
    setIsLoading(true);
    
    try {
      const { authorization } = response;
      const idToken = authorization.id_token;
      const authorizationCode = authorization.code;
      
      const result = await authStore.appleLogin(idToken, authorizationCode);
      
      // Check if account linking is required
      if (result.requiresLinking) {
        props.onAccountLinkingRequired?.(result);
        return;
      }
      
      // Check for 2FA requirement
      const responseData = result.data || result;
      if (responseData.two_factor_required) {
        props.onTwoFactorRequired?.(responseData);
        return;
      }
      
      // Success - call onSuccess callback
      props.onSuccess?.();
    } catch (err) {
      console.error('Apple sign-in error:', err);
      setError(err.message || 'Apple sign-in failed');
      props.onError?.(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleError = (error) => {
    console.error('Apple sign-in error:', error);
    if (error.error !== 'popup_closed_by_user') {
      setError('Apple sign-in failed');
      props.onError?.(error);
    }
  };

  onMount(() => {
    // Load Apple ID script
    if (!window.AppleID) {
      const script = document.createElement('script');
      script.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
      script.async = true;
      script.onload = () => {
        initializeAppleSignIn();
      };
      document.head.appendChild(script);
    } else {
      initializeAppleSignIn();
    }
  });

  const initializeAppleSignIn = () => {
    if (window.AppleID && isConfigured) {
      window.AppleID.auth.init({
        clientId: appleConfig.CLIENT_ID,
        scope: 'name email',
        redirectURI: appleConfig.REDIRECT_URI,
        state: 'web-client-signin',
        usePopup: true,
      });
    }
  };

  const handleAppleSignIn = async () => {
    if (!isConfigured) {
      setError('Apple Sign In is not configured. Please contact support.');
      return;
    }
    
    if (!window.AppleID) {
      setError('Apple Sign In is not available');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await window.AppleID.auth.signIn();
      await handleAppleResponse(response);
    } catch (err) {
      handleAppleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  onCleanup(() => {
    // Apple Sign In doesn't require explicit cleanup
  });

  return (
    <div class="apple-signin-container">
      {/* Loading overlay */}
      {isLoading() && (
        <div class="oauth-loading-overlay">
          <div class="loading-spinner"></div>
          <span>Signing in with Apple...</span>
        </div>
      )}
      
      {/* Error message */}
      {error() && (
        <div class="error-message oauth-error">
          {error()}
        </div>
      )}
      
      {/* Apple Sign-In button */}
      <button 
        ref={buttonContainer}
        type="button"
        class={`btn btn-apple ${isLoading() ? 'loading' : ''}`}
        disabled={isLoading() || !isConfigured}
        onClick={handleAppleSignIn}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" class="apple-icon">
          <path 
            fill="currentColor" 
            d="M15.769 11.284c-.047-1.061.187-2.034.703-2.92.516-.885 1.24-1.533 2.172-1.94-.094-.14-.211-.261-.352-.364a3.692 3.692 0 0 0-1.758-.563c-.773-.07-1.566.188-2.379.773-.375.27-.703.27-1.078 0-.844-.609-1.64-.844-2.391-.703a3.73 3.73 0 0 0-2.766 2.203c-.633 1.195-.539 2.695.281 4.5.422.93.984 1.804 1.687 2.625.68.797 1.336 1.195 1.969 1.195.609 0 1.195-.234 1.758-.703.586-.492 1.219-.492 1.805 0 .563.469 1.149.703 1.758.703.633 0 1.29-.398 1.969-1.195.703-.82 1.265-1.695 1.687-2.625.047-.117.094-.234.14-.351-.046-.023-.093-.07-.14-.094-.726-.375-1.313-.914-1.758-1.617-.445-.703-.68-1.476-.703-2.32zm-2.695-8.18c.516-.609.797-1.336.844-2.18.047-.328 0-.633-.14-.914-.047-.094-.117-.164-.211-.211-.328-.164-.68-.234-1.055-.211-.82.047-1.57.375-2.25.984-.68.61-1.078 1.383-1.195 2.32-.047.328 0 .633.14.914.047.094.117.164.211.211.328.164.68.234 1.055.211.82-.047 1.57-.375 2.25-.984.351-.328.633-.68.844-1.055z"
          />
        </svg>
        Sign in with Apple
      </button>
    </div>
  );
};
