import { createSignal, onMount, For, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { authStore } from '../stores/authStore';
import { API } from '../api/index.js';

export const Settings = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = createSignal(false);
  const [message, setMessage] = createSignal('');
  const [passwordMessage, setPasswordMessage] = createSignal('');
  const [passwordError, setPasswordError] = createSignal('');
  
  // Session management
  const [sessions, setSessions] = createSignal([]);
  const [sessionsLoading, setSessionsLoading] = createSignal(true);
  const [sessionMessage, setSessionMessage] = createSignal('');

  // 2FA management
  const [twoFactorEnabled, setTwoFactorEnabled] = createSignal(false);
  const [twoFactorLoading, setTwoFactorLoading] = createSignal(true);
  const [twoFactorMessage, setTwoFactorMessage] = createSignal('');
  const [twoFactorError, setTwoFactorError] = createSignal('');
  const [enabledAt, setEnabledAt] = createSignal('');
  
  const [passwordData, setPasswordData] = createSignal({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const updatePasswordData = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMessage('');
    setPasswordError('');
    
    const data = passwordData();
    
    if (data.new_password !== data.confirm_password) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (data.new_password.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }

    if (!data.current_password) {
      setPasswordError('Current password is required');
      return;
    }

    setIsLoading(true);
    
    try {
      await API.user.changePassword({
        current_password: data.current_password,
        new_password: data.new_password,
        confirm_password: data.confirm_password
      });

      setPasswordMessage('Password changed successfully!');
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (error) {
      console.error('Password change error:', error);
      
      // Handle 400 errors specifically
      if (error.status === 400) {
        // Try to extract error message from response
        let errorMessage = 'Password change failed';
        if (error.message) {
          errorMessage = error.message;
        } else if (typeof error === 'string') {
          errorMessage = error;
        }
        setPasswordError(errorMessage);
      } else {
        setPasswordError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Load sessions on component mount
  onMount(async () => {
    await loadSessions();
    await load2FAStatus();
  });

  const loadSessions = async () => {
    try {
      setSessionsLoading(true);
      const response = await API.user.getSessions();
      
      // Handle real server response format
      let sessionsList = [];
      if (response.data && response.data.sessions) {
        sessionsList = response.data.sessions;
      } else if (response.sessions) {
        sessionsList = response.sessions;
      } else if (Array.isArray(response)) {
        sessionsList = response;
      }
      
      setSessions(sessionsList);
    } catch (error) {
      console.error('Failed to load sessions:', error);
      setSessionMessage('Failed to load sessions');
    } finally {
      setSessionsLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId) => {
    if (!confirm('Are you sure you want to revoke this session?')) {
      return;
    }

    try {
      setSessionMessage('');
      
      // Get current refresh token from auth store
      const currentRefreshToken = authStore.refreshToken;
      if (!currentRefreshToken) {
        setSessionMessage('Unable to revoke session: No refresh token available');
        return;
      }
      
      // Send both session ID and current refresh token
      await API.user.revokeSession(sessionId, currentRefreshToken);
      setSessionMessage('Session revoked successfully');
      
      // Remove the session from the list
      setSessions(prev => prev.filter(session => session.id !== sessionId));
    } catch (error) {
      console.error('Failed to revoke session:', error);
      setSessionMessage('Failed to revoke session');
    }
  };

  const handleRevokeAllSessions = async () => {
    if (!confirm('Are you sure you want to revoke all other sessions? This will sign you out of all devices except this one.')) {
      return;
    }

    try {
      setSessionMessage('');
      await API.user.revokeAllSessions();
      setSessionMessage('All other sessions revoked successfully');
      
      // Keep only the current session
      setSessions(prev => prev.filter(session => session.is_current));
    } catch (error) {
      console.error('Failed to revoke all sessions:', error);
      setSessionMessage('Failed to revoke all sessions');
    }
  };

  const formatDateTime = (dateString) => {
    try {
      // Handle server format: "2025-09-21 10:54:41"
      const date = new Date(dateString.replace(' ', 'T'));
      const now = new Date();
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      
      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
      if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)} days ago`;
      
      // For older dates, show the actual date
      return date.toLocaleDateString();
    } catch (error) {
      return 'Unknown';
    }
  };

  const formatExpiry = (dateString) => {
    try {
      const date = new Date(dateString.replace(' ', 'T'));
      return date.toLocaleDateString();
    } catch (error) {
      return 'Unknown';
    }
  };

  const getSessionDisplay = (session) => {
    // Use the description if available, fallback to generic display
    return session.description || `Session #${session.id}`;
  };

  const getDeviceIcon = (device) => {
    if (!device) return '💻';
    
    if (device.is_mobile) {
      return '📱';
    } else if (device.device_type === 'Tablet') {
      return '📱'; // Could use a tablet icon if available
    } else {
      return '💻';
    }
  };

  const getDeviceInfo = (session) => {
    if (!session.device) return 'Unknown Device';
    
    const { device } = session;
    let info = [];
    
    if (device.browser && device.browser_version) {
      info.push(`${device.browser} ${device.browser_version}`);
    }
    
    if (device.os && device.os_version) {
      info.push(`${device.os} ${device.os_version}`);
    }
    
    if (device.device_type) {
      info.push(device.device_type);
    }
    
    return info.join(' • ') || 'Unknown Device';
  };

  const handleLogout = async () => {
    if (confirm('Are you sure you want to log out?')) {
      await authStore.logout();
      navigate('/');
    }
  };

  // 2FA Functions
  const load2FAStatus = async () => {
    try {
      const response = await API.user.get2FAStatus();
      setTwoFactorEnabled(response.two_factor_enabled);
      setEnabledAt(response.enabled_at);
    } catch (error) {
      console.error('Failed to load 2FA status:', error);
      setTwoFactorError('Failed to load 2FA status');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleEnable2FA = async () => {
    setTwoFactorMessage('');
    setTwoFactorError('');
    setTwoFactorLoading(true);

    try {
      const response = await API.user.enable2FA();
      setTwoFactorEnabled(true);
      setEnabledAt(response.enabled_at);
      setTwoFactorMessage(response.message || 'Two-factor authentication enabled successfully');
    } catch (error) {
      console.error('Failed to enable 2FA:', error);
      setTwoFactorError(error.message || 'Failed to enable two-factor authentication');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    const confirmed = confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.');
    if (!confirmed) return;

    setTwoFactorMessage('');
    setTwoFactorError('');
    setTwoFactorLoading(true);

    try {
      const response = await API.user.disable2FA();
      setTwoFactorEnabled(false);
      setEnabledAt(null);
      setTwoFactorMessage(response.message || 'Two-factor authentication disabled successfully');
    } catch (error) {
      console.error('Failed to disable 2FA:', error);
      setTwoFactorError(error.message || 'Failed to disable two-factor authentication');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
            <h3>Two-Factor Authentication</h3>
            <p>Add an extra layer of security to your account by requiring a verification code from your email.</p>
            
            <Show when={twoFactorLoading()}>
              <div class="loading-sessions">
                <div class="loading-spinner"></div>
                <p>Loading 2FA status...</p>
              </div>
            </Show>

            <Show when={!twoFactorLoading()}>
              {twoFactorMessage() && (
                <div class="success-message">
                  {twoFactorMessage()}
                </div>
              )}

              {twoFactorError() && (
                <div class="error-message">
                  {twoFactorError()}
                </div>
              )}

              <div class="two-factor-status">
                <div class="status-indicator">
                  <span class={`status-dot ${twoFactorEnabled() ? 'enabled' : 'disabled'}`}></span>
                  <span class="status-text">
                    Two-factor authentication is <strong>{twoFactorEnabled() ? 'enabled' : 'disabled'}</strong>
                  </span>
                </div>
                
                {twoFactorEnabled() && enabledAt() && (
                  <p class="enabled-date">
                    Enabled on {formatDate(enabledAt())}
                  </p>
                )}
              </div>

              <div class="two-factor-actions">
                {twoFactorEnabled() ? (
                  <button 
                    type="button" 
                    class="btn btn-danger"
                    onClick={handleDisable2FA}
                    disabled={twoFactorLoading()}
                  >
                    {twoFactorLoading() ? 'Disabling...' : 'Disable 2FA'}
                  </button>
                ) : (
                  <button 
                    type="button" 
                    class="btn btn-primary"
                    onClick={handleEnable2FA}
                    disabled={twoFactorLoading()}
                  >
                    {twoFactorLoading() ? 'Enabling...' : 'Enable 2FA'}
                  </button>
                )}
              </div>

              {!twoFactorEnabled() && (
                <div class="two-factor-info">
                  <h4>How it works:</h4>
                  <ul>
                    <li>When you sign in, we'll send a verification code to your email</li>
                    <li>Enter the code to complete your sign-in</li>
                    <li>Your account will be protected even if someone has your password</li>
                  </ul>
                </div>
              )}
            </Show>
          </div>

          <div class="settings-card">
            <h3>Change Password</h3>
            <p>Update your account password for better security.</p>
            
            <Show when={passwordError()}>
              <div class="error-message">
                {passwordError()}
              </div>
            </Show>
            
            <Show when={passwordMessage()}>
              <div class="success-message">
                {passwordMessage()}
              </div>
            </Show>
            
            <form onSubmit={handlePasswordChange} class="settings-form">
              <div class="form-group">
                <label for="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  value={passwordData().current_password}
                  onInput={(e) => updatePasswordData('current_password', e.target.value)}
                  required
                  disabled={isLoading()}
                />
              </div>
              
              <div class="form-group">
                <label for="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  value={passwordData().new_password}
                  onInput={(e) => updatePasswordData('new_password', e.target.value)}
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
                  value={passwordData().confirm_password}
                  onInput={(e) => updatePasswordData('confirm_password', e.target.value)}
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
            <p>Manage your active sessions across all devices. You can revoke individual sessions or all sessions except the current one.</p>
            
            <Show when={sessionMessage()}>
              <div class={`message ${sessionMessage().includes('successfully') ? 'success-message' : 'error-message'}`}>
                {sessionMessage()}
              </div>
            </Show>
            
            <Show when={sessionsLoading()}>
              <div class="loading-sessions">Loading sessions...</div>
            </Show>
            
            <Show when={!sessionsLoading()}>
              <div class="sessions-list">
                {/* Always show current session info (not returned by server) */}
                <div class="session-item current">
                  <div class="session-info">
                    <div class="session-header">
                      <div class="session-device">
                        <span class="session-indicator current"></span>
                        <strong>Current Session</strong>
                        <span class="current-badge">Current</span>
                      </div>
                    </div>
                    <div class="session-details">
                      <div class="session-detail">
                        <span class="detail-label">Status:</span>
                        <span class="session-current">Active - This Session</span>
                      </div>
                      <Show when={sessions().length === 0}>
                        <div class="session-detail">
                          <span class="detail-label">Other Sessions:</span>
                          <span>No other active sessions found</span>
                        </div>
                      </Show>
                      <Show when={sessions().length > 0}>
                        <div class="session-detail">
                          <span class="detail-label">Other Sessions:</span>
                          <span>{sessions().length} other active session{sessions().length === 1 ? '' : 's'}</span>
                        </div>
                      </Show>
                    </div>
                  </div>
                </div>

                {/* Show other active sessions */}
                <Show when={sessions().length > 0}>
                  <For each={sessions()}>
                    {(session) => (
                      <div class={`session-item ${session.is_current ? 'current' : ''}`}>
                        <div class="session-info">
                          <div class="session-header">
                            <div class="session-device">
                              <span class="device-icon">{getDeviceIcon(session.device)}</span>
                              <div class="device-info">
                                <strong class="device-name">{getSessionDisplay(session)}</strong>
                                <div class="device-details">{getDeviceInfo(session)}</div>
                              </div>
                              {session.is_current && <span class="current-badge">Current</span>}
                            </div>
                            <Show when={!session.is_current}>
                              <button 
                                type="button" 
                                class="btn-revoke"
                                onClick={() => handleRevokeSession(session.id)}
                                title="Revoke this session"
                              >
                                ×
                              </button>
                            </Show>
                          </div>
                          <div class="session-details">
                            <div class="session-detail">
                              <span class="detail-label">Location:</span>
                              <span>{session.location || 'Unknown'}</span>
                            </div>
                            <div class="session-detail">
                              <span class="detail-label">IP Address:</span>
                              <span>{session.ip_address || 'Unknown'}</span>
                            </div>
                            <div class="session-detail">
                              <span class="detail-label">Created:</span>
                              <span>{formatDateTime(session.created_at)}</span>
                            </div>
                            <div class="session-detail">
                              <span class="detail-label">Expires:</span>
                              <span>{formatExpiry(session.expires_at)}</span>
                            </div>
                            <Show when={session.device?.is_mobile}>
                              <div class="session-detail">
                                <span class="detail-label">Type:</span>
                                <span class="mobile-indicator">📱 Mobile Device</span>
                              </div>
                            </Show>
                          </div>
                        </div>
                      </div>
                    )}
                  </For>
                </Show>
              </div>
              
              <div class="session-actions">
                <Show when={sessions().length > 0}>
                  <button 
                    type="button" 
                    class="btn btn-secondary"
                    onClick={handleRevokeAllSessions}
                  >
                    Revoke All Other Sessions ({sessions().length})
                  </button>
                </Show>
                
                <button 
                  type="button" 
                  class="btn btn-danger"
                  onClick={handleLogout}
                  disabled={isLoading()}
                >
                  {isLoading() ? 'Signing Out...' : 'Sign Out Current Session'}
                </button>
              </div>
            </Show>
          </div>
        </div>

        <div class="settings-section">
          <h2>Preferences</h2>
          
          <div class="settings-card">
            <h3>Display & Notifications</h3>
            <p>Customize your app experience and notification preferences.</p>
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
              
              <label class="preference-label">
                <input type="checkbox" defaultChecked />
                <span>Desktop notifications</span>
              </label>
              
              <label class="preference-label">
                <input type="checkbox" />
                <span>Marketing emails</span>
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
