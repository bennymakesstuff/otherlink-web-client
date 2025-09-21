import { createEffect, createSignal, Show } from 'solid-js';
import { Navigate } from '@solidjs/router';
import { authStore } from '../stores/authStore';

// Loading component for auth checks
const AuthLoading = () => (
  <div class="auth-loading">
    <div class="loading-spinner"></div>
    <p>Checking authentication...</p>
  </div>
);

// AuthGuard - protects routes that require authentication
export const AuthGuard = (props) => {
  const [isInitialized, setIsInitialized] = createSignal(false);
  const [isValid, setIsValid] = createSignal(false);

  createEffect(async () => {
    if (!isInitialized()) {
      console.log('AuthGuard checking authentication:', {
        isAuthenticated: authStore.isAuthenticated,
        hasAccessToken: !!authStore.accessToken,
        hasUser: !!authStore.user
      });
      
      // If user is already authenticated (just logged in), don't validate again
      if (authStore.isAuthenticated) {
        console.log('AuthGuard: User already authenticated, skipping validation');
        setIsValid(true);
        setIsInitialized(true);
        return;
      }
      
      // Otherwise, validate and refresh tokens
      console.log('AuthGuard: Validating tokens...');
      const valid = await authStore.validateAndRefresh();
      console.log('AuthGuard: Token validation result:', valid);
      setIsValid(valid);
      setIsInitialized(true);
    }
  });

  return (
    <Show 
      when={isInitialized() && !authStore.isLoading}
      fallback={<AuthLoading />}
    >
      <Show 
        when={isValid() && authStore.isAuthenticated}
        fallback={<Navigate href="/login" />}
      >
        {props.children}
      </Show>
    </Show>
  );
};

// RoleGuard - protects routes that require specific roles
export const RoleGuard = (props) => {
  const [isInitialized, setIsInitialized] = createSignal(false);
  const [isValid, setIsValid] = createSignal(false);

  createEffect(async () => {
    if (!isInitialized()) {
      const valid = await authStore.validateAndRefresh();
      setIsValid(valid);
      setIsInitialized(true);
    }
  });

  const hasRequiredRole = () => {
    if (!isValid() || !authStore.isAuthenticated) return false;
    
    const requiredRoles = Array.isArray(props.roles) ? props.roles : [props.roles];
    return requiredRoles.some(role => authStore.hasRole(role));
  };

  return (
    <Show 
      when={isInitialized() && !authStore.isLoading}
      fallback={<AuthLoading />}
    >
      <Show 
        when={isValid() && authStore.isAuthenticated}
        fallback={<Navigate href="/login" />}
      >
        <Show 
          when={hasRequiredRole()}
          fallback={
            <div class="access-denied">
              <h2>Access Denied</h2>
              <p>You don't have the required permissions to view this page.</p>
            </div>
          }
        >
          {props.children}
        </Show>
      </Show>
    </Show>
  );
};

// PermissionGuard - protects routes that require specific permissions
export const PermissionGuard = (props) => {
  const [isInitialized, setIsInitialized] = createSignal(false);
  const [isValid, setIsValid] = createSignal(false);

  createEffect(async () => {
    if (!isInitialized()) {
      const valid = await authStore.validateAndRefresh();
      setIsValid(valid);
      setIsInitialized(true);
    }
  });

  const hasRequiredPermission = () => {
    if (!isValid() || !authStore.isAuthenticated) return false;
    
    const requiredPermissions = Array.isArray(props.permissions) ? props.permissions : [props.permissions];
    return requiredPermissions.some(permission => authStore.hasPermission(permission));
  };

  return (
    <Show 
      when={isInitialized() && !authStore.isLoading}
      fallback={<AuthLoading />}
    >
      <Show 
        when={isValid() && authStore.isAuthenticated}
        fallback={<Navigate href="/login" />}
      >
        <Show 
          when={hasRequiredPermission()}
          fallback={
            <div class="access-denied">
              <h2>Access Denied</h2>
              <p>You don't have the required permissions to view this page.</p>
            </div>
          }
        >
          {props.children}
        </Show>
      </Show>
    </Show>
  );
};

// GuestGuard - protects routes that should only be accessible to unauthenticated users
export const GuestGuard = (props) => {
  const [isInitialized, setIsInitialized] = createSignal(false);

  createEffect(async () => {
    if (!isInitialized()) {
      await authStore.validateAndRefresh();
      setIsInitialized(true);
    }
  });

  return (
    <Show 
      when={isInitialized() && !authStore.isLoading}
      fallback={<AuthLoading />}
    >
      <Show 
        when={!authStore.isAuthenticated}
        fallback={<Navigate href="/dashboard" />}
      >
        {props.children}
      </Show>
    </Show>
  );
};
