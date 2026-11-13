import { Navigate, useParams } from 'react-router';
import { Box, Stack, Typography } from '@mui/material';
import { findAnalyticsArea } from 'features/analytics/registry';
import useAnalyticsData from 'hooks/useAnalyticsData';
import useFilterSupport from 'hooks/useFilterSupport';
import paths from 'routes/paths';
import { AnalyticsAreaConfig, Widget } from 'types/analytics';
import ExportMenu from 'components/analytics/ExportMenu';
import { FiltersProvider, useFilters } from 'components/analytics/FiltersProvider';
import GlobalFilterBar from 'components/analytics/GlobalFilterBar';
import WidgetRenderer, { defaultSpan } from 'components/analytics/WidgetRenderer';
import PageHeader from 'components/common/PageHeader';

// One generic page for every Analytics area. What it shows comes from the area's config file in
// src/features/analytics/areas; the data comes from the datasets those widgets point at.

const columnSpan = (widget: Widget) => {
  const span = defaultSpan(widget);
  return { xs: 'span 1', sm: `span ${Math.min(2, span)}`, lg: `span ${span}` };
};

const AreaView = ({ config }: { config: AnalyticsAreaConfig }) => {
  const { apiParams } = useFilters();

  const datasetKeys = [
    ...new Set(
      config.sections.flatMap((section) => section.widgets.map((widget) => widget.dataset)),
    ),
  ];
  const support = useFilterSupport(datasetKeys);
  const params = apiParams(support);
  const { states, retry } = useAnalyticsData(datasetKeys, params);

  const primary = config.primaryDataset ?? datasetKeys[0];

  return (
    <Stack direction="column" sx={{ minHeight: 1 }}>
      <PageHeader
        title={config.title}
        breadcrumb={[
          { label: 'Home', url: paths.root },
          { label: 'Analytics' },
          { label: config.title, active: true },
        ]}
      />

      <GlobalFilterBar
        support={support}
        actions={<ExportMenu kind="analytics" dataKey={primary} params={params} />}
      />

      <Stack direction="column" spacing={4} sx={{ px: { xs: 3, md: 5 }, py: 4 }}>
        <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 720 }}>
          {config.description}
        </Typography>

        {config.sections.map((section, index) => (
          <Stack key={section.title ?? index} direction="column" spacing={2}>
            {section.title && (
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {section.title}
              </Typography>
            )}
            <Box
              sx={{
                display: 'grid',
                gap: 3,
                gridTemplateColumns: {
                  xs: 'minmax(0, 1fr)',
                  sm: 'repeat(2, minmax(0, 1fr))',
                  lg: 'repeat(4, minmax(0, 1fr))',
                },
              }}
            >
              {section.widgets.map((widget) => (
                <Box
                  key={`${widget.dataset}.${widget.path}.${widget.type}`}
                  sx={{ gridColumn: columnSpan(widget), minWidth: 0 }}
                >
                  <WidgetRenderer
                    widget={widget}
                    state={states[widget.dataset]}
                    params={params}
                    onRetry={() => retry(widget.dataset)}
                  />
                </Box>
              ))}
            </Box>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
};

const AnalyticsArea = () => {
  const { area } = useParams();
  const config = findAnalyticsArea(area);

  if (!config) return <Navigate to={paths[404]} replace />;

  return (
    <FiltersProvider>
      <AreaView key={config.area} config={config} />
    </FiltersProvider>
  );
};

export default AnalyticsArea;
