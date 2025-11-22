import { A, useLocation } from '@solidjs/router';
import { Show } from 'solid-js';
import { authStore } from '../stores/authStore';
import { UserAvatar } from './UserAvatar';

export const UnauthenticatedNavigation = () => {
  const location = useLocation();
  
  const handleLogout = async () => {
    if (confirm('Are you sure you want to log out?')) {
      await authStore.logout();
    }
  };

  return (
    <nav class="navigation unauthenticated-navigation">
      <div class="nav-container">
        <div class="nav-brand">
          <A href={authStore.isAuthenticated ? "/admin/dashboard" : "/"}>
            Otherlink.
          </A>
        </div>
        
        <div class="nav-links">
          <Show 
            when={authStore.isAuthenticated}
            fallback={
              <div class="auth-links">
                <A 
                  href="/login" 
                  class={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}
                >
                  Login
                </A>
                <A 
                  href="/register" 
                  class={`nav-link btn btn-primary ${location.pathname === '/register' ? 'active' : ''}`}
                >
                  Register
                </A>
              </div>
            }
          >
            <div class="authenticated-nav">
              <A 
                href="/admin/dashboard" 
                class={`nav-link ${location.pathname === '/admin/dashboard' ? 'active' : ''}`}
              >
                Dashboard
              </A>
              <A 
                href="/admin/profile" 
                class={`nav-link ${location.pathname === '/admin/profile' ? 'active' : ''}`}
              >
                Profile
              </A>
              <A 
                href="/admin/settings" 
                class={`nav-link ${location.pathname === '/admin/settings' ? 'active' : ''}`}
              >
                Settings
              </A>
              
              <div class="user-menu">
                <div class="user-info">
                  <UserAvatar size={32} />
                  <span class="user-name">
                    {authStore.user?.full_name || `${authStore.user?.first_name || ''} ${authStore.user?.last_name || ''}`.trim()}
                  </span>
                </div>
                <button 
                  class="logout-btn" 
                  onClick={handleLogout}
                  disabled={authStore.isLoading}
                >
                  {authStore.isLoading ? 'Logging out...' : 'Logout'}
                </button>
              </div>
            </div>
          </Show>
        </div>
      </div>
    </nav>
  );
};
