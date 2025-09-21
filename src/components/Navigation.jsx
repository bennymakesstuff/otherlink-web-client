import { A, useLocation } from '@solidjs/router';
import { Show } from 'solid-js';
import { authStore } from '../stores/authStore';

export const Navigation = () => {
  const location = useLocation();
  
  const handleLogout = async () => {
    if (confirm('Are you sure you want to log out?')) {
      await authStore.logout();
    }
  };

  return (
    <nav class="navigation">
      <div class="nav-container">
        <div class="nav-brand">
          <A href={authStore.isAuthenticated ? "/dashboard" : "/"}>
            Your App
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
                href="/dashboard" 
                class={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
              >
                Dashboard
              </A>
              <A 
                href="/profile" 
                class={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}
              >
                Profile
              </A>
              <A 
                href="/settings" 
                class={`nav-link ${location.pathname === '/settings' ? 'active' : ''}`}
              >
                Settings
              </A>
              
              <div class="user-menu">
                <div class="user-info">
                  <div class="user-avatar">
                    {authStore.user?.firstName?.[0]}{authStore.user?.lastName?.[0]}
                  </div>
                  <span class="user-name">
                    {authStore.user?.firstName} {authStore.user?.lastName}
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
