import { createSignal, createEffect, Show, For } from 'solid-js';
import { API } from '../../api';
import { otherlinkStore } from '../../stores/otherlinkStore';

// Link type definitions with categories
const LINK_TYPES = {
  generic: {
    label: 'Website',
    types: [
      { value: 'url', label: 'Website URL', requiresUrl: true },
    ]
  },
  contact: {
    label: 'Contact',
    types: [
      { value: 'email', label: 'Email', placeholder: 'your@email.com', identifierLabel: 'Email Address' },
      { value: 'phone', label: 'Phone', placeholder: '+1234567890', identifierLabel: 'Phone Number' },
    ]
  },
  social: {
    label: 'Social Media',
    types: [
      { value: 'instagram', label: 'Instagram', placeholder: 'username', identifierLabel: 'Username' },
      { value: 'tiktok', label: 'TikTok', placeholder: 'username', identifierLabel: 'Username' },
      { value: 'twitter', label: 'X (Twitter)', placeholder: 'username', identifierLabel: 'Username' },
      { value: 'facebook', label: 'Facebook', placeholder: 'username', identifierLabel: 'Username' },
      { value: 'linkedin', label: 'LinkedIn', placeholder: 'username', identifierLabel: 'Username' },
      { value: 'youtube', label: 'YouTube', placeholder: 'channelname', identifierLabel: 'Channel Name' },
      { value: 'snapchat', label: 'Snapchat', placeholder: 'username', identifierLabel: 'Username' },
      { value: 'pinterest', label: 'Pinterest', placeholder: 'username', identifierLabel: 'Username' },
      { value: 'threads', label: 'Threads', placeholder: 'username', identifierLabel: 'Username' },
    ]
  },
  messaging: {
    label: 'Messaging',
    types: [
      { value: 'whatsapp', label: 'WhatsApp', placeholder: '1234567890', identifierLabel: 'Phone Number' },
      { value: 'messenger', label: 'Messenger', placeholder: 'username', identifierLabel: 'Username' },
      { value: 'telegram', label: 'Telegram', placeholder: 'username', identifierLabel: 'Username' },
      { value: 'discord', label: 'Discord', placeholder: 'invite-code', identifierLabel: 'Invite Code' },
    ]
  },
  professional: {
    label: 'Professional',
    types: [
      { value: 'github', label: 'GitHub', placeholder: 'username', identifierLabel: 'Username' },
      { value: 'gitlab', label: 'GitLab', placeholder: 'username', identifierLabel: 'Username' },
      { value: 'dribbble', label: 'Dribbble', placeholder: 'username', identifierLabel: 'Username' },
      { value: 'behance', label: 'Behance', placeholder: 'username', identifierLabel: 'Username' },
    ]
  },
  music: {
    label: 'Music',
    types: [
      { value: 'spotify', label: 'Spotify', placeholder: 'username', identifierLabel: 'Username' },
      { value: 'soundcloud', label: 'SoundCloud', placeholder: 'username', identifierLabel: 'Username' },
      { value: 'apple_music', label: 'Apple Music', placeholder: 'username', identifierLabel: 'Username' },
      { value: 'bandcamp', label: 'Bandcamp', placeholder: 'artistname', identifierLabel: 'Artist Name' },
    ]
  },
  video: {
    label: 'Video & Streaming',
    types: [
      { value: 'twitch', label: 'Twitch', placeholder: 'username', identifierLabel: 'Username' },
      { value: 'vimeo', label: 'Vimeo', placeholder: 'username', identifierLabel: 'Username' },
    ]
  },
  other: {
    label: 'Other',
    types: [
      { value: 'custom', label: 'Custom Link', requiresUrl: true },
    ]
  }
};

// Helper to find type config
const findTypeConfig = (typeValue) => {
  for (const category of Object.values(LINK_TYPES)) {
    const found = category.types.find(t => t.value === typeValue);
    if (found) return found;
  }
  return null;
};

