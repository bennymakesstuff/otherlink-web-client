# Avatar Management System

This document explains the avatar functionality implemented in the web client, including upload, display, and management features.

## Overview

The avatar system allows users to:
- ✅ Upload profile avatar images (JPEG, PNG, WebP)
- ✅ Preview images before uploading
- ✅ Drag and drop file upload
- ✅ Remove existing avatars
- ✅ Display avatars throughout the app
- ✅ Automatic fallback to initials
- ✅ File validation and error handling

## API Integration

### Backend Endpoints Used

```bash
# Upload avatar
POST /api/files/upload/avatar
Content-Type: multipart/form-data
Body: FormData with 'avatar' field

# Remove avatar
DELETE /api/files/avatar?delete_file=true

# Get user profile (includes avatar data)
GET /api/user/profile
```

### Avatar Data Format

```javascript
{
  has_avatar: true,
  avatar_url: "https://bucket.s3.amazonaws.com/avatars/user123.jpg",
  avatar_file_id: 123,
  file_size: 256000,
  formatted_file_size: "250.00 KB",
  mime_type: "image/jpeg",
  uploaded_at: "2025-09-25 16:30:00",
  is_public: true
}
```

## Components

### 1. AvatarUpload Component

**Location**: `src/components/AvatarUpload.jsx`

**Usage**:
```jsx
import { AvatarUpload } from '../components/AvatarUpload';

<AvatarUpload
  currentAvatar={user?.has_avatar ? {
    avatar_url: user.avatar_url,
    formatted_file_size: user.avatar?.formatted_file_size,
    file_size: user.avatar?.file_size
  } : null}
  onUploadSuccess={(avatarData) => {
    // Handle successful upload
    authStore.updateAvatar(avatarData);
  }}
  onRemove={async () => {
    // Handle avatar removal
    await authStore.removeAvatar();
  }}
/>
```

**Features**:
- Drag and drop file upload
- Image preview before upload
- File validation (type, size)
- Progress states
- Error handling
- Current avatar display with remove option

**File Validation**:
- **Allowed types**: JPEG, PNG, WebP
- **Max size**: 5MB
- **Auto validation**: Real-time feedback

### 2. UserAvatar Component

**Location**: `src/components/UserAvatar.jsx`

**Usage**:
```jsx
import { UserAvatar } from '../components/UserAvatar';

// Default size (32px)
<UserAvatar />

// Custom size
<UserAvatar size={48} />
```

**Features**:
- Automatic avatar/initials display
- Fallback to user initials if no avatar
- Error handling for broken images
- Customizable size
- Responsive design

## Auth Store Integration

### New Methods Added

```javascript
// Update user avatar after upload
authStore.updateAvatar(avatarData)

// Remove user avatar
await authStore.removeAvatar()

// Refresh user profile data
await authStore.refreshUserProfile()
```

### Automatic Avatar Handling

Avatar data is automatically included in:
- Login responses (`/api/login`)
- Token validation responses (`/api/token/validate`)
- Profile responses (`/api/user/profile`)

The auth store preserves avatar information across sessions.

## Profile Page Integration

**Location**: `src/pages/Profile.jsx`

The Profile page now includes:
- Avatar upload section at the top
- Current avatar display
- Upload/change/remove functionality
- Success/error messaging

**Avatar Section Structure**:
```jsx
<div class="profile-avatar-section">
  <h3>Profile Avatar</h3>
  <AvatarUpload
    currentAvatar={/* current avatar data */}
    onUploadSuccess={handleAvatarUploadSuccess}
    onRemove={handleAvatarRemove}
  />
</div>
```

## Styling Classes

### Avatar Upload Styles

```css
.avatar-upload              /* Main container */
.file-drop-zone             /* Drag & drop area */
.file-drop-zone.drag-over   /* Active drag state */
.file-drop-zone.has-file    /* File selected state */
.current-avatar             /* Current avatar display */
.avatar-preview-image       /* Avatar image styling */
.upload-prompt              /* Upload instruction area */
.upload-actions             /* Upload/cancel buttons */
.avatar-actions             /* Change/remove buttons */
```

