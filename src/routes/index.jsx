import { Router, Route } from '@solidjs/router';
import { lazy } from 'solid-js';

// Guards
import { AuthGuard, GuestGuard } from '../components/AuthGuard';

// Layout components
import { Navigation } from '../components/Navigation';

// Lazy load pages for better performance
const Home = lazy(() => import('../pages/Home').then(m => ({ default: m.Home })));
const Login = lazy(() => import('../pages/Login').then(m => ({ default: m.Login })));
const Register = lazy(() => import('../pages/Register').then(m => ({ default: m.Register })));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword').then(m => ({ default: m.ForgotPassword })));
const ResetPassword = lazy(() => import('../pages/ResetPassword').then(m => ({ default: m.ResetPassword })));
const ResetComplete = lazy(() => import('../pages/ResetComplete').then(m => ({ default: m.ResetComplete })));
const ResetExpired = lazy(() => import('../pages/ResetExpired').then(m => ({ default: m.ResetExpired })));
const VerificationSent = lazy(() => import('../pages/VerificationSent').then(m => ({ default: m.VerificationSent })));
const VerifyEmail = lazy(() => import('../pages/VerifyEmail').then(m => ({ default: m.VerifyEmail })));
const TwoFactorVerify = lazy(() => import('../pages/TwoFactorVerify').then(m => ({ default: m.TwoFactorVerify })));
const Dashboard = lazy(() => import('../pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Profile = lazy(() => import('../pages/Profile').then(m => ({ default: m.Profile })));
const Settings = lazy(() => import('../pages/Settings').then(m => ({ default: m.Settings })));
const LoginTest = lazy(() => import('../components/LoginTest').then(m => ({ default: m.LoginTest })));
const AuthTest = lazy(() => import('../pages/AuthTest').then(m => ({ default: m.AuthTest })));

// Layout wrapper component
const Layout = (props) => (
  <div class="app-layout">
    <Navigation />
    <main class="main-content">
      {props.children}
    </main>
  </div>
);

// 404 Not Found component
const NotFound = () => (
  <div class="not-found">
    <h1>404 - Page Not Found</h1>
    <p>The page you're looking for doesn't exist.</p>
    <a href="/">Go back to home</a>
  </div>
);

export const AppRouter = () => {
  return (
    <Router>
      <Route path="/" component={() => (
        <Layout>
          <Home />
        </Layout>
      )} />
      
      <Route path="/test-login" component={() => (
        <Layout>
          <LoginTest />
        </Layout>
      )} />
      
      <Route path="/auth-test" component={() => (
        <Layout>
          <AuthTest />
        </Layout>
      )} />
      
      {/* Guest-only routes (unauthenticated users only) */}
      <Route path="/login" component={() => (
        <GuestGuard>
          <Layout>
            <Login />
          </Layout>
        </GuestGuard>
      )} />
      
      <Route path="/register" component={() => (
        <GuestGuard>
          <Layout>
            <Register />
          </Layout>
        </GuestGuard>
      )} />
      
      <Route path="/forgot-password" component={() => (
        <GuestGuard>
          <Layout>
            <ForgotPassword />
          </Layout>
        </GuestGuard>
      )} />
      
      <Route path="/reset-password" component={() => (
        <GuestGuard>
          <Layout>
            <ResetPassword />
          </Layout>
        </GuestGuard>
      )} />
      
      <Route path="/reset-complete" component={() => (
        <Layout>
          <ResetComplete />
        </Layout>
      )} />
      
      <Route path="/reset-expired" component={() => (
        <Layout>
          <ResetExpired />
        </Layout>
      )} />
      
      <Route path="/verification-sent" component={() => (
        <Layout>
          <VerificationSent />
        </Layout>
      )} />
      
      <Route path="/verify-email" component={() => (
        <Layout>
          <VerifyEmail />
        </Layout>
      )} />
      
      <Route path="/2fa-verify" component={() => (
        <Layout>
          <TwoFactorVerify />
        </Layout>
      )} />
      
      {/* Protected routes (authenticated users only) */}
      <Route path="/dashboard" component={() => (
        <AuthGuard>
          <Layout>
            <Dashboard />
          </Layout>
        </AuthGuard>
      )} />
      
      <Route path="/profile" component={() => (
        <AuthGuard>
          <Layout>
            <Profile />
          </Layout>
        </AuthGuard>
      )} />
      
      <Route path="/settings" component={() => (
        <AuthGuard>
          <Layout>
            <Settings />
          </Layout>
        </AuthGuard>
      )} />
      
      {/* Catch-all route for 404 */}
      <Route path="/*all" component={() => (
        <Layout>
          <NotFound />
        </Layout>
      )} />
    </Router>
  );
};