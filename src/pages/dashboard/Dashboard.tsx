import { useState } from 'react';
import { Alert, Box, Button, Stack } from '@mui/material';
import useDashboard from 'hooks/useDashboard';
import { formatCompactRupees, formatCount } from 'lib/format';
import { DashboardPreset } from 'types/dashboard';
import AnalyticsChart from 'components/analytics/AnalyticsChart';
import ChartCard from 'components/analytics/ChartCard';
import DashboardHeader from 'components/sections/dashboard/DashboardHeader';
import DashboardKpiCard from 'components/sections/dashboard/DashboardKpiCard';
import LatestPaymentsPanel from 'components/sections/dashboard/LatestPaymentsPanel';
import LatestSchoolsPanel from 'components/sections/dashboard/LatestSchoolsPanel';
import LiveAnnouncementsPanel from 'components/sections/dashboard/LiveAnnouncementsPanel';
import NeedsAttentionCard from 'components/sections/dashboard/NeedsAttentionCard';
import QuickActionsCard from 'components/sections/dashboard/QuickActionsCard';
import RecentActivityPanel from 'components/sections/dashboard/RecentActivityPanel';

const grid = (columns: Record<string, string>) => ({
  display: 'grid',
  gap: 3,
  gridTemplateColumns: columns,
});