### Avatar Display Styles

```css
.user-avatar                /* Avatar image */
.user-avatar-placeholder    /* Initials fallback */
.profile-avatar-section     /* Profile page avatar area */
```

### Button Styles

```css
.btn-outline                /* Outlined button style */
.btn-danger-outline         /* Danger outlined button */
```

## File Handling

### Supported Formats
- **JPEG/JPG**: High compression, good for photos
- **PNG**: Transparency support, good for graphics
- **WebP**: Modern format, best compression

### Size Limitations
- **Maximum**: 5MB per file
- **Recommended**: Under 1MB for best performance
- **Minimum**: No minimum size restriction

### Upload Process
1. File selection (click or drag & drop)
2. Client-side validation
3. Image preview generation
4. User confirmation
5. FormData upload to server
6. Avatar URL returned and displayed

## Error Handling

### Client-side Validation
- File type checking
- File size validation
- Image format verification
- Real-time feedback

### Server-side Error Handling
- Network error recovery
- Upload failure messages
- Authentication errors
- File processing errors

### User Experience
- Clear error messages
- Retry functionality
- Graceful degradation
- Loading states

## Responsive Design

### Mobile Optimizations
- Touch-friendly drag & drop
- Smaller avatar sizes
- Stacked button layouts
- Optimized file dialogs

### Desktop Features
- Hover states
- Drag & drop highlighting
- Keyboard navigation
- Tooltips

## Integration with Camera (Future)

The avatar system is designed to work with camera functionality:

```javascript
// Future camera integration
const handleCameraCapture = (imageBlob) => {
  const file = new File([imageBlob], 'camera-avatar.jpg', {
    type: 'image/jpeg'
  });
  
  // Use existing upload logic
  avatarUploadComponent.handleFileSelect(file);
};
```

## Security Considerations

### Client-side Security
- File type validation
- Size restrictions
- Image-only uploads
- No executable files

### Server-side Security
- Additional validation on backend
- Virus scanning (if implemented)
- File type verification
- Storage access controls

## Performance Optimizations

### Image Handling
- Client-side compression (future)
- Lazy loading for avatar displays
- Cached avatar URLs
- Optimized image formats

### Upload Process
- Progress tracking
- Chunked uploads (for large files)
- Error recovery
- Background processing

## Testing the Implementation

### Upload Flow
1. Go to Profile page
2. Click avatar upload area or drag image
3. Select/drop a valid image file
4. Verify preview appears
5. Click "Upload Avatar"
6. Confirm success message and avatar display

### Remove Flow
1. With existing avatar on Profile page
2. Click "Remove Avatar" button
3. Confirm avatar disappears
4. Verify initials fallback appears

### Error Cases
1. Try uploading invalid file type
2. Try uploading oversized file
3. Test network error scenarios
4. Verify error messages appear

## Troubleshooting

### Common Issues

**Avatar not displaying:**
- Check network connectivity
- Verify avatar_url in user data
- Check browser console for errors
- Confirm S3/storage permissions

**Upload failing:**
- Verify file size under 5MB
- Check file format (JPEG/PNG/WebP)
- Confirm authentication token
- Check browser console for errors

**Styling issues:**
- Verify CSS classes are loaded
- Check for conflicting styles
- Test on different screen sizes
- Validate HTML structure

### Debug Information

```javascript
// Check current user avatar data
console.log('User avatar:', authStore.user?.avatar);
console.log('Has avatar:', authStore.user?.has_avatar);
console.log('Avatar URL:', authStore.user?.avatar_url);

// Test avatar upload
const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
console.log('File validation:', validateFile(testFile));
```

This avatar system provides a complete, user-friendly solution for profile image management with robust error handling, validation, and responsive design.
