import { createSignal, onMount, Show, For } from 'solid-js';
import { useParams } from '@solidjs/router';
import { API } from '../api';
import './OtherlinkLandingPage.css';

/**
 * Public Otherlink Landing Page
 * Displays an otherlink's public page with all their active links
 */
export function OtherlinkLandingPage() {
  const params = useParams();
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal(null);
  const [otherlink, setOtherlink] = createSignal(null);
  const [links, setLinks] = createSignal([]);
  const [displayName, setDisplayName] = createSignal('');

  onMount(async () => {
    await loadOtherlink();
  });

  const loadOtherlink = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await API.otherlink.getOtherlinkByDisplayName(params.displayName);
      
      if (response.status && response.data) {
        setOtherlink(response.data.otherlink);
        setLinks(response.data.links || []);
        setDisplayName(response.data.display_name);
      } else {
        setError('Otherlink not found');
      }
    } catch (err) {
      console.error('Failed to load otherlink:', err);
      setError('Failed to load otherlink. It may not exist or has been deactivated.');
    } finally {
      setLoading(false);
    }
  };

  const getLinkIcon = (linkType) => {
    switch (linkType) {
      case 'email':
        return '✉️';
      case 'phone':
        return '📞';
      case 'social_media':
        return '📱';
      case 'url':
      default:
        return '🔗';
    }
  };

  const handleLinkClick = (link) => {
    // Open link in new tab
    window.open(link.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div class="landing-page">
      <Show
        when={!loading()}
        fallback={
          <div class="landing-loading">
            <div class="loading-spinner"></div>
            <p>Loading...</p>
          </div>
        }
      >
        <Show
          when={!error()}
          fallback={
            <div class="landing-error">
              <div class="error-icon">🔍</div>
              <h1>Oops!</h1>
              <p>{error()}</p>
              <a href="/" class="btn btn-primary">Go to Home</a>
            </div>
          }
        >
          <div class="landing-container">
            <header class="landing-header">
              <div class="landing-avatar">
                <span>{otherlink()?.name?.charAt(0)?.toUpperCase() || 'O'}</span>
              </div>
              <h1 class="landing-title">{otherlink()?.name}</h1>
              <Show when={otherlink()?.description}>
                <p class="landing-description">{otherlink()?.description}</p>
              </Show>
              <p class="landing-handle">@{displayName()}</p>
            </header>

            <main class="landing-links">
              <Show
                when={links().length > 0}
                fallback={
                  <div class="landing-no-links">
                    <p>No links available yet.</p>
                  </div>
                }
              >
                <For each={links()}>
                  {(link) => (
                    <button
                      class="landing-link-card"
                      onClick={() => handleLinkClick(link)}
                    >
                      <span class="link-icon">{getLinkIcon(link.link_type)}</span>
                      <div class="link-content">
                        <h3 class="link-name">{link.name}</h3>
                        <Show when={link.description}>
                          <p class="link-description">{link.description}</p>
                        </Show>
                      </div>
                      <span class="link-arrow">→</span>
                    </button>
                  )}
                </For>
              </Show>
            </main>

            <footer class="landing-footer">
              <p>
                Powered by <a href="/" class="footer-link">Otherlink</a>
              </p>
            </footer>
          </div>
        </Show>
      </Show>
    </div>
  );
}

