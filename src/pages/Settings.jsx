import { createSignal } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { authStore } from '../stores/authStore';
import { API } from '../api/index.js';

export const Settings = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = createSignal(false);
  const [message, setMessage] = createSignal('');
  
  const [passwordData, setPasswordData] = createSignal({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const updatePasswordData = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage('');
    
    const data = passwordData();
    
    if (data.newPassword !== data.confirmPassword) {
      setMessage('New passwords do not match');
      return;
    }

    if (data.newPassword.length < 8) {
      setMessage('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);
    
    try {
      await API.user.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });

      setMessage('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setMessage('Error: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    if (confirm('Are you sure you want to log out?')) {
      await authStore.logout();
      navigate('/');
    }
  };

  return (
    <div class="settings-page">
      <div class="settings-container">
        <div class="settings-header">
          <h1>Settings</h1>
          <p>Manage your account preferences and security</p>
        </div>

        {message() && (
          <div class={`message ${message().includes('Error') ? 'error' : 'success'}`}>
            {message()}
          </div>
        )}

        <div class="settings-section">
          <h2>Security</h2>
          
          <div class="settings-card">
            <h3>Change Password</h3>
            <form onSubmit={handlePasswordChange} class="settings-form">
              <div class="form-group">
                <label for="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  value={passwordData().currentPassword}
                  onInput={(e) => updatePasswordData('currentPassword', e.target.value)}
                  required
                  disabled={isLoading()}
                />
              </div>
              
              <div class="form-group">
                <label for="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  value={passwordData().newPassword}
                  onInput={(e) => updatePasswordData('newPassword', e.target.value)}
                  required
                  disabled={isLoading()}
                  minLength="8"
                />
              </div>
              
              <div class="form-group">
                <label for="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={passwordData().confirmPassword}
                  onInput={(e) => updatePasswordData('confirmPassword', e.target.value)}
                  required
                  disabled={isLoading()}
                  minLength="8"
                />
              </div>
              
              <button 
                type="submit" 
                class="btn btn-primary"
                disabled={isLoading()}
              >
                {isLoading() ? 'Changing Password...' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>

        <div class="settings-section">
          <h2>Account</h2>
          
          <div class="settings-card">
            <h3>Session Management</h3>
            <p>Manage your active sessions and sign out</p>
            
            <div class="session-info">
              <div class="session-item">
                <span class="session-indicator active"></span>
                Current Session (Active)
              </div>
            </div>
            
            <button 
              type="button" 
              class="btn btn-danger"
              onClick={handleLogout}
            >
              Sign Out
            </button>
          </div>
        </div>

        <div class="settings-section">
          <h2>Preferences</h2>
          
          <div class="settings-card">
            <h3>Display</h3>
            <div class="preference-group">
              <label class="preference-label">
                <input type="checkbox" />
                <span>Dark mode (coming soon)</span>
              </label>
              
              <label class="preference-label">
                <input type="checkbox" defaultChecked />
                <span>Email notifications</span>
              </label>
              
              <label class="preference-label">
                <input type="checkbox" defaultChecked />
                <span>Show activity feed</span>
              </label>
            </div>
          </div>
        </div>

        <div class="settings-section danger-zone">
          <h2>Danger Zone</h2>
          
          <div class="settings-card danger">
            <h3>Delete Account</h3>
            <p>Permanently delete your account and all associated data. This action cannot be undone.</p>
            
            <button 
              type="button" 
              class="btn btn-danger"
              onClick={() => alert('Account deletion is not yet implemented')}
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
