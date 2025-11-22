import { createSignal, createEffect, Show } from 'solid-js';
import { useNavigate, useLocation } from '@solidjs/router';
import { otherlinkStore } from '../stores/otherlinkStore';

/**
 * OtherlinkGuard
 * Ensures user has at least one otherlink before accessing protected routes
 * Redirects to /admin/create-otherlink if they don't have any
 */
export const OtherlinkGuard = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [checking, setChecking] = createSignal(true);
  const [hasOtherlinks, setHasOtherlinks] = createSignal(false);

  createEffect(() => {
    // Don't check on the create page itself
    if (location.pathname === '/admin/create-otherlink') {
      setChecking(false);
      setHasOtherlinks(true); // Allow access to create page
      return;
    }

    // Load otherlinks and check
    const checkOtherlinks = async () => {
      try {
        // Always try to load otherlinks to ensure we have the latest data
        await otherlinkStore.loadOtherlinks();

        // Check if user has otherlinks
        const hasAny = otherlinkStore.otherlinks().length > 0;
        setHasOtherlinks(hasAny);
        setChecking(false);

        // Redirect to create page if no otherlinks
        if (!hasAny && location.pathname !== '/admin/create-otherlink') {
          navigate('/admin/create-otherlink', { replace: true });
        }
      } catch (error) {
        console.error('Error loading otherlinks in guard:', error);
        setChecking(false);
        setHasOtherlinks(false);
      }
    };

    checkOtherlinks();
  });

  return (
    <Show 
      when={!checking()} 
      fallback={
        <div class="auth-loading">
          <div class="loading-spinner"></div>
          <p>Loading your OtherLinks...</p>
        </div>
      }
    >
      <Show 
        when={hasOtherlinks()}
        fallback={null}
      >
        {props.children}
      </Show>
    </Show>
  );
};

