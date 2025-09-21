import { createSignal } from 'solid-js';
import { authStore } from '../stores/authStore';
import { API } from '../api/index.js';

export const Profile = () => {
  const user = () => authStore.user;
  const [isEditing, setIsEditing] = createSignal(false);
  const [formData, setFormData] = createSignal({
    first_name: user()?.first_name || '',
    last_name: user()?.last_name || '',
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
      await API.user.updateProfile({
        first_name: formData().first_name,
        last_name: formData().last_name
      });
      
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
      first_name: user()?.first_name || '',
      last_name: user()?.last_name || '',
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
              {user()?.first_name?.[0]}{user()?.last_name?.[0]}
            </div>
          </div>

          <form onSubmit={handleSubmit} class="profile-form">
            <div class="form-row">
              <div class="form-group">
                <label for="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  value={formData().first_name}
                  onInput={(e) => updateFormData('first_name', e.target.value)}
                  disabled={!isEditing() || isLoading()}
                  required
                />
              </div>
              
              <div class="form-group">
                <label for="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  value={formData().last_name}
                  onInput={(e) => updateFormData('last_name', e.target.value)}
                  disabled={!isEditing() || isLoading()}
                  required
                />
              </div>
            </div>

            {/* Email management moved to separate section */}

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
            
            <div class="info-item">
              <label>Full Name</label>
              <span>{user()?.full_name || 'Not set'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
