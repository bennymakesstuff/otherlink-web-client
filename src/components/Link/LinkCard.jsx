import { createSignal } from 'solid-js';

export const LinkCard = (props) => {
  const [copied, setCopied] = createSignal(false);

  const copyShortcode = async () => {
    try {
      await navigator.clipboard.writeText(props.link.shortcode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy shortcode:', err);
    }
  };

  const getLinkTypeColor = (type) => {
    const colors = {
      url: 'blue',
      email: 'green',
      phone: 'purple',
      social_media: 'pink',
      custom: 'gray'
    };
    return colors[type] || 'gray';
  };

  const truncateUrl = (url, maxLength = 50) => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + '...';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div class="link-card">
      <div class="link-card-header">
        <div class="link-card-title-section">
          <h3 class="link-card-title">{props.link.name}</h3>
          <span class={`link-status-badge ${props.link.active ? 'active' : 'inactive'}`}>
            {props.link.active ? '✓ Active' : '○ Inactive'}
          </span>
        </div>
        <span class={`link-type-badge link-type-${getLinkTypeColor(props.link.link_type)}`}>
          {props.link.link_type_label}
        </span>
      </div>

      {props.link.description && (
        <p class="link-card-description">{props.link.description}</p>
      )}

      <div class="link-card-details">
        <div class="link-detail-row">
          <span class="link-detail-label">Shortcode:</span>
          <div class="link-shortcode-container">
            <code class="link-shortcode">{props.link.shortcode}</code>
            <button
              class="btn-icon-small"
              onClick={copyShortcode}
              title="Copy shortcode"
            >
              {copied() ? '✓' : '📋'}
            </button>
          </div>
        </div>

        <div class="link-detail-row">
          <span class="link-detail-label">URL:</span>
          <a 
            href={props.link.url} 
            target="_blank" 
            rel="noopener noreferrer"
            class="link-url"
            title={props.link.url}
          >
            {truncateUrl(props.link.url)}
            <span class="external-icon">↗</span>
          </a>
        </div>

        <div class="link-detail-row">
          <span class="link-detail-label">Created:</span>
          <span class="link-date">{formatDate(props.link.created_at)}</span>
        </div>
      </div>

      <div class="link-card-actions">
        <button
          class="btn btn-secondary btn-sm"
          onClick={() => props.onEdit(props.link)}
        >
          ✏️ Edit
        </button>
        <button
          class={`btn btn-sm ${props.link.active ? 'btn-warning' : 'btn-success'}`}
          onClick={() => props.onToggleActive(props.link)}
        >
          {props.link.active ? '⏸️ Deactivate' : '▶️ Activate'}
        </button>
        <button
          class="btn btn-danger btn-sm"
          onClick={() => props.onDelete(props.link)}
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );
};