export const LinkFormModal = (props) => {
  const [formData, setFormData] = createSignal({
    name: '',
    description: '',
    shortcode: '',
    url: '',
    platform_identifier: '',
    link_type: 'url',
    active: true
  });

  const [errors, setErrors] = createSignal({});
  const [loading, setLoading] = createSignal(false);
  const [shortcodeChecking, setShortcodeChecking] = createSignal(false);
  const [shortcodeAvailable, setShortcodeAvailable] = createSignal(null);

  // Get current type config
  const currentTypeConfig = () => findTypeConfig(formData().link_type);
  const requiresUrl = () => currentTypeConfig()?.requiresUrl === true;

  // Initialize form when modal opens or link changes
  createEffect(() => {
    if (props.isOpen && props.link) {
      // Edit mode - use existing data
      setFormData({
        name: props.link.name || '',
        description: props.link.description || '',
        shortcode: props.link.shortcode || '',
        url: props.link.url || '',
        platform_identifier: props.link.platform_identifier || '',
        link_type: props.link.link_type || 'url',
        active: props.link.active !== undefined ? props.link.active : true
      });
      setShortcodeAvailable(true);
    } else if (props.isOpen && !props.link) {
      // Create mode - reset
      setFormData({
        name: '',
        description: '',
        shortcode: '',
        url: '',
        platform_identifier: '',
        link_type: 'url',
        active: true
      });
      setShortcodeAvailable(null);
    }
    setErrors({});
  });

  // Generate shortcode when switching to URL type
  createEffect(() => {
    if (props.isOpen && requiresUrl() && !formData().shortcode) {
      handleGenerateShortcode();
    }
  });

  const generateRandomShortcode = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
    
    if (field === 'shortcode') {
      setShortcodeAvailable(null);
    }
  };

  const handleGenerateShortcode = async () => {
    const newShortcode = generateRandomShortcode();
    setFormData(prev => ({ ...prev, shortcode: newShortcode }));
    
    setShortcodeChecking(true);
    try {
      const excludeId = props.mode === 'edit' && props.link ? props.link.id : null;
      const response = await API.link.checkShortcode(newShortcode, excludeId);
      setShortcodeAvailable(response.data?.available || false);
      
      if (!response.data?.available) {
        setTimeout(() => handleGenerateShortcode(), 100);
      }
    } catch (err) {
      console.error('Failed to check shortcode:', err);
    } finally {
      setShortcodeChecking(false);
    }
  };

  const handleShortcodeBlur = async () => {
    const shortcode = formData().shortcode;
    if (!shortcode || shortcode.length < 3) return;

    setShortcodeChecking(true);
    try {
      const excludeId = props.mode === 'edit' && props.link ? props.link.id : null;
      const response = await API.link.checkShortcode(shortcode, excludeId);
      setShortcodeAvailable(response.data?.available || false);
      
      if (!response.data?.available) {
        setErrors(prev => ({
          ...prev,
          shortcode: 'This shortcode is already taken'
        }));
      }
    } catch (err) {
      console.error('Failed to check shortcode:', err);
    } finally {
      setShortcodeChecking(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const data = formData();
    const typeConfig = currentTypeConfig();

    if (!data.name || data.name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }

    if (!data.link_type) {
      newErrors.link_type = 'Link type is required';
    }

    if (requiresUrl()) {
      // URL type validation
      if (!data.shortcode || data.shortcode.trim().length < 3) {
        newErrors.shortcode = 'Shortcode must be at least 3 characters';
      } else if (!/^[a-z0-9-_]+$/i.test(data.shortcode)) {
        newErrors.shortcode = 'Shortcode can only contain letters, numbers, hyphens, and underscores';
      }

      if (!data.url || !data.url.trim()) {
        newErrors.url = 'URL is required';
      } else if (!/^https?:\/\/.+/i.test(data.url)) {
        newErrors.url = 'URL must start with http:// or https://';
      }
    } else {
      // Platform type validation
      if (!data.platform_identifier || !data.platform_identifier.trim()) {
        newErrors.platform_identifier = `${typeConfig?.identifierLabel || 'Identifier'} is required`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Check shortcode availability for URL types
    if (requiresUrl() && shortcodeAvailable() === null && formData().shortcode) {
      setShortcodeChecking(true);
      try {
        const excludeId = props.mode === 'edit' && props.link ? props.link.id : null;
        const response = await API.link.checkShortcode(formData().shortcode, excludeId);
        setShortcodeAvailable(response.data?.available || false);
        
        if (!response.data?.available) {
          setErrors(prev => ({
            ...prev,
            shortcode: 'This shortcode is already taken'
          }));
          setShortcodeChecking(false);
          return;
        }
      } catch (err) {
        console.error('Failed to check shortcode:', err);
        setShortcodeChecking(false);
        return;
      }
      setShortcodeChecking(false);
    }

    if (requiresUrl() && shortcodeAvailable() === false) {
      setErrors(prev => ({
        ...prev,
        shortcode: 'This shortcode is already taken'
      }));
      return;
    }

    setLoading(true);

    try {
      const data = {
        name: formData().name,
        description: formData().description,
        link_type: formData().link_type,
        active: formData().active,
        ...(props.mode === 'create' && { otherlink_id: otherlinkStore.selectedOtherlinkId() })
      };

      if (requiresUrl()) {
        data.url = formData().url;
        data.shortcode = formData().shortcode;
      } else {
        data.platform_identifier = formData().platform_identifier;
      }

      await props.onSave(data);
      handleClose();
    } catch (err) {
      console.error('Form submission error:', err);
      if (err.data && err.data.errors) {
        setErrors(err.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      shortcode: '',
      url: '',
      platform_identifier: '',
      link_type: 'url',
      active: true
    });
    setErrors({});
    setShortcodeAvailable(null);
    props.onClose();
  };

  return (
    <Show when={props.isOpen} fallback={null}>
      {() => (
        <div class="modal-overlay" onClick={handleClose}>
          <div class="modal-content link-form-modal" onClick={(e) => e.stopPropagation()}>
            <div class="modal-header">
              <h2>{props.mode === 'edit' ? 'Edit Link' : 'Create New Link'}</h2>
              <button class="modal-close" onClick={handleClose}>×</button>
            </div>

            <form onSubmit={handleSubmit} class="link-form">
              {/* Link Type - At the top */}
              <div class="form-group">
                <label for="link-type" class="form-label modal-label">
                  Link Type <span class="required">*</span>
                </label>
                <select
                  id="link-type"
                  class="form-select"
                  value={formData().link_type}
                  onChange={(e) => handleInputChange('link_type', e.target.value)}
                  required
                >
                  <For each={Object.entries(LINK_TYPES)}>
                    {([categoryKey, category]) => (
                      <optgroup label={category.label}>
                        <For each={category.types}>
                          {(type) => (
                            <option value={type.value}>{type.label}</option>
                          )}
                        </For>
                      </optgroup>
                    )}
                  </For>
                </select>
              </div>

              {/* Link Name */}
              <div class="form-group">
                <label for="link-name" class="form-label modal-label">
                  Link Name <span class="required">*</span>
                </label>
                <input
                  id="link-name"
                  type="text"
                  class={`form-input ${errors().name ? 'error' : ''}`}
                  value={formData().name}
                  onInput={(e) => handleInputChange('name', e.target.value)}
                  placeholder="My Portfolio"
                  required
                />
                <Show when={errors().name}>
                  <span class="form-error">{errors().name}</span>
                </Show>
              </div>

              {/* Description */}
              <div class="form-group">
                <label for="link-description" class="form-label modal-label">
                  Description
                </label>
                <textarea
                  id="link-description"
                  class="form-input"
                  value={formData().description}
                  onInput={(e) => handleInputChange('description', e.target.value)}
                  placeholder="A brief description of this link"
                  rows="2"
                />
              </div>

              {/* Platform Identifier - For non-URL types */}
              <Show when={!requiresUrl()}>
                <div class="form-group">
                  <label for="platform-identifier" class="form-label modal-label">
                    {currentTypeConfig()?.identifierLabel || 'Identifier'} <span class="required">*</span>
                  </label>
                  <input
                    id="platform-identifier"
                    type="text"
                    class={`form-input ${errors().platform_identifier ? 'error' : ''}`}
                    value={formData().platform_identifier}
                    onInput={(e) => handleInputChange('platform_identifier', e.target.value)}
                    placeholder={currentTypeConfig()?.placeholder || 'username'}
                    required
                  />
                  <Show when={errors().platform_identifier}>
                    <span class="form-error">{errors().platform_identifier}</span>
                  </Show>
                </div>
              </Show>

              {/* URL and Shortcode - Only for URL types */}
              <Show when={requiresUrl()}>
                <div class="form-group">
                  <label for="link-url" class="form-label modal-label">
                    URL <span class="required">*</span>
                  </label>
                  <input
                    id="link-url"
                    type="url"
                    class={`form-input ${errors().url ? 'error' : ''}`}
                    value={formData().url}
                    onInput={(e) => handleInputChange('url', e.target.value)}
                    placeholder="https://example.com"
                    required
                  />
                  <Show when={errors().url}>
                    <span class="form-error">{errors().url}</span>
                  </Show>
                </div>

                <div class="form-group">
                  <label for="link-shortcode" class="form-label modal-label">
                    Shortcode <span class="required">*</span>
                  </label>
                  <div class="shortcode-input-container">
                    <div class="input-with-feedback">
                      <input
                        id="link-shortcode"
                        type="text"
                        class={`form-input ${errors().shortcode ? 'error' : shortcodeAvailable() === true ? 'success' : ''}`}
                        value={formData().shortcode}
                        onInput={(e) => handleInputChange('shortcode', e.target.value.toLowerCase())}
                        onBlur={handleShortcodeBlur}
                        placeholder="abc123xyz"
                        required
                      />
                      <Show when={shortcodeChecking()}>
                        <span class="input-feedback checking">⏳</span>
                      </Show>
                      <Show when={!shortcodeChecking() && shortcodeAvailable() === true}>
                        <span class="input-feedback available">✓</span>
                      </Show>
                    </div>
                    <button
                      type="button"
                      class="btn btn-secondary btn-regenerate"
                      onClick={handleGenerateShortcode}
                      disabled={shortcodeChecking()}
                      title="Generate new random shortcode"
                    >
                      🔄
                    </button>
                  </div>
                  <small class="form-help modal-help">
                    yoursite.com/s/<strong>{formData().shortcode || 'shortcode'}</strong>
                  </small>
                  <Show when={errors().shortcode}>
                    <span class="form-error">{errors().shortcode}</span>
                  </Show>
                </div>
              </Show>

              {/* Active Toggle */}
              <div class="form-group">
                <label class="form-label modal-label">Visibility</label>
                <label class="form-checkbox">
                  <input
                    type="checkbox"
                    checked={formData().active}
                    onChange={(e) => handleInputChange('active', e.target.checked)}
                  />
                  <span>Active (link is publicly visible)</span>
                </label>
              </div>

              <div class="modal-footer">
                <button
                  type="button"
                  class="btn btn-secondary"
                  onClick={handleClose}
                  disabled={loading()}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="btn btn-primary"
                  disabled={loading() || shortcodeChecking()}
                >
                  {loading() ? 'Saving...' : props.mode === 'edit' ? 'Update Link' : 'Create Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Show>
  );
};
