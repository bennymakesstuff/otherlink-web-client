import { A, useNavigate } from '@solidjs/router';
import { Show, onMount } from 'solid-js';
import { authStore } from '../stores/authStore';
import { otherlinkStore } from '../stores/otherlinkStore';
import { OtherlinkSwitcher } from '../components/Otherlink/OtherlinkSwitcher';
import { RecentLinks } from '../components/Dashboard/RecentLinks';
import { LandingPagePreview } from '../components/Dashboard/LandingPagePreview';

export const Dashboard = () => {
  const navigate = useNavigate();
  const user = () => authStore.user;
  
  onMount(() => {
    // Load otherlinks on dashboard mount
    if (otherlinkStore.otherlinks().length === 0) {
      otherlinkStore.loadOtherlinks();
    }
  });
  
  const getUserRoles = () => {
    return user()?.roles?.map(role => role.name).join(', ') || 'No roles assigned';
  };

  const handleManageOtherlinks = () => {
    navigate('/admin/otherlinks');
  };


  /**
   * 
   * [              PAGE HEADER                 ]
   * [  LEFT SIDE  ][         RIGHT SIDE        ]
   * [  SWITCHER   ][ Existing dashboard cards  ]
   * [ PREVIEW OF  ][                           ]
   * [   LANDING   ][                           ]
   * [    PAGE     ][                           ]
   * [              PAGE FOOTER                 ]
   */




  return (
    <div class="dashboard-page">
      {/* PAGE HEADER */}
      <header class="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back, {user()?.first_name || 'User'}!</p>
      </header>

      {/* TWO-COLUMN LAYOUT */}
      <div class="dashboard-content">
        {/* LEFT SIDE - Switcher + Preview */}
        <aside class="dashboard-sidebar">
          <OtherlinkSwitcher onManageClick={handleManageOtherlinks} />
          <LandingPagePreview />
        </aside>

        {/* RIGHT SIDE - Existing Dashboard Cards */}
        <main class="dashboard-main">
          <div class="dashboard-grid">
            <div class="dashboard-card">
              <h3>OtherLink Info</h3>
              <div class="profile-info">
                <p><strong>Name:</strong> {otherlinkStore.selectedOtherlink()?.name}</p>
                <p><strong>Status:</strong> {otherlinkStore.selectedOtherlink()?.active ? 'Active' : 'Inactive'}</p>
                <p><strong>Total Links:</strong> {otherlinkStore.selectedOtherlink()?.link_count || 0}</p>
                <p><strong>Active Links:</strong> {otherlinkStore.selectedOtherlink()?.active_link_count || 0}</p>
              </div>
              <button class="btn btn-secondary" onClick={handleManageOtherlinks}>
                Manage OtherLinks
              </button>
            </div>
            
            <RecentLinks />
            
            <div class="dashboard-card">
              <h3>Quick Actions</h3>
              <div class="quick-actions">
                <A href="/admin/otherlinks" class="action-link">
                  <span class="action-icon">📄</span>
                  <div>
                    <div class="action-title">OtherLinks</div>
                    <div class="action-desc">Manage link pages</div>
                  </div>
                </A>
                <A href="/admin/links" class="action-link">
                  <span class="action-icon">🔗</span>
                  <div>
                    <div class="action-title">Links</div>
                    <div class="action-desc">Manage your links</div>
                  </div>
                </A>
                <A href="/admin/profile" class="action-link">
                  <span class="action-icon">👤</span>
                  <div>
                    <div class="action-title">Profile</div>
                    <div class="action-desc">Manage your account</div>
                  </div>
                </A>
                <A href="/admin/settings" class="action-link">
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
        </main>
      </div>

      {/* PAGE FOOTER */}
      <footer class="dashboard-footer">
        <p>&copy; 2024 Otherlink. All rights reserved.</p>
      </footer>
    </div>
  );
};
