import { createSignal, createEffect } from 'solid-js';
import { API } from '../api/index.js';

export const AvatarUpload = (props) => {
  const [selectedFile, setSelectedFile] = createSignal(null);
  const [previewUrl, setPreviewUrl] = createSignal(null);
  const [isUploading, setIsUploading] = createSignal(false);
  const [error, setError] = createSignal('');
  const [dragOver, setDragOver] = createSignal(false);
  
  let fileInputRef;

  // File validation constants
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  // Clean up preview URL when component unmounts
  createEffect(() => {
    const url = previewUrl();
    return () => {
      if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    };
  });

  const validateFile = (file) => {
    if (!file) return 'Please select a file';
    
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Please select a valid image file (JPEG, PNG, or WebP)';
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return `File size must be less than ${formatFileSize(MAX_FILE_SIZE)}`;
    }
    
    return null;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = (file) => {
    setError('');
    
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSelectedFile(file);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    if (previewUrl() && previewUrl().startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl());
    }
    setPreviewUrl(url);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleUpload = async () => {
    const file = selectedFile();
    if (!file) return;

    setIsUploading(true);
    setError('');

    try {
      const response = await API.user.uploadAvatar(file);
      
      // Call success callback with full response
      props.onUploadSuccess?.(response);
      
      // Clear selection
      clearSelection();
      
    } catch (err) {
      console.error('Avatar upload error:', err);
      setError(err.message || 'Failed to upload avatar. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    if (previewUrl() && previewUrl().startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl());
    }
    setPreviewUrl(null);
    setError('');
    if (fileInputRef) {
      fileInputRef.value = '';
    }
  };

  const openFileDialog = () => {
    fileInputRef?.click();
  };

  return (
    <div class="avatar-upload">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_TYPES.join(',')}
        onChange={handleFileInputChange}
        style="display: none;"
      />

      {/* Current avatar display */}
      {props.currentAvatar && !selectedFile() && (
        <div class="current-avatar">
          <img 
            src={props.currentAvatar.avatar_url} 
            alt="Current avatar"
            class="avatar-preview-image"
          />
          <div class="avatar-info">
            <p>Current avatar</p>
            <span class="file-size">{props.currentAvatar.formatted_file_size}</span>
          </div>
        </div>
      )}

      {/* File drop zone */}
      <div 
        class={`file-drop-zone ${dragOver() ? 'drag-over' : ''} ${selectedFile() ? 'has-file' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={selectedFile() ? undefined : openFileDialog}
      >
        {selectedFile() ? (
          <div class="file-preview">
            <img 
              src={previewUrl()} 
              alt="Avatar preview"
              class="avatar-preview-image"
            />
            <div class="file-details">
              <p class="file-name">{selectedFile().name}</p>
              <span class="file-size">{formatFileSize(selectedFile().size)}</span>
            </div>
          </div>
        ) : (
          <div class="upload-prompt">
            <div class="upload-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17,8 12,3 7,8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <p class="upload-text">
              <strong>Click to upload</strong> or drag and drop
            </p>
            <p class="upload-hint">
              PNG, JPG, WebP up to {formatFileSize(MAX_FILE_SIZE)}
            </p>
          </div>
        )}
      </div>

      {/* Error message */}
      {error() && (
        <div class="error-message">
          {error()}
        </div>
      )}

      {/* Action buttons */}
      {selectedFile() && (
        <div class="upload-actions">
          <button 
            type="button" 
            class="btn btn-secondary" 
            onClick={clearSelection}
            disabled={isUploading()}
          >
            Cancel
          </button>
          <button 
            type="button" 
            class="btn btn-primary" 
            onClick={handleUpload}
            disabled={isUploading()}
          >
            {isUploading() ? 'Uploading...' : 'Upload Avatar'}
          </button>
        </div>
      )}

      {/* Change/Remove buttons for existing avatar */}
      {props.currentAvatar && !selectedFile() && (
        <div class="avatar-actions">
          <button 
            type="button" 
            class="btn btn-outline" 
            onClick={openFileDialog}
            disabled={isUploading()}
          >
            Change Avatar
          </button>
          <button 
            type="button" 
            class="btn btn-danger-outline" 
            onClick={props.onRemove}
            disabled={isUploading()}
          >
            Remove Avatar
          </button>
        </div>
      )}
    </div>
  );
};
