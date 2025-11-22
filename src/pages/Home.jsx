import { A } from '@solidjs/router';
import { API } from '../api/index.js';
import { authStore } from '../stores/authStore.js';

export const Home = () => {
  return (
    <div class="home-page">
      <header class="hero">
        <h1>Welcome to Your App</h1>
        <p>A modern web application built with Solid.js</p>
        
        <div class="api-status">
          <div class="status-item">
            <strong>API Mode:</strong> {API.getMode()}
            {API.isMock() && <span class="mock-badge">MOCK</span>}
          </div>
          <div class="status-item">
            <strong>Authentication:</strong> {authStore.isAuthenticated ? '✅ Logged In' : '❌ Not Logged In'}
            {authStore.user && <span> as {authStore.user.full_name || `${authStore.user.first_name || ''} ${authStore.user.last_name || ''}`.trim()}</span>}
          </div>
        </div>
        
        <div class="cta-buttons">
          {!authStore.isAuthenticated ? (
            <>
              <A href="/login" class="btn btn-primary">Login</A>
              <A href="/register" class="btn btn-secondary">Register</A>
              <A href="/test-login" class="btn btn-outline">🧪 Test API</A>
            </>
          ) : (
            <>
              <A href="/admin/dashboard" class="btn btn-primary">Dashboard</A>
              <A href="/test-login" class="btn btn-outline">🧪 Test API</A>
            </>
          )}
        </div>
      </header>
      
      <section class="features">
        <h2>Features</h2>
        <div class="feature-grid">
          <div class="feature-card">
            <h3>Secure Authentication</h3>
            <p>Two-factor authentication with access and refresh tokens</p>
          </div>
          <div class="feature-card">
            <h3>Role-Based Access</h3>
            <p>Dynamic user roles and permissions management</p>
          </div>
          <div class="feature-card">
            <h3>Modern UI</h3>
            <p>Built with Solid.js for optimal performance</p>
          </div>
        </div>
      </section>
    </div>
  );
};