// The main page of the Admin app: the numbers that matter, what needs attention, and the latest activity.
// Every block appears only when the admin is allowed to see its data (the server sends null otherwise).
const Dashboard = () => {
  const [preset, setPreset] = useState<DashboardPreset>('this_month');
  const { data, loading, error, reload } = useDashboard(preset);

  const kpis = data?.kpis;
  const charts = data?.charts;
  const panels = data?.panels;
  const waiting = loading && !data; // first load: show skeletons

  const nothingVisible =
    !!data &&
    Object.values(data.kpis).every((value) => value === null) &&
    Object.values(data.charts).every((value) => value === null) &&
    data.attention.length === 0 &&
    Object.values(data.panels).every((value) => value === null);

  return (
    <Stack direction="column" spacing={4} sx={{ px: { xs: 3, md: 5 }, py: 4 }}>
      <DashboardHeader preset={preset} onPreset={setPreset} range={data?.range} />

      {error && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={reload}>
              Try again
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {nothingVisible && (
        <Alert severity="info">
          Your role can open the dashboard, but none of its numbers. Ask an administrator for access
          to schools, billing or inquiries.
        </Alert>
      )}

      {(waiting || kpis) && (
        <Box
          sx={{
            ...grid({
              xs: 'minmax(0, 1fr)',
              sm: 'repeat(2, minmax(0, 1fr))',
              lg: 'repeat(4, minmax(0, 1fr))',
            }),
            opacity: loading && data ? 0.6 : 1,
            transition: 'opacity 0.2s',
          }}
        >
          {(waiting || kpis?.totalSchools) && (
            <DashboardKpiCard
              label="Total schools"
              icon="material-symbols:school-outline"
              loading={waiting}
              value={kpis?.totalSchools?.value}
              change={kpis?.totalSchools?.change}
              previous={kpis?.totalSchools?.previous}
              href="/schools"
              subline={
                kpis?.totalSchools
                  ? `${formatCount(kpis.totalSchools.breakdown.active)} active · ${formatCount(kpis.totalSchools.breakdown.suspended)} suspended · ${formatCount(kpis.totalSchools.breakdown.archived)} archived`
                  : undefined
              }
            />
          )}
          {(waiting || kpis?.newSchools) && (
            <DashboardKpiCard
              label="New schools"
              icon="material-symbols:person-add-outline-rounded"
              loading={waiting}
              value={kpis?.newSchools?.value}
              change={kpis?.newSchools?.change}
              previous={kpis?.newSchools?.previous}
              sparkline={kpis?.newSchools?.sparkline}
              href="/schools"
              subline="Joined in this period"
            />
          )}
          {(waiting || kpis?.activeSubscriptions) && (
            <DashboardKpiCard
              label="Active subscriptions"
              icon="material-symbols:sell-outline"
              loading={waiting}
              value={kpis?.activeSubscriptions?.value}
              change={kpis?.activeSubscriptions?.change}
              previous={kpis?.activeSubscriptions?.previous}
              href="/subscriptions"
              subline="Schools paying right now"
            />
          )}
          {(waiting || kpis?.mrr) && (
            <DashboardKpiCard
              label="Recurring revenue"
              icon="material-symbols:trending-up-rounded"
              unit="money"
              loading={waiting}
              value={kpis?.mrr?.value}
              change={kpis?.mrr?.change}
              previous={kpis?.mrr?.previous}
              subline={
                kpis?.mrr
                  ? `Per month, without GST · ${formatCompactRupees(kpis.mrr.arrPaise)} a year`
                  : undefined
              }
            />
          )}
          {(waiting || kpis?.revenue) && (
            <DashboardKpiCard
              label="Revenue (without GST)"
              icon="material-symbols:payments-outline-rounded"
              unit="money"
              loading={waiting}
              value={kpis?.revenue?.value}
              change={kpis?.revenue?.change}
              previous={kpis?.revenue?.previous}
              sparkline={kpis?.revenue?.sparkline}
              href="/invoices"
              subline={
                kpis?.revenue
                  ? `GST collected ${formatCompactRupees(kpis.revenue.gstPaise)}${kpis.revenue.refundedPaise > 0 ? ` · refunded ${formatCompactRupees(kpis.revenue.refundedPaise)}` : ''}`
                  : undefined
              }
            />
          )}
          {(waiting || kpis?.renewalsDue) && (
            <DashboardKpiCard
              label="Renewals due"
              icon="material-symbols:schedule-outline-rounded"
              loading={waiting}
              value={kpis?.renewalsDue?.value}
              href="/renewals"
              subline={
                kpis?.renewalsDue ? `In the next ${kpis.renewalsDue.windowDays} days` : undefined
              }
            />
          )}
          {(waiting || kpis?.pastDue) && (
            <DashboardKpiCard
              label="Failed or past due"
              icon="material-symbols:warning-outline-rounded"
              loading={waiting}
              value={kpis?.pastDue?.value}
              goodWhen="down"
              href="/renewals"
              subline={
                kpis?.pastDue
                  ? `${formatCount(kpis.pastDue.failedPaymentsInRange)} failed ${kpis.pastDue.failedPaymentsInRange === 1 ? 'payment' : 'payments'} in this period`
                  : undefined
              }
            />
          )}
          {(waiting || kpis?.newInquiries) && (
            <DashboardKpiCard
              label="New inquiries"
              icon="material-symbols:inbox-outline-rounded"
              loading={waiting}
              value={kpis?.newInquiries?.value}
              change={kpis?.newInquiries?.change}
              previous={kpis?.newInquiries?.previous}
              sparkline={kpis?.newInquiries?.sparkline}
              href="/inquiries"
              subline={
                kpis?.newInquiries
                  ? `${formatCount(kpis.newInquiries.waiting)} waiting for a reply`
                  : undefined
              }
            />
          )}
        </Box>
      )}

      {(waiting ||
        charts?.revenueByMonth ||
        charts?.newSchoolsByMonth ||
        charts?.subscriptionsByStatus ||
        charts?.schoolsPerPlan) && (
        <Box sx={grid({ xs: 'minmax(0, 1fr)', lg: 'repeat(2, minmax(0, 1fr))' })}>
          {(waiting || charts?.revenueByMonth) && (
            <ChartCard
              title="Revenue"
              subtitle="Last 12 months, without GST"
              loading={waiting}
              empty={
                !!charts?.revenueByMonth &&
                charts.revenueByMonth.datasets[0].data.every((value) => value === 0)
              }
            >
              {charts?.revenueByMonth && (
                <AnalyticsChart
                  variant="bars"
                  format="money"
                  labels={charts.revenueByMonth.labels}
                  datasets={charts.revenueByMonth.datasets}
                  height={260}
                />
              )}
            </ChartCard>
          )}
          {(waiting || charts?.newSchoolsByMonth) && (
            <ChartCard
              title="New schools"
              subtitle="Last 12 months"
              loading={waiting}
              empty={
                !!charts?.newSchoolsByMonth &&
                charts.newSchoolsByMonth.datasets[0].data.every((value) => value === 0)
              }
            >
              {charts?.newSchoolsByMonth && (
                <AnalyticsChart
                  variant="line"
                  format="count"
                  labels={charts.newSchoolsByMonth.labels}
                  datasets={charts.newSchoolsByMonth.datasets}
                  height={260}
                />
              )}
            </ChartCard>
          )}
          {(waiting || charts?.subscriptionsByStatus) && (
            <ChartCard
              title="Subscriptions by status"
              subtitle="Every subscription, as of today"
              loading={waiting}
              empty={!!charts?.subscriptionsByStatus && charts.subscriptionsByStatus.length === 0}
            >
              {charts?.subscriptionsByStatus && (
                <AnalyticsChart
                  variant="donut"
                  format="count"
                  items={charts.subscriptionsByStatus}
                  height={260}
                />
              )}
            </ChartCard>
          )}
          {(waiting || charts?.schoolsPerPlan) && (
            <ChartCard
              title="Schools per plan"
              subtitle="Schools with an active or past-due subscription"
              loading={waiting}
              empty={!!charts?.schoolsPerPlan && charts.schoolsPerPlan.length === 0}
            >
              {charts?.schoolsPerPlan && (
                <AnalyticsChart
                  variant="bars"
                  format="count"
                  labels={charts.schoolsPerPlan.map((item) => item.label)}
                  datasets={[
                    {
                      key: 'schools',
                      label: 'Schools',
                      unit: 'count',
                      data: charts.schoolsPerPlan.map((item) => item.value),
                    },
                  ]}
                  height={260}
                />
              )}
            </ChartCard>
          )}
        </Box>
      )}

      {data && (data.attention.length > 0 || panels?.recentActivity) && (
        <Box sx={grid({ xs: 'minmax(0, 1fr)', lg: 'repeat(2, minmax(0, 1fr))' })}>
          {data.attention.length > 0 && <NeedsAttentionCard items={data.attention} />}
          {panels?.recentActivity && <RecentActivityPanel rows={panels.recentActivity} />}
        </Box>
      )}

      {data && (
        <Box sx={grid({ xs: 'minmax(0, 1fr)', md: 'repeat(2, minmax(0, 1fr))' })}>
          {panels?.latestSchools && <LatestSchoolsPanel rows={panels.latestSchools} />}
          {panels?.latestPayments && <LatestPaymentsPanel rows={panels.latestPayments} />}
          {panels?.liveAnnouncements && <LiveAnnouncementsPanel rows={panels.liveAnnouncements} />}
          <QuickActionsCard />
        </Box>
      )}
    </Stack>
  );
};

export default Dashboard;
