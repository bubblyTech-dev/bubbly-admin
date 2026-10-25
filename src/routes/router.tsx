import { Suspense, lazy } from 'react';
import { Outlet, RouteObject, createBrowserRouter, useLocation } from 'react-router';
import App from 'App';
import AuthLayout from 'layouts/auth-layout';
import MainLayout from 'layouts/main-layout';
import Page404 from 'pages/errors/Page404';
import PageLoader from 'components/loading/PageLoader';
import { GuestOnly, RequireAuth } from './guards';
import paths from './paths';

const Analytics = lazy(() => import('pages/dashboard/Analytics'));
const UserList = lazy(() => import('pages/users/UserList'));
const Starter = lazy(() => import('pages/others/Starter'));
const Account = lazy(() => import('pages/others/Account'));

const Login = lazy(() => import('pages/authentication/Login'));
const ForgotPassword = lazy(() => import('pages/authentication/ForgotPassword'));
const ResetPassword = lazy(() => import('pages/authentication/ResetPassword'));
const ChangePassword = lazy(() => import('pages/authentication/ChangePassword'));

export const SuspenseOutlet = () => {
  const location = useLocation();

  return (
    <Suspense key={location.pathname} fallback={<PageLoader />}>
      <Outlet />
    </Suspense>
  );
};

export const routes: RouteObject[] = [
  {
    element: <App />,
    children: [
      {
        // everything inside the workspace needs a logged-in admin
        element: <RequireAuth />,
        children: [
          {
            path: '/',
            element: (
              <MainLayout>
                <SuspenseOutlet />
              </MainLayout>
            ),
            children: [
              { index: true, element: <Analytics /> },
              { path: paths.users, element: <UserList /> },
              { path: paths.account, element: <Account /> },
              { path: paths.starter, element: <Starter /> },
            ],
          },
        ],
      },
      {
        // forced password change: logged in, but nothing else is reachable yet
        element: <RequireAuth allowPendingPasswordChange />,
        children: [
          {
            element: (
              <AuthLayout>
                <SuspenseOutlet />
              </AuthLayout>
            ),
            children: [{ path: paths.changePassword, element: <ChangePassword /> }],
          },
        ],
      },
      {
        element: (
          <AuthLayout>
            <SuspenseOutlet />
          </AuthLayout>
        ),
        children: [
          {
            element: <GuestOnly />,
            children: [
              { path: paths.login, element: <Login /> },
              { path: paths.forgotPassword, element: <ForgotPassword /> },
            ],
          },
          // opened from the email link, so it works whether or not someone is logged in
          { path: paths.resetPassword, element: <ResetPassword /> },
        ],
      },

      {
        path: paths['404'],
        element: <Page404 />,
      },
      {
        path: '*',
        element: <Page404 />,
      },
    ],
  },
];

const router = createBrowserRouter(routes, {
  basename: import.meta.env.MODE === 'production' ? import.meta.env.VITE_BASENAME : '/',
});

export default router;
