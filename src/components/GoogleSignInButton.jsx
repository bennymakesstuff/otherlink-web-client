import { createSignal, onMount, onCleanup } from 'solid-js';
import { authStore } from '../stores/authStore';
import { getOAuthConfig, isOAuthConfigured } from '../config/oauth';

export const GoogleSignInButton = (props) => {
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal('');
  const [googleScriptLoaded, setGoogleScriptLoaded] = createSignal(false);
  const [googleButtonRendered, setGoogleButtonRendered] = createSignal(false);
  let buttonContainer;

  // Google OAuth configuration
  const googleConfig = getOAuthConfig('google');
  const isConfigured = isOAuthConfigured('google');

  const handleGoogleResponse = async (response) => {
    setError('');
    setIsLoading(true);
    
    try {
      const idToken = response.credential;
      const result = await authStore.googleLogin(idToken);
      
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
      console.error('Google sign-in error:', err);
      setError(err.message || 'Google sign-in failed');
      props.onError?.(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = (error) => {
    console.error('Google sign-in error:', error);
    setError('Google sign-in failed');
    props.onError?.(error);
  };

  onMount(() => {
    // Load Google Identity Services script
    if (!window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setGoogleScriptLoaded(true);
        initializeGoogleSignIn();
      };
      script.onerror = () => {
        setGoogleScriptLoaded(false);
        setError('Failed to load Google Sign-In. Please try again later.');
      };
      document.head.appendChild(script);
    } else {
      setGoogleScriptLoaded(true);
      initializeGoogleSignIn();
    }
  });

  const initializeGoogleSignIn = () => {
    if (window.google && buttonContainer && isConfigured) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleConfig.CLIENT_ID,
          callback: handleGoogleResponse,
          context: props.context || 'signin', // 'signin' or 'signup'
          ux_mode: 'popup',
          auto_select: false,
          cancel_on_tap_outside: true,
          hosted_domain: googleConfig.HOSTED_DOMAIN,
        });

        // Render the Google Sign-In button
        window.google.accounts.id.renderButton(
          buttonContainer,
          {
            type: 'standard',
            shape: 'rectangular',
            theme: props.theme || 'outline',
            text: props.text || 'signin_with',
            size: 'large',
            width: '100%',
          }
        );
        
        setGoogleButtonRendered(true);
      } catch (error) {
        console.error('Failed to initialize Google Sign-In:', error);
        setError('Failed to initialize Google Sign-In');
        setGoogleButtonRendered(false);
      }
    }
  };

  onCleanup(() => {
    // Clean up Google Sign-In
    if (window.google?.accounts?.id) {
      window.google.accounts.id.cancel();
    }
  });

  return (
    <div class="google-signin-container">
      {/* Loading overlay */}
      {isLoading() && (
        <div class="oauth-loading-overlay">
          <div class="loading-spinner"></div>
          <span>Signing in with Google...</span>
        </div>
      )}
      
      {/* Error message */}
      {error() && (
        <div class="error-message oauth-error">
          {error()}
        </div>
      )}
      
      {/* Google Sign-In button container - always present for ref, but conditionally visible */}
      <div 
        ref={buttonContainer}
        class={`google-signin-button ${isLoading() ? 'loading' : ''}`}
        style={{
          display: googleButtonRendered() ? 'block' : 'none',
          ...(isLoading() && { 'pointer-events': 'none', opacity: '0.6' })
        }}
      ></div>
      
      {/* Fallback button - show when not configured, script failed to load, or button failed to render */}
      {(!isConfigured || (googleScriptLoaded() && !googleButtonRendered())) && (
        <button 
          type="button"
          class="btn btn-google-fallback"
          disabled={isLoading() || !isConfigured}
          onClick={() => {
            if (!isConfigured) {
              setError('Google Sign-In is not configured. Please contact support.');
            } else {
              setError('Google Sign-In is not available. Please try again later.');
            }
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" class="google-icon">
            <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
            <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.04a4.8 4.8 0 0 1-7.18-2.53H1.83v2.07A8 8 0 0 0 8.98 17z"/>
            <path fill="#FBBC05" d="M4.5 10.49a4.8 4.8 0 0 1 0-3.07V5.35H1.83a8 8 0 0 0 0 7.28l2.67-2.14z"/>
            <path fill="#EA4335" d="M8.98 3.58c1.32 0 2.5.45 3.44 1.35l2.54-2.54a8.05 8.05 0 0 0-5.98-2.39 8 8 0 0 0-7.15 4.42l2.67 2.14c.63-1.89 2.39-3.25 4.48-3.25z"/>
          </svg>
          Sign in with Google
        </button>
      )}
      
      {/* Loading state when script is loading */}
      {!googleScriptLoaded() && !error() && (
        <div class="oauth-loading-overlay">
          <div class="loading-spinner"></div>
          <span>Loading Google Sign-In...</span>
        </div>
      )}
    </div>
  );
};
