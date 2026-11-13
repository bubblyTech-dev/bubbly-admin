import { Suspense, lazy } from 'react';
import { Navigate, Outlet, RouteObject, createBrowserRouter, useLocation } from 'react-router';
import App from 'App';
import { analyticsAreas } from 'features/analytics/registry';
import { reportAreas } from 'features/reports/registry';
import AuthLayout from 'layouts/auth-layout';
import MainLayout from 'layouts/main-layout';
import Page404 from 'pages/errors/Page404';
import PageLoader from 'components/loading/PageLoader';
import { GuestOnly, RequireAuth, RequirePermission } from './guards';
import paths from './paths';

const Dashboard = lazy(() => import('pages/dashboard/Dashboard'));
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
const AnalyticsArea = lazy(() => import('pages/analytics/AnalyticsArea'));
const ReportArea = lazy(() => import('pages/reports/ReportArea'));
const Starter = lazy(() => import('pages/others/Starter'));
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
              { index: true, element: <Dashboard /> },
              {
                element: <RequirePermission permission="users_access.view" />,
                children: [
                  { path: paths.users, element: <UserList /> },
                  { path: paths.userDetail, element: <UserDetail /> },
                ],
              },
              {
                // Analytics and Reports: one generic page each, driven by the area configs
                element: <RequirePermission permission="reports.view" />,
                children: [
                  {
                    path: paths.analytics,
                    element: (
                      <Navigate
                        to={
                          analyticsAreas[0]
                            ? `${paths.analytics}/${analyticsAreas[0].area}`
                            : paths[404]
                        }
                        replace
                      />
                    ),
                  },
                  { path: paths.analyticsArea, element: <AnalyticsArea /> },
                  {
                    path: paths.reports,
                    element: (
                      <Navigate
                        to={reportAreas[0] ? `${paths.reports}/${reportAreas[0].area}` : paths[404]}
                        replace
                      />
                    ),
                  },
                  { path: paths.reportsArea, element: <ReportArea /> },
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
              { path: paths.schools, element: <SchoolList /> },
              { path: paths.schoolNew, element: <SchoolNew /> },
              { path: paths.schoolDetail, element: <SchoolDetail /> },
              { path: paths.inquiries, element: <InquiryList /> },
              { path: paths.account, element: <Account /> },
              { path: paths.starter, element: <Starter /> },
              { path: paths.plans, element: <PlanList /> },
              { path: paths.plansNew, element: <PlanForm /> },
              { path: `${paths.plans}/:uuid`, element: <PlanForm /> },
              { path: paths.modules, element: <ModuleList /> },
              { path: paths.settings, element: <Settings /> },
              { path: paths.announcements, element: <AnnouncementList /> },
              { path: paths.announcementNew, element: <AnnouncementForm /> },
              { path: `${paths.announcements}/:uuid`, element: <AnnouncementForm /> },
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
