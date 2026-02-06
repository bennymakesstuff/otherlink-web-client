import { createSignal, createEffect, Show } from 'solid-js';
import { API } from '../../api';
import './OtherlinkFormModal.css';

/**
 * OtherlinkFormModal Component
 * Modal for creating and editing otherlinks
 */
export function OtherlinkFormModal(props) {
  const [formData, setFormData] = createSignal({
    name: '',
    description: '',
    active: true
  });
  
  const [errors, setErrors] = createSignal({});
  const [submitting, setSubmitting] = createSignal(false);

  // Reset form when modal opens or otherlink changes
  createEffect(() => {
    if (props.isOpen) {
      if (props.otherlink) {
        // Edit mode
        setFormData({
          name: props.otherlink.name || '',
          description: props.otherlink.description || '',
          active: props.otherlink.active ?? true
        });
      } else {
        // Create mode
        resetForm();
      }
      setErrors({});
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      active: true
    });
    setErrors({});
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData(), [field]: value });
    // Clear error for this field
    if (errors()[field]) {
      setErrors({ ...errors(), [field]: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const data = formData();

    if (!data.name || data.name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
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
      let response;
      
      if (props.otherlink) {
        // Update existing
        response = await API.otherlink.updateOtherlink(props.otherlink.id, formData());
      } else {
        // Create new
        response = await API.otherlink.createOtherlink(formData());
      }

      if (response.status) {
        resetForm();
        if (props.onSuccess) {
          props.onSuccess(response.data.otherlink);
        }
      } else {
        setErrors({ submit: response.message || 'Failed to save otherlink' });
      }
    } catch (error) {
      console.error('Error saving otherlink:', error);
      setErrors({ submit: 'An unexpected error occurred' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting()) {
      resetForm();
      if (props.onClose) {
        props.onClose();
      }
    }
  };

  return (
    <Show when={props.isOpen} fallback={null}>
      <div class="modal-overlay" onClick={handleClose}>
        <div class="modal-content otherlink-form-modal" onClick={(e) => e.stopPropagation()}>
          <div class="modal-header">
            <h2 class="modal-title">
              {props.otherlink ? 'Edit OtherLink' : 'Create New OtherLink'}
            </h2>
            <button class="modal-close" onClick={handleClose} disabled={submitting()}>
              ×
            </button>
          </div>

          <form class="modal-body" onSubmit={handleSubmit}>
            <Show when={errors().submit}>
              <div class="form-error-banner">{errors().submit}</div>
            </Show>

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
              />
              <small class="form-help">
                A descriptive name for this OtherLink (e.g., "Instagram Bio", "YouTube Links")
              </small>
              <Show when={errors().name}>
                <span class="form-error">{errors().name}</span>
              </Show>
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
                rows="3"
                disabled={submitting()}
              />
              <Show when={errors().description}>
                <span class="form-error">{errors().description}</span>
              </Show>
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

            <div class="modal-footer">
              <button 
                type="button" 
                class="btn btn-secondary" 
                onClick={handleClose}
                disabled={submitting()}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                class="btn btn-primary" 
                disabled={submitting()}
              >
                {submitting() ? 'Saving...' : props.otherlink ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Show>
  );
}


