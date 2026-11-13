import { Suspense, lazy } from 'react';
import { Outlet, RouteObject, createBrowserRouter, useLocation } from 'react-router';
import App from 'App';
import AuthLayout from 'layouts/auth-layout';
import MainLayout from 'layouts/main-layout';
import Page404 from 'pages/errors/Page404';
import PageLoader from 'components/loading/PageLoader';
import { GuestOnly, RequireAuth, RequirePermission } from './guards';
import paths from './paths';

const Analytics = lazy(() => import('pages/dashboard/Analytics'));
const UserList = lazy(() => import('pages/users/UserList'));
const UserDetail = lazy(() => import('pages/users/UserDetail'));
const AuditLogs = lazy(() => import('pages/audit/AuditLogs'));
const SchoolList = lazy(() => import('pages/schools/SchoolList'));
const SchoolNew = lazy(() => import('pages/schools/SchoolNew'));
const SchoolDetail = lazy(() => import('pages/schools/SchoolDetail'));
const InquiryList = lazy(() => import('pages/inquiries/InquiryList'));
const SubscriptionList = lazy(() => import('pages/subscriptions/SubscriptionList'));
const RenewalList = lazy(() => import('pages/renewals/RenewalList'));
const PaymentList = lazy(() => import('pages/billing/PaymentList'));
const InvoiceList = lazy(() => import('pages/billing/InvoiceList'));
const WebhookEventList = lazy(() => import('pages/billing/WebhookEventList'));
const PlanList = lazy(() => import('pages/plans/PlanList'));
const PlanForm = lazy(() => import('pages/plans/PlanForm'));
const ModuleList = lazy(() => import('pages/modules/ModuleList'));
const Account = lazy(() => import('pages/others/Account'));
const Settings = lazy(() => import('pages/settings/Settings'));
const AnnouncementList = lazy(() => import('pages/announcements/AnnouncementList'));
const AnnouncementForm = lazy(() => import('pages/announcements/AnnouncementForm'));

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
              {
                element: <RequirePermission permission="dashboard.view" />,
                children: [{ index: true, element: <Analytics /> }],
              },
              {
                element: <RequirePermission permission="users_access.view" />,
                children: [
                  { path: paths.users, element: <UserList /> },
                  { path: paths.userDetail, element: <UserDetail /> },
                ],
              },
              {
                element: <RequirePermission permission="audit.view" />,
                children: [{ path: paths.auditLogs, element: <AuditLogs /> }],
              },
              {
                element: <RequirePermission permission="subscriptions.view" />,
                children: [{ path: paths.subscriptions, element: <SubscriptionList /> }],
              },
              {
                element: <RequirePermission permission="renewals.view" />,
                children: [{ path: paths.renewals, element: <RenewalList /> }],
              },
              {
                element: <RequirePermission permission="billing.view" />,
                children: [
                  { path: paths.payments, element: <PaymentList /> },
                  { path: paths.invoices, element: <InvoiceList /> },
                  { path: paths.webhookEvents, element: <WebhookEventList /> },
                ],
              },
              {
                element: <RequirePermission permission="schools.view" />,
                children: [
                  { path: paths.schools, element: <SchoolList /> },
                  { path: paths.schoolDetail, element: <SchoolDetail /> },
                ],
              },
              {
                element: <RequirePermission permission="schools.create" />,
                children: [{ path: paths.schoolNew, element: <SchoolNew /> }],
              },
              {
                element: <RequirePermission permission="plans.view" />,
                children: [
                  { path: paths.plans, element: <PlanList /> },
                  { path: `${paths.plans}/:uuid`, element: <PlanForm /> },
                ],
              },
              {
                element: <RequirePermission permission="plans.create" />,
                children: [{ path: paths.plansNew, element: <PlanForm /> }],
              },
              {
                element: <RequirePermission permission="modules.view" />,
                children: [{ path: paths.modules, element: <ModuleList /> }],
              },
              {
                element: <RequirePermission permission="inquiries.view" />,
                children: [{ path: paths.inquiries, element: <InquiryList /> }],
              },
              {
                element: <RequirePermission permission="settings.view" />,
                children: [{ path: paths.settings, element: <Settings /> }],
              },
              {
                element: <RequirePermission permission="announcements.view" />,
                children: [
                  { path: paths.announcements, element: <AnnouncementList /> },
                  { path: paths.announcementNew, element: <AnnouncementForm /> },
                  { path: `${paths.announcements}/:uuid`, element: <AnnouncementForm /> },
                ],
              },
              // any signed-in admin may open their own account
              { path: paths.account, element: <Account /> },
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
