import { PropsWithChildren } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import NoAccess from 'pages/errors/NoAccess';
import { useAuth } from 'providers/AuthProvider';
import PageLoader from 'components/loading/PageLoader';
import paths from './paths';

interface RequireAuthProps {
  // the forced change-password page is the only place a user with a pending password change may stay
  allowPendingPasswordChange?: boolean;
}

// Wraps routes that need a logged-in admin. Used as a layout route: <Route element={<RequireAuth />}>
export const RequireAuth = ({ allowPendingPasswordChange = false }: RequireAuthProps) => {
  const { status, user } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <PageLoader sx={{ minHeight: '100vh' }} />;
  if (status === 'unauthenticated' || !user) {
    return (
      <Navigate to={paths.login} replace state={{ from: location.pathname + location.search }} />
    );
  }
  if (user.mustChangePassword && !allowPendingPasswordChange) {
    return <Navigate to={paths.changePassword} replace />;
  }
  if (!user.mustChangePassword && allowPendingPasswordChange) {
    return <Navigate to={paths.starter} replace />;
  }
  return <Outlet />;
};

// Login and forgot-password are only for visitors; a logged-in admin goes straight to the app.
export const GuestOnly = () => {
  const { status, user } = useAuth();

  if (status === 'loading') return <PageLoader sx={{ minHeight: '100vh' }} />;
  if (status === 'authenticated' && user) {
    return <Navigate to={user.mustChangePassword ? paths.changePassword : paths.starter} replace />;
  }
  return <Outlet />;
};

// Wraps routes that need a permission. The backend still enforces it; this only shows a clear message.
//   { element: <RequirePermission permission="users_access.view" />, children: [...] }
export const RequirePermission = ({ permission }: { permission: string }) => {
  const { hasPermission } = useAuth();
  return hasPermission(permission) ? <Outlet /> : <NoAccess />;
};

// Hides a piece of UI unless the admin has the permission (the backend still enforces it).
export const Can = ({ permission, children }: PropsWithChildren<{ permission: string }>) => {
  const { hasPermission } = useAuth();
  return hasPermission(permission) ? <>{children}</> : null;
};
