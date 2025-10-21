import { createSignal, onMount, For, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { authStore } from '../stores/authStore';
import { API } from '../api/index.js';
import { isAnyOAuthConfigured, isOAuthConfigured } from '../config/oauth';

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
  const [canEnable2FA, setCanEnable2FA] = createSignal(true);
  const [isOAuthUser, setIsOAuthUser] = createSignal(false);
  const [oauthProvider, setOAuthProvider] = createSignal(null);
  
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
      setCanEnable2FA(response.can_enable_2fa !== false); // Default to true for backward compatibility
      setIsOAuthUser(response.is_oauth_user || false);
      setOAuthProvider(response.oauth_provider);
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
          
          <Show when={canEnable2FA() && !isAnyOAuthConfigured()}>
            <div class="settings-card">
              <h3>Two-Factor Authentication</h3>
              
                <p>Your account is secured by {oauthProvider() === 'google' ? 'Google' : oauthProvider() === 'apple' ? 'Apple' : 'your OAuth provider'}. Two-factor authentication is managed by your provider and cannot be modified here.</p>
                
                <Show when={!twoFactorLoading()}>
                  <div class="oauth-2fa-notice">
                    <div class="info-box">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                      </svg>
                      <div>
                        <strong>OAuth Account Security</strong>
                        <p>Your account is authenticated through {oauthProvider() === 'google' ? 'Google' : oauthProvider() === 'apple' ? 'Apple' : 'OAuth'}. Two-factor authentication and other security settings are managed by your OAuth provider. Please configure security settings in your {oauthProvider() === 'google' ? 'Google' : oauthProvider() === 'apple' ? 'Apple' : 'OAuth provider'} account.</p>
                      </div>
                    </div>
                  </div>
                </Show>
              

              <Show when={canEnable2FA()}>
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
              </Show>
            </div>
          </Show>

          <Show when={!isAnyOAuthConfigured()}>
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
          </Show>
          
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

        {/* OAuth Provider Management - only show if any provider is configured */}
        {isAnyOAuthConfigured() && (
          <div class="settings-section">
            <h2>Connected Accounts</h2>
            <p>Manage your OAuth provider connections for easy sign-in.</p>

            <div class="settings-card">
              <div class="oauth-providers">
                <div class="provider-list">
                  {isOAuthConfigured('google') && (
                    <div class="provider-item provider-connected">
                      <div class="provider-info">
                        <svg width="24" height="24" viewBox="0 0 24 24" class="provider-icon">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        <div class="provider-details">
                          <h4>Google</h4>
                          <p>Connected as user@example.com</p>
                        </div>
                      </div>
                      <div class="provider-actions">
                        <button 
                          type="button" 
                          class="btn-unlink"
                          onClick={() => alert('Unlinking Google account')}
                        >
                          Unlink
                        </button>
                      </div>
                    </div>
                  )}

                  {isOAuthConfigured('apple') && (
                    <div class="provider-item">
                      <div class="provider-info">
                        <svg width="24" height="24" viewBox="0 0 24 24" class="provider-icon">
                          <path fill="#000000" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                        </svg>
                        <div class="provider-details">
                          <h4>Apple</h4>
                          <p>Not connected</p>
                        </div>
                      </div>
                      <div class="provider-actions">
                        <button 
                          type="button" 
                          class="btn btn-secondary"
                          onClick={() => alert('Connecting Apple account')}
                        >
                          Connect
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

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
