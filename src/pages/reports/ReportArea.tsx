import { useEffect, useMemo, useState } from 'react';
import { Navigate, useParams, useSearchParams } from 'react-router';
import { Alert, Box, Stack, Tab, Tabs, Typography } from '@mui/material';
import { findReportArea } from 'features/reports/registry';
import paths from 'routes/paths';
import { reportService } from 'services/reportService';
import { ReportAreaConfig, ReportCatalogueItem } from 'types/reports';
import ExportMenu from 'components/analytics/ExportMenu';
import { FilterSupport, FiltersProvider, useFilters } from 'components/analytics/FiltersProvider';
import GlobalFilterBar from 'components/analytics/GlobalFilterBar';
import ReportView from 'components/analytics/ReportView';
import PageHeader from 'components/common/PageHeader';

// One generic page for every Reports area: the area's reports as pill tabs, each with its own filters,
// a preview table and (through the Export menu in the filter bar) a CSV / Excel download.

const AreaView = ({ config }: { config: ReportAreaConfig }) => {
  const { apiParams } = useFilters();
  const [search, setSearch] = useSearchParams();

  const [catalogue, setCatalogue] = useState<ReportCatalogueItem[] | null>(null);
  const [error, setError] = useState('');
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;
    reportService
      .catalogue()
      .then((areas) => {
        if (!active) return;
        const items = areas.find((area) => area.area === config.area)?.reports ?? [];
        // the config decides which reports show and in which order
        setCatalogue(
          config.reports
            .map((key) => items.find((item) => item.key === key))
            .filter((item): item is ReportCatalogueItem => Boolean(item)),
        );
      })
      .catch(() => {
        if (active) setError('The reports could not be loaded. Please try again.');
      });
    return () => {
      active = false;
    };
  }, [config]);

  const selectedKey = useMemo(() => {
    const requested = search.get('report');
    return catalogue?.find((item) => item.key === requested)?.key ?? catalogue?.[0]?.key;
  }, [catalogue, search]);

  const selected = catalogue?.find((item) => item.key === selectedKey);

  const support: FilterSupport = {
    dateRange: selected?.usesDateRange ?? true,
    compare: false,
    plan: false,
    status: null,
    source: null,
  };
  const rangeParams = apiParams(support);
  const exportParams = { ...rangeParams, ...values };

  const choose = (key: string) => {
    setValues({});
    setSearch(
      (current) => {
        const next = new URLSearchParams(current);
        next.set('report', key);
        return next;
      },
      { replace: true },
    );
  };

  return (
    <Stack direction="column" sx={{ minHeight: 1 }}>
      <PageHeader
        title={config.title}
        breadcrumb={[
          { label: 'Home', url: paths.root },
          { label: 'Reports' },
          { label: config.title, active: true },
        ]}
      />

      <GlobalFilterBar
        support={support}
        noDateNote="This report is not limited by date, so the date range does not apply."
        actions={
          selectedKey ? (
            <ExportMenu kind="reports" dataKey={selectedKey} params={exportParams} />
          ) : undefined
        }
      />

      <Stack direction="column" spacing={3} sx={{ px: { xs: 3, md: 5 }, py: 4 }}>
        <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 720 }}>
          {config.description}
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}

        {catalogue && catalogue.length > 1 && (
          <Tabs
            value={selectedKey ?? false}
            onChange={(_event, key: string) => choose(key)}
            variant="scrollable"
            scrollButtons={false}
          >
            {catalogue.map((item) => (
              <Tab key={item.key} value={item.key} label={item.title} />
            ))}
          </Tabs>
        )}

        {selectedKey && (
          <Box key={selectedKey}>
            <ReportView
              reportKey={selectedKey}
              rangeParams={rangeParams}
              values={values}
              onValuesChange={setValues}
            />
          </Box>
        )}
      </Stack>
    </Stack>
  );
};

const ReportArea = () => {
  const { area } = useParams();
  const config = findReportArea(area);

  if (!config) return <Navigate to={paths[404]} replace />;

  return (
    <FiltersProvider>
      <AreaView key={config.area} config={config} />
    </FiltersProvider>
  );
};

export default ReportArea;
