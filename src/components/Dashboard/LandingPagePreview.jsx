import { createSignal, createEffect, Show, For, on } from 'solid-js';
import { otherlinkStore } from '../../stores/otherlinkStore';
import { API } from '../../api';
import './LandingPagePreview.css';

/**
 * Landing Page Preview Component
 * Shows a scaled-down preview of the otherlink landing page
 */
export function LandingPagePreview() {
  const [links, setLinks] = createSignal([]);
  const [loading, setLoading] = createSignal(true);

  createEffect(
    on(
      () => otherlinkStore.selectedOtherlinkId(),
      () => {
        const selectedOtherlink = otherlinkStore.selectedOtherlink();
        console.log('LandingPagePreview - Selected Otherlink:', selectedOtherlink);
        console.log('LandingPagePreview - Display Name:', selectedOtherlink?.display_name);
        loadPreviewData();
      }
    )
  );

  const loadPreviewData = async () => {
    const selectedOtherlink = otherlinkStore.selectedOtherlink();
    if (!selectedOtherlink || !selectedOtherlink.id) {
      console.log('LandingPagePreview - No otherlink selected');
      setLoading(false);
      setLinks([]);
      return;
    }

    try {
      setLoading(true);
      console.log('LandingPagePreview - Fetching links for otherlink:', selectedOtherlink.id);
      // Get links for the selected otherlink (only active ones for preview)
      const response = await API.link.getLinks(selectedOtherlink.id, 1, 10, { active: true });
      
      console.log('LandingPagePreview - Links response:', response);
      
      if (response.status && response.data.links) {
        console.log('LandingPagePreview - Setting links:', response.data.links.slice(0, 5));
        setLinks(response.data.links.slice(0, 5)); // Show max 5 links in preview
      } else {
        console.log('LandingPagePreview - No links in response');
        setLinks([]);
      }
    } catch (error) {
      console.error('LandingPagePreview - Failed to load preview data:', error);
      setLinks([]);
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

  const getPreviewUrl = () => {
    const displayName = otherlinkStore.selectedOtherlink()?.display_name;
    return displayName ? `${window.location.origin}/${displayName}` : '#';
  };

  return (
    <div class="landing-preview-card">
      <Show
        when={!loading()}
        fallback={
          <div class="preview-loading">
            <div class="loading-spinner-small"></div>
            <p>Loading preview...</p>
          </div>
        }
      >
        <Show
          when={otherlinkStore.selectedOtherlink()}
          fallback={
            <div class="preview-empty">
              <p>No otherlink selected</p>
            </div>
          }
        >
          <div class="preview-container">
            <div class="preview-phone">
              <div class="preview-phone-header">
                <div class="preview-avatar">
                  <span>{otherlinkStore.selectedOtherlink()?.name?.charAt(0)?.toUpperCase() || 'O'}</span>
                </div>
                <h4 class="preview-title">{otherlinkStore.selectedOtherlink()?.name}</h4>
                <Show when={otherlinkStore.selectedOtherlink()?.description}>
                  <p class="preview-description">{otherlinkStore.selectedOtherlink()?.description}</p>
                </Show>
                <p class="preview-handle">@{otherlinkStore.selectedOtherlink()?.display_name || 'yourname'}</p>
              </div>

              <div class="preview-links">
                <Show
                  when={links().length > 0}
                  fallback={
                    <div class="preview-no-links">
                      <p>No links yet</p>
                    </div>
                  }
                >
                  <For each={links()}>
                    {(link) => (
                      <div class="preview-link-item">
                        <span class="preview-link-icon">{getLinkIcon(link.link_type)}</span>
                        <span class="preview-link-name">{link.name}</span>
                      </div>
                    )}
                  </For>
                  <Show when={links().length >= 5}>
                    <p class="preview-more">And more...</p>
                  </Show>
                </Show>
              </div>
            </div>
          </div>
        </Show>
      </Show>
    </div>
  );
}

