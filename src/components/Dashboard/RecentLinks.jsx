import { createSignal, onMount, createEffect, on, Show, For } from 'solid-js';
import { A } from '@solidjs/router';
import { API } from '../../api';
import { otherlinkStore } from '../../stores/otherlinkStore';

export const RecentLinks = () => {
  const [links, setLinks] = createSignal([]);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal(null);
  const [copied, setCopied] = createSignal(null);

  const loadLinks = async () => {
    const selectedOtherlinkId = otherlinkStore.selectedOtherlinkId();
    
    if (!selectedOtherlinkId) {
      setLinks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await API.otherlink.getOtherlinkLinks(selectedOtherlinkId, 1, 5);
      if (response.data && response.data.links) {
        setLinks(response.data.links);
      }
    } catch (err) {
      console.error('Error loading recent links:', err);
      setError(err.message || 'Failed to load links');
    } finally {
      setLoading(false);
    }
  };

  onMount(() => {
    loadLinks();
  });

  // Reload when selected otherlink changes
  createEffect(
    on(
      () => otherlinkStore.selectedOtherlinkId(),
      () => {
        loadLinks();
      },
      { defer: true }
    )
  );

  const copyShortcode = async (shortcode, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await navigator.clipboard.writeText(shortcode);
      setCopied(shortcode);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy shortcode:', err);
    }
  };

  const getLinkTypeIcon = (type) => {
    const icons = {
      url: '🔗',
      email: '📧',
      phone: '📱',
      social_media: '📱',
      custom: '⚙️'
    };
    return icons[type] || '🔗';
  };

  const truncateText = (text, maxLength = 30) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div class="dashboard-card recent-links-widget">
      <div class="card-header">
        <h3>Recent Links</h3>
        <A href="/admin/links" class="view-all-link">View All →</A>
      </div>

      <div class="card-content">
        <Show
          when={!loading()}
          fallback={
            <div class="widget-loading">
              <div class="loading-spinner-small"></div>
              <p>Loading...</p>
            </div>
          }
        >
          <Show
            when={!error()}
            fallback={
              <div class="widget-error">
                <p class="error-text">⚠️ {error()}</p>
              </div>
            }
          >
            <Show
              when={links().length > 0}
              fallback={
                <div class="widget-empty">
                  <div class="empty-icon">🔗</div>
                  <p>No links yet</p>
                  <A href="/admin/links" class="btn btn-primary btn-sm">
                    Create Your First Link
                  </A>
                </div>
              }
            >
              <div class="recent-links-list">
                <For each={links()}>
                  {(link) => (
                    <div class="recent-link-item">
                      <div class="link-item-header">
                        <div class="link-item-title">
                          <span class="link-type-icon">{getLinkTypeIcon(link.link_type)}</span>
                          <span class="link-name" title={link.name}>
                            {truncateText(link.name, 25)}
                          </span>
                        </div>
                        <span class={`status-indicator ${link.active ? 'active' : 'inactive'}`}></span>
                      </div>

                      <div class="link-item-details">
                        <code class="link-shortcode-small" title={link.shortcode}>
                          {truncateText(link.shortcode, 20)}
                        </code>
                        <button
                          class="btn-icon-mini"
                          onClick={(e) => copyShortcode(link.shortcode, e)}
                          title="Copy shortcode"
                        >
                          {copied() === link.shortcode ? '✓' : '📋'}
                        </button>
                      </div>

                      <Show when={link.description}>
                        <p class="link-item-description" title={link.description}>
                          {truncateText(link.description, 40)}
                        </p>
                      </Show>
                    </div>
                  )}
                </For>
              </div>
            </Show>
          </Show>
        </Show>
      </div>
    </div>
  );
};

