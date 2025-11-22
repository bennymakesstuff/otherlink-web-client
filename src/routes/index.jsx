import { Router, Route, useLocation } from '@solidjs/router';
import { lazy, Show } from 'solid-js';

// Guards
import { AuthGuard, GuestGuard } from '../components/AuthGuard';
import { OtherlinkGuard } from '../components/OtherlinkGuard';

// Layout components
import { UnauthenticatedNavigation } from '../components/UnauthenticatedNavigation.jsx';
import { AuthenticatedNavigation } from '../components/AuthenticatedNavigation.jsx';

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
const CreateOtherlink = lazy(() => import('../pages/CreateOtherlink').then(m => ({ default: m.CreateOtherlink })));
const Otherlinks = lazy(() => import('../pages/Otherlinks').then(m => ({ default: m.Otherlinks })));
const Links = lazy(() => import('../pages/Links').then(m => ({ default: m.Links })));
const Profile = lazy(() => import('../pages/Profile').then(m => ({ default: m.Profile })));
const Settings = lazy(() => import('../pages/Settings').then(m => ({ default: m.Settings })));
const LoginTest = lazy(() => import('../components/LoginTest').then(m => ({ default: m.LoginTest })));
const AuthTest = lazy(() => import('../pages/AuthTest').then(m => ({ default: m.AuthTest })));
const OtherlinkLandingPage = lazy(() => import('../pages/OtherlinkLandingPage').then(m => ({ default: m.OtherlinkLandingPage })));

// Layout wrapper component that conditionally shows navigation
const AppLayout = (props) => {
  const location = useLocation();
  const isAdminRoute = () => location.pathname.startsWith('/admin');
  
  return (
    <div class="app-layout">
      <Show when={isAdminRoute()}>
        <AuthenticatedNavigation />
      </Show>
      <main class="main-content">
        {props.children}
      </main>
    </div>
  );
};

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
    <Router root={AppLayout}>
      {/* Public routes */}
      <Route path="/" component={Home} />
      <Route path="/test-login" component={LoginTest} />
      <Route path="/auth-test" component={AuthTest} />
      
      {/* Guest-only routes (unauthenticated users only) */}
      <Route path="/login" component={() => (
        <GuestGuard>
          <Login />
        </GuestGuard>
      )} />
      
      <Route path="/register" component={() => (
        <GuestGuard>
          <Register />
        </GuestGuard>
      )} />
      
      <Route path="/forgot-password" component={() => (
        <GuestGuard>
          <ForgotPassword />
        </GuestGuard>
      )} />
      
      <Route path="/reset-password" component={() => (
        <GuestGuard>
          <ResetPassword />
        </GuestGuard>
      )} />
      
      <Route path="/reset-complete" component={ResetComplete} />
      <Route path="/reset-expired" component={ResetExpired} />
      <Route path="/verification-sent" component={VerificationSent} />
      <Route path="/verify-email" component={VerifyEmail} />
      <Route path="/2fa-verify" component={TwoFactorVerify} />
      
      {/* Protected routes (authenticated users only) - All nested under /admin */}
      
      {/* Create Otherlink - No OtherlinkGuard (this is where they create their first one) */}
      <Route path="/admin/create-otherlink" component={() => (
        <AuthGuard>
          <CreateOtherlink />
        </AuthGuard>
      )} />
      
      {/* Routes that require at least one otherlink */}
      <Route path="/admin/dashboard" component={() => (
        <AuthGuard>
          <OtherlinkGuard>
            <Dashboard />
          </OtherlinkGuard>
        </AuthGuard>
      )} />
      
      <Route path="/admin/otherlinks" component={() => (
        <AuthGuard>
          <OtherlinkGuard>
            <Otherlinks />
          </OtherlinkGuard>
        </AuthGuard>
      )} />
      
      <Route path="/admin/links" component={() => (
        <AuthGuard>
          <OtherlinkGuard>
            <Links />
          </OtherlinkGuard>
        </AuthGuard>
      )} />
      
      <Route path="/admin/profile" component={() => (
        <AuthGuard>
          <OtherlinkGuard>
            <Profile />
          </OtherlinkGuard>
        </AuthGuard>
      )} />
      
      <Route path="/admin/settings" component={() => (
        <AuthGuard>
          <OtherlinkGuard>
            <Settings />
          </OtherlinkGuard>
        </AuthGuard>
      )} />
      
      {/* Public otherlink landing page - Must be before catch-all */}
      <Route path="/:displayName" component={OtherlinkLandingPage} />
      
      {/* Catch-all route for 404 */}
      <Route path="/*all" component={NotFound} />
    </Router>
  );
};