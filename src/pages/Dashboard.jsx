import { A } from '@solidjs/router';
import { authStore } from '../stores/authStore';

export const Dashboard = () => {
  const user = () => authStore.user;
  
  const getUserRoles = () => {
    return user()?.roles?.map(role => role.name).join(', ') || 'No roles assigned';
  };

  return (
    <div class="dashboard-page">
      <header class="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back, {user()?.firstName || 'User'}!</p>
      </header>
      
      <div class="dashboard-content">
        <div class="dashboard-grid">
          <div class="dashboard-card">
            <h3>Profile Information</h3>
            <div class="profile-info">
              <p><strong>Name:</strong> {user()?.firstName} {user()?.lastName}</p>
              <p><strong>Email:</strong> {user()?.email}</p>
              <p><strong>Roles:</strong> {getUserRoles()}</p>
            </div>
            <A href="/profile" class="btn btn-secondary">Edit Profile</A>
          </div>
          
          <div class="dashboard-card">
            <h3>Quick Actions</h3>
            <div class="quick-actions">
              <A href="/profile" class="action-link">
                <span class="action-icon">👤</span>
                <div>
                  <div class="action-title">Profile</div>
                  <div class="action-desc">Manage your account</div>
                </div>
              </A>
              <A href="/settings" class="action-link">
                <span class="action-icon">⚙️</span>
                <div>
                  <div class="action-title">Settings</div>
                  <div class="action-desc">Privacy & security</div>
                </div>
              </A>
              {authStore.hasRole('admin') && (
                <A href="/admin" class="action-link">
                  <span class="action-icon">🔧</span>
                  <div>
                    <div class="action-title">Admin Panel</div>
                    <div class="action-desc">System management</div>
                  </div>
                </A>
              )}
            </div>
          </div>
          
          <div class="dashboard-card">
            <h3>Recent Activity</h3>
            <div class="activity-list">
              <p class="activity-item">Welcome! This is your first visit.</p>
              <p class="activity-placeholder">More activity will appear here as you use the app.</p>
            </div>
          </div>
          
          <div class="dashboard-card">
            <h3>System Status</h3>
            <div class="status-info">
              <div class="status-item">
                <span class="status-indicator status-good"></span>
                Authentication: Active
              </div>
              <div class="status-item">
                <span class="status-indicator status-good"></span>
                API Connection: Connected
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
