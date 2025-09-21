import { createSignal } from 'solid-js';
import { authStore } from '../stores/authStore';
import { API } from '../api/index.js';

export const Profile = () => {
  const user = () => authStore.user;
  const [isEditing, setIsEditing] = createSignal(false);
  const [formData, setFormData] = createSignal({
    firstName: user()?.firstName || '',
    lastName: user()?.lastName || '',
    email: user()?.email || '',
  });
  const [isLoading, setIsLoading] = createSignal(false);
  const [message, setMessage] = createSignal('');

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const updatedUser = await API.user.updateProfile(formData());
      
      // Note: You might want to add a method to update user data in authStore
      setMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      setMessage('Error updating profile: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelEdit = () => {
    setFormData({
      firstName: user()?.firstName || '',
      lastName: user()?.lastName || '',
      email: user()?.email || '',
    });
    setIsEditing(false);
    setMessage('');
  };

  return (
    <div class="profile-page">
      <div class="profile-container">
        <div class="profile-header">
          <h1>Profile</h1>
          <p>Manage your account information and settings</p>
        </div>

        {message() && (
          <div class={`message ${message().includes('Error') ? 'error' : 'success'}`}>
            {message()}
          </div>
        )}

        <div class="profile-card">
          <div class="profile-avatar">
            <div class="avatar-placeholder">
              {user()?.firstName?.[0]}{user()?.lastName?.[0]}
            </div>
          </div>

          <form onSubmit={handleSubmit} class="profile-form">
            <div class="form-row">
              <div class="form-group">
                <label for="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  value={formData().firstName}
                  onInput={(e) => updateFormData('firstName', e.target.value)}
                  disabled={!isEditing() || isLoading()}
                  required
                />
              </div>
              
              <div class="form-group">
                <label for="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  value={formData().lastName}
                  onInput={(e) => updateFormData('lastName', e.target.value)}
                  disabled={!isEditing() || isLoading()}
                  required
                />
              </div>
            </div>

            <div class="form-group">
              <label for="email">Email</label>
              <input
                type="email"
                id="email"
                value={formData().email}
                onInput={(e) => updateFormData('email', e.target.value)}
                disabled={!isEditing() || isLoading()}
                required
              />
            </div>

            <div class="form-actions">
              {!isEditing() ? (
                <button 
                  type="button" 
                  class="btn btn-primary"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </button>
              ) : (
                <div class="edit-actions">
                  <button 
                    type="submit" 
                    class="btn btn-primary"
                    disabled={isLoading()}
                  >
                    {isLoading() ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button 
                    type="button" 
                    class="btn btn-secondary"
                    onClick={cancelEdit}
                    disabled={isLoading()}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>

        <div class="profile-info-card">
          <h3>Account Information</h3>
          <div class="info-grid">
            <div class="info-item">
              <label>User Roles</label>
              <div class="roles-list">
                {user()?.roles?.length > 0 ? (
                  user().roles.map(role => (
                    <span class="role-badge">{role.name}</span>
                  ))
                ) : (
                  <span class="no-roles">No roles assigned</span>
                )}
              </div>
            </div>
            
            <div class="info-item">
              <label>Account Created</label>
              <span>{user()?.createdAt ? new Date(user().createdAt).toLocaleDateString() : 'Unknown'}</span>
            </div>
            
            <div class="info-item">
              <label>Last Login</label>
              <span>{user()?.lastLogin ? new Date(user().lastLogin).toLocaleDateString() : 'Unknown'}</span>
            </div>
            
            <div class="info-item">
              <label>User ID</label>
              <span>#{user()?.id || 'Unknown'}</span>
            </div>
            
            {user()?.username && (
              <div class="info-item">
                <label>Username</label>
                <span>{user().username}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
