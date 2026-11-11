import { ReactNode, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import { RangePreset } from 'types/analytics';
import IconifyIcon from 'components/base/IconifyIcon';
import { FilterSupport, useFilters } from './FiltersProvider';
import MultiSelectFilter from './MultiSelectFilter';

interface GlobalFilterBarProps {
  support: FilterSupport;
  // shown at the right end of the bar: the Export menu
  actions?: ReactNode;
  // an explanation shown instead of the range when the page does not use the date range
  noDateNote?: string;
}

// the presets shown as pills (the others stay available through the address)
const PILL_PRESETS: RangePreset[] = [
  'today',
  'last_7_days',
  'last_30_days',
  'last_90_days',
  'last_12_months',
  'this_month',
  'last_month',
  'this_fiscal_year',
  'custom',
];

const SHORT_LABELS: Partial<Record<RangePreset, string>> = {
  today: 'Today',
  last_7_days: '7 days',
  last_30_days: '30 days',
  last_90_days: '90 days',
  last_12_months: '12 months',
  this_month: 'This month',
  last_month: 'Last month',
  custom: 'Custom',
};

const formatDay = (value: string) => dayjs(value).format('DD MMM YYYY');

// The filter bar at the top of every Analytics and Reports page: date range pills, compare switch,
// plan / status / source filters (only the ones the page supports), Reset, and the Export menu at the right.
const GlobalFilterBar = ({ support, actions, noDateNote }: GlobalFilterBarProps) => {
  const { filters, meta, setFilters, reset, isDefault } = useFilters();

  const [draftFrom, setDraftFrom] = useState(filters.from);
  const [draftTo, setDraftTo] = useState(filters.to);

  useEffect(() => {
    setDraftFrom(filters.from);
    setDraftTo(filters.to);
  }, [filters.from, filters.to]);

  const presetInfo = (preset: RangePreset) => meta.presets.find((item) => item.value === preset);

  const pillLabel = (preset: RangePreset) => {
    if (preset === 'this_fiscal_year') return `This FY ${meta.fiscalYear.replace('FY ', '')}`;
    return SHORT_LABELS[preset] ?? presetInfo(preset)?.label ?? preset;
  };

  // the dates behind the active preset, for the "Showing ..." line
  const shown = (() => {
    if (filters.preset === 'custom') {
      return filters.from && filters.to ? { from: filters.from, to: filters.to } : null;
    }
    const info = presetInfo(filters.preset);
    return info?.from && info.to ? { from: info.from, to: info.to } : null;
  })();

  const customInvalid = Boolean(draftFrom && draftTo && draftFrom > draftTo);
  const canApplyCustom = Boolean(draftFrom && draftTo) && !customInvalid;

  const applyCustom = () => {
    if (canApplyCustom) setFilters({ preset: 'custom', from: draftFrom, to: draftTo });
  };

  const statusOptions = support.status ? (meta.statusOptions[support.status] ?? []) : [];
  const sourceOptions = support.source ? (meta.sourceOptions[support.source] ?? []) : [];
  const hasSecondRow = support.plan || Boolean(support.status) || Boolean(support.source);

  return (
    <Paper
      sx={{
        position: 'sticky',
        top: { xs: 64, md: 82 },
        zIndex: 5,
        px: { xs: 3, md: 5 },
        py: 2,
        borderBottom: 1,
        borderColor: 'divider',
        borderRadius: 0,
      }}
    >
      <Stack direction="column" spacing={1.5}>
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          spacing={{ xs: 1.5, lg: 3 }}
          sx={{ justifyContent: 'space-between', alignItems: { lg: 'center' } }}
        >
          {support.dateRange ? (
            <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
              {PILL_PRESETS.map((preset) => {
                const selected = filters.preset === preset;
                return (
                  <Chip
                    key={preset}
                    clickable
                    color={selected ? 'primary' : 'default'}
                    variant={selected ? 'filled' : 'outlined'}
                    label={pillLabel(preset)}
                    onClick={() => {
                      if (preset === 'custom') {
                        setFilters({
                          preset: 'custom',
                          from: filters.from || shown?.from || '',
                          to: filters.to || shown?.to || '',
                        });
                      } else {
                        setFilters({ preset, from: '', to: '' });
                      }
                    }}
                    sx={{
                      height: 36,
                      borderRadius: 999,
                      fontWeight: 600,
                      '& .MuiChip-label': { px: 2 },
                    }}
                  />
                );
              })}
            </Stack>
          ) : (
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: 'center', color: 'text.secondary' }}
            >
              <IconifyIcon icon="material-symbols:info-outline-rounded" sx={{ fontSize: 20 }} />
              <Typography variant="body2">
                {noDateNote ?? 'This view is not limited by date.'}
              </Typography>
            </Stack>
          )}

          <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', lg: 'flex-end' } }}>
            {actions}
          </Box>
        </Stack>

        {support.dateRange && filters.preset === 'custom' && (
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{ alignItems: { sm: 'flex-start' } }}
          >
            <TextField
              size="small"
              type="date"
              label="From"
              value={draftFrom}
              onChange={(event) => setDraftFrom(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              size="small"
              type="date"
              label="To"
              value={draftTo}
              onChange={(event) => setDraftTo(event.target.value)}
              error={customInvalid}
              helperText={
                customInvalid ? 'The end date must be on or after the start date.' : undefined
              }
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <Button
              variant="contained"
              disabled={!canApplyCustom}
              onClick={applyCustom}
              sx={{ height: 40 }}
            >
              Apply
            </Button>
          </Stack>
        )}

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={{ xs: 1.5, md: 2 }}
          sx={{ alignItems: { md: 'center' }, flexWrap: 'wrap', rowGap: 1.5 }}
        >
          {support.dateRange && support.compare && (
            <FormControlLabel
              control={
                <Switch
                  checked={filters.compare}
                  onChange={(event) => setFilters({ compare: event.target.checked })}
                />
              }
              label="Compare with previous period"
              sx={{ mr: 0, whiteSpace: 'nowrap' }}
            />
          )}
          {support.plan && (
            <MultiSelectFilter
              label="Plan"
              allLabel="All plans"
              options={meta.plans}
              value={filters.plan}
              onChange={(plan) => setFilters({ plan })}
            />
          )}
          {support.status && (
            <MultiSelectFilter
              label="Status"
              allLabel="All statuses"
              options={statusOptions}
              value={filters.status}
              onChange={(status) => setFilters({ status })}
            />
          )}
          {support.source && (
            <MultiSelectFilter
              label="Source"
              allLabel="All sources"
              options={sourceOptions}
              value={filters.source}
              onChange={(source) => setFilters({ source })}
            />
          )}

          {(hasSecondRow || support.dateRange) && (
            <Button
              variant="text"
              color="neutral"
              size="small"
              disabled={isDefault}
              onClick={reset}
              startIcon={
                <IconifyIcon icon="material-symbols:restart-alt-rounded" sx={{ fontSize: 18 }} />
              }
            >
              Reset filters
            </Button>
          )}

          {support.dateRange && shown && (
            <Box sx={{ ml: { md: 'auto' } }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Showing {formatDay(shown.from)} – {formatDay(shown.to)} (IST)
                {filters.compare && support.compare ? ' · compared with the period before' : ''}
              </Typography>
            </Box>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
};

export default GlobalFilterBar;
