import { createSignal, createEffect, Show } from 'solid-js';
import { API } from '../../api';
import { otherlinkStore } from '../../stores/otherlinkStore';

export const LinkFormModal = (props) => {
  const [formData, setFormData] = createSignal({
    name: '',
    description: '',
    shortcode: '',
    url: '',
    link_type: 'url',
    active: true
  });

  const [errors, setErrors] = createSignal({});
  const [loading, setLoading] = createSignal(false);
  const [shortcodeChecking, setShortcodeChecking] = createSignal(false);
  const [shortcodeAvailable, setShortcodeAvailable] = createSignal(null);

  const linkTypes = [
    { value: 'url', label: 'URL' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'social_media', label: 'Social Media' },
    { value: 'custom', label: 'Custom' }
  ];

  // Initialize form when modal opens or link changes
  createEffect(() => {
    if (props.isOpen && props.link) {
      // Edit mode - use existing data
      setFormData({
        name: props.link.name || '',
        description: props.link.description || '',
        shortcode: props.link.shortcode || '',
        url: props.link.url || '',
        link_type: props.link.link_type || 'url',
        active: props.link.active !== undefined ? props.link.active : true
      });
      setShortcodeAvailable(true); // Existing shortcode is valid
    } else if (props.isOpen && !props.link) {
      // Create mode - reset and generate random shortcode
      setFormData({
        name: '',
        description: '',
        shortcode: '',
        url: '',
        link_type: 'url',
        active: true
      });
      // Auto-generate random shortcode
      setTimeout(() => handleGenerateShortcode(), 100);
    }
    setErrors({});
  });

  // Generate a random shortcode (8 characters: letters and numbers)
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
    // Clear error for this field
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
    
    // If shortcode is manually changed, reset availability check
    if (field === 'shortcode') {
      setShortcodeAvailable(null);
    }
  };

  const handleGenerateShortcode = async () => {
    const newShortcode = generateRandomShortcode();
    setFormData(prev => ({ ...prev, shortcode: newShortcode }));
    
    // Auto-check availability
    setShortcodeChecking(true);
    try {
      const excludeId = props.mode === 'edit' && props.link ? props.link.id : null;
      const response = await API.link.checkShortcode(newShortcode, excludeId);
      setShortcodeAvailable(response.data?.available || false);
      
      // If not available, try again
      if (!response.data?.available) {
        console.log('Shortcode taken, generating new one...');
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

    if (!data.name || data.name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }

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

    if (!data.link_type) {
      newErrors.link_type = 'Link type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Check shortcode availability before submission if not already checked
    if (shortcodeAvailable() === null && formData().shortcode) {
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

    // Prevent submission if shortcode is known to be unavailable
    if (shortcodeAvailable() === false) {
      setErrors(prev => ({
        ...prev,
        shortcode: 'This shortcode is already taken'
      }));
      return;
    }

    setLoading(true);

    try {
      const data = {
        ...formData(),
        // Add otherlink_id for new links (not needed for edits as link already belongs to otherlink)
        ...(props.mode === 'create' && { otherlink_id: otherlinkStore.selectedOtherlinkId() })
      };
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
          <div class="form-group">
            <label for="link-name" class="form-label">
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

          <div class="form-group">
            <label for="link-description" class="form-label">
              Description
            </label>
            <textarea
              id="link-description"
              class="form-input"
              value={formData().description}
              onInput={(e) => handleInputChange('description', e.target.value)}
              placeholder="A brief description of this link"
              rows="3"
            />
          </div>

          <div class="form-group">
            <label for="link-shortcode" class="form-label">
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
                🔄 Regenerate
              </button>
            </div>
            <small class="form-help">
              Auto-generated random shortcode • yoursite.com/s/<strong>{formData().shortcode || 'shortcode'}</strong>
            </small>
            <Show when={errors().shortcode}>
              <span class="form-error">{errors().shortcode}</span>
            </Show>
          </div>

          <div class="form-group">
            <label for="link-url" class="form-label">
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
            <label for="link-type" class="form-label">
              Link Type <span class="required">*</span>
            </label>
            <select
              id="link-type"
              class="form-select"
              value={formData().link_type}
              onChange={(e) => handleInputChange('link_type', e.target.value)}
              required
            >
              {linkTypes.map(type => (
                <option value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div class="form-group">
            <label class="form-checkbox">
              <input
                type="checkbox"
                checked={formData().active}
                onChange={(e) => handleInputChange('active', e.target.checked)}
              />
              <span>Active (link is publicly accessible)</span>
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

