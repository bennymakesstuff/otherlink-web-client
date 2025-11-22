import { createSignal, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { API } from '../api';
import { otherlinkStore } from '../stores/otherlinkStore';
import './CreateOtherlink.css';

/**
 * CreateOtherlink Page
 * Full-page form for creating a new otherlink
 */
export function CreateOtherlink() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = createSignal({
    name: '',
    display_name: '',
    description: '',
    active: true
  });
  
  const [errors, setErrors] = createSignal({});
  const [submitting, setSubmitting] = createSignal(false);
  const [displayNameChecking, setDisplayNameChecking] = createSignal(false);
  const [displayNameAvailable, setDisplayNameAvailable] = createSignal(null);
  
  let displayNameCheckTimeout;

  const handleInputChange = (field, value) => {
    setFormData({ ...formData(), [field]: value });
    // Clear error for this field
    if (errors()[field]) {
      setErrors({ ...errors(), [field]: null });
    }

    // If display_name changes, trigger availability check
    if (field === 'display_name') {
      setDisplayNameAvailable(null);
      clearTimeout(displayNameCheckTimeout);
      
      // Only check if the display name is valid format
      if (value && value.length >= 3 && /^[a-z0-9-_]+$/.test(value)) {
        displayNameCheckTimeout = setTimeout(() => {
          checkDisplayNameAvailability(value);
        }, 500);
      }
    }
  };

  const checkDisplayNameAvailability = async (displayName) => {
    if (!displayName || displayName.length < 3) {
      return;
    }

    setDisplayNameChecking(true);
    try {
      const response = await API.otherlink.checkDisplayName(displayName);
      if (response.status && response.data) {
        setDisplayNameAvailable(response.data.available);
      }
    } catch (error) {
      console.error('Error checking display name:', error);
    } finally {
      setDisplayNameChecking(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const data = formData();

    if (!data.name || data.name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }

    if (!data.display_name || data.display_name.trim().length < 3) {
      newErrors.display_name = 'Display name must be at least 3 characters';
    } else if (!/^[a-z0-9-_]+$/.test(data.display_name)) {
      newErrors.display_name = 'Display name can only contain lowercase letters, numbers, hyphens, and underscores';
    } else if (displayNameAvailable() === false) {
      newErrors.display_name = 'This display name is already taken';
    }

    if (data.description && data.description.length > 1000) {
      newErrors.description = 'Description cannot exceed 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await API.otherlink.createOtherlink(formData());

      if (response.status) {
        // Add to store and select it
        otherlinkStore.addOtherlink(response.data.otherlink);
        
        // Navigate to dashboard
        navigate('/admin/dashboard');
      } else {
        setErrors({ submit: response.message || 'Failed to create otherlink' });
      }
    } catch (error) {
      console.error('Error creating otherlink:', error);
      setErrors({ submit: 'An unexpected error occurred' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div class="create-otherlink-page">
      <div class="create-otherlink-container">
        <div class="create-otherlink-header">
          <h1>Create Your First OtherLink</h1>
          <p class="subtitle">
            An OtherLink is like a "Link in Bio" page. It can contain multiple links that you'll manage together.
          </p>
        </div>

        <form class="create-otherlink-form" onSubmit={handleSubmit}>
          {errors().submit && (
            <div class="form-error-banner">{errors().submit}</div>
          )}

          <div class="form-group">
            <label for="otherlink-name" class="form-label">
              Name <span class="required">*</span>
            </label>
            <input
              id="otherlink-name"
              type="text"
              class={`form-input ${errors().name ? 'error' : ''}`}
              value={formData().name}
              onInput={(e) => handleInputChange('name', e.target.value)}
              placeholder="My Instagram Bio"
              required
              disabled={submitting()}
              autofocus
            />
            <small class="form-help">
              Give your OtherLink a descriptive name (e.g., "Instagram Bio", "YouTube Links", "Portfolio")
            </small>
            {errors().name && (
              <span class="form-error">{errors().name}</span>
            )}
          </div>

          <div class="form-group">
            <label for="otherlink-display-name" class="form-label">
              Display Name <span class="required">*</span>
            </label>
            <input
              id="otherlink-display-name"
              type="text"
              class={`form-input ${errors().display_name ? 'error' : displayNameAvailable() === true ? 'success' : ''}`}
              value={formData().display_name}
              onInput={(e) => handleInputChange('display_name', e.target.value.toLowerCase())}
              placeholder="myusername"
              required
              disabled={submitting()}
              maxLength="50"
            />
            <Show when={displayNameChecking()}>
              <span class="input-feedback checking">Checking availability...</span>
            </Show>
            <Show when={!displayNameChecking() && displayNameAvailable() === true}>
              <span class="input-feedback available">✓ Available</span>
            </Show>
            <Show when={!displayNameChecking() && displayNameAvailable() === false}>
              <span class="input-feedback unavailable">✗ Already taken</span>
            </Show>
            <small class="form-help">
              This will be your unique URL: <strong>yoursite.com/{formData().display_name || 'username'}</strong>
              <br />Only lowercase letters, numbers, hyphens, and underscores allowed
            </small>
            {errors().display_name && (
              <span class="form-error">{errors().display_name}</span>
            )}
          </div>

          <div class="form-group">
            <label for="otherlink-description" class="form-label">
              Description
            </label>
            <textarea
              id="otherlink-description"
              class={`form-input ${errors().description ? 'error' : ''}`}
              value={formData().description}
              onInput={(e) => handleInputChange('description', e.target.value)}
              placeholder="Optional description for internal use"
              rows="4"
              disabled={submitting()}
            />
            <small class="form-help">
              Add notes about this OtherLink (optional)
            </small>
            {errors().description && (
              <span class="form-error">{errors().description}</span>
            )}
          </div>

          <div class="form-group">
            <label class="form-checkbox">
              <input
                type="checkbox"
                checked={formData().active}
                onChange={(e) => handleInputChange('active', e.target.checked)}
                disabled={submitting()}
              />
              <span>Active</span>
            </label>
            <small class="form-help">
              Inactive OtherLinks are hidden but not deleted
            </small>
          </div>

          <div class="form-actions">
            <button 
              type="submit" 
              class="btn btn-primary btn-lg" 
              disabled={submitting()}
            >
              {submitting() ? 'Creating...' : 'Create OtherLink'}
            </button>
          </div>

          <div class="form-footer-note">
            <p>
              💡 <strong>Tip:</strong> You can create multiple OtherLinks later for different purposes 
              (e.g., one for Instagram, one for YouTube, etc.)
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

