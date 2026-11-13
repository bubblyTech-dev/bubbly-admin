import { useEffect, useState } from 'react';
import { Alert, Box, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import useDebouncedValue from 'hooks/useDebouncedValue';
import { parseApiError } from 'lib/api';
import { reportService } from 'services/reportService';
import { ReportFilter, ReportResult } from 'types/reports';
import SearchField from 'components/common/SearchField';
import DataTable from './DataTable';
import MultiSelectFilter from './MultiSelectFilter';

interface ReportViewProps {
  reportKey: string;
  // the global date range (empty when the report ignores it)
  rangeParams: Record<string, string>;
  // the report's own filters, kept by the page so the Export menu can use them
  values: Record<string, string>;
  onValuesChange: (values: Record<string, string>) => void;
  onLoaded?: (result: ReportResult) => void;
}

const PER_PAGE = 25;

// A report preview: its own filters, the table with totals, and the pager.
const ReportView = ({
  reportKey,
  rangeParams,
  values,
  onValuesChange,
  onLoaded,
}: ReportViewProps) => {
  const [result, setResult] = useState<ReportResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  const debounced = useDebouncedValue(JSON.stringify(values));
  const rangeText = JSON.stringify(rangeParams);

  // a new report, filter or date range starts again from the first page
  useEffect(() => {
    setPage(1);
  }, [reportKey, debounced, rangeText]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');

    reportService
      .get(
        reportKey,
        {
          ...rangeParams,
          ...(JSON.parse(debounced) as Record<string, string>),
          page: String(page),
          perPage: String(PER_PAGE),
        },
        controller.signal,
      )
      .then((data) => {
        setResult(data);
        onLoaded?.(data);
        setLoading(false);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError(parseApiError(err).message);
        setLoading(false);
      });

    return () => controller.abort();
  }, [reportKey, debounced, rangeText, page]);

  const set = (key: string, value: string) => {
    const next = { ...values };
    if (value) next[key] = value;
    else delete next[key];
    onValuesChange(next);
  };

  const renderFilter = (filter: ReportFilter) => {
    const current = values[filter.key] ?? '';

    if (filter.type === 'text') {
      return (
        <SearchField
          key={filter.key}
          value={current}
          onChange={(value) => set(filter.key, value)}
          placeholder={filter.label}
        />
      );
    }

    if (filter.type === 'date') {
      return (
        <TextField
          key={filter.key}
          size="small"
          type="date"
          label={filter.label}
          value={current}
          onChange={(event) => set(filter.key, event.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />
      );
    }

    if (filter.type === 'multiselect') {
      return (
        <MultiSelectFilter
          key={filter.key}
          label={filter.label}
          allLabel="All"
          options={filter.options ?? []}
          value={current ? current.split(',') : []}
          onChange={(items) => set(filter.key, items.join(','))}
        />
      );
    }

    return (
      <TextField
        key={filter.key}
        select
        size="small"
        label={filter.label}
        value={current}
        onChange={(event) => set(filter.key, event.target.value)}
        sx={{ minWidth: 180 }}
        slotProps={{ inputLabel: { shrink: true }, select: { displayEmpty: true } }}
      >
        <MenuItem value="">All</MenuItem>
        {(filter.options ?? []).map((option) => (
          <MenuItem key={String(option.value)} value={String(option.value)}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
    );
  };

  const filters = result?.report.filters ?? [];

  return (
    <Paper sx={{ p: { xs: 3, md: 4 } }}>
      <Stack direction="column" spacing={3}>
        {result && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {result.report.title}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {result.report.description}
            </Typography>
          </Box>
        )}

        {filters.length > 0 && (
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ flexWrap: 'wrap', rowGap: 1.5 }}
          >
            {filters.map(renderFilter)}
          </Stack>
        )}

        {error && <Alert severity="error">{error}</Alert>}

        <DataTable
          columns={result?.report.columns ?? []}
          rows={result?.rows ?? []}
          totals={result?.totals}
          loading={loading}
          emptyText="No rows match these filters."
          pager={{ page, perPage: PER_PAGE, total: result?.meta.total ?? 0, onChange: setPage }}
          minWidth={Math.max(720, (result?.report.columns.length ?? 6) * 140)}
        />
      </Stack>
    </Paper>
  );
};

export default ReportView;
