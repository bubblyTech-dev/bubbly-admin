import {
  PropsWithChildren,
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useSearchParams } from 'react-router';
import { analyticsService } from 'services/analyticsService';
import { AnalyticsMeta, RangePreset } from 'types/analytics';
import PageLoader from 'components/loading/PageLoader';

// The global filters shared by every Analytics and Reports page: date range, compare, plan, status, source.
// They live in the address (?preset=last_30_days&plan=...) so a page can be shared, and the last choice is
// remembered in this browser so the next page opens with the same filters.

export interface Filters {
  preset: RangePreset;
  from: string;
  to: string;
  compare: boolean;
  plan: string[];
  status: string[];
  source: string[];
}

// which filters a page can use (the bar only shows these)
export interface FilterSupport {
  dateRange: boolean;
  compare: boolean;
  plan: boolean;
  // the kind of status / source the dataset has ('school', 'subscription', ...), or null when not supported
  status: string | null;
  source: string | null;
}

interface FiltersContextValue {
  filters: Filters;
  meta: AnalyticsMeta;
  setFilters: (changes: Partial<Filters>) => void;
  reset: () => void;
  isDefault: boolean;
  // the query parameters for the API, limited to what the page supports
  apiParams: (support: FilterSupport) => Record<string, string>;
}

const STORAGE_KEY = 'bubbly.analytics.filters';
const PRESETS: RangePreset[] = [
  'today',
  'yesterday',
  'last_7_days',
  'last_30_days',
  'last_90_days',
  'last_12_months',
  'this_month',
  'last_month',
  'this_quarter',
  'this_fiscal_year',
  'last_fiscal_year',
  'custom',
];

const FiltersContext = createContext<FiltersContextValue | null>(null);

const list = (value: string | null) => (value ? value.split(',').filter(Boolean) : []);

const readStored = (): Partial<Filters> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Partial<Filters>) : {};
  } catch {
    return {};
  }
};

const writeStored = (filters: Filters) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  } catch {
    // private window or blocked storage: the filters simply are not remembered
  }
};

const defaultsFor = (meta: AnalyticsMeta): Filters => ({
  preset: meta.defaultRange,
  from: '',
  to: '',
  compare: false,
  plan: [],
  status: [],
  source: [],
});

const isPreset = (value: string | null): value is RangePreset =>
  Boolean(value) && PRESETS.includes(value as RangePreset);

const isDate = (value: string | null) =>
  Boolean(value) && /^\d{4}-\d{2}-\d{2}$/.test(value as string);

// address first, then what this browser remembered, then the defaults
const initialFilters = (params: URLSearchParams, meta: AnalyticsMeta): Filters => {
  const defaults = defaultsFor(meta);
  const stored = readStored();
  const fromUrl = params.has('preset');

  const preset = params.get('preset');
  const candidate: Filters = fromUrl
    ? {
        preset: isPreset(preset) ? preset : defaults.preset,
        from: isDate(params.get('from')) ? (params.get('from') as string) : '',
        to: isDate(params.get('to')) ? (params.get('to') as string) : '',
        compare: params.get('compare') === 'true',
        plan: list(params.get('plan')),
        status: list(params.get('status')),
        source: list(params.get('source')),
      }
    : { ...defaults, ...stored };

  // a custom range without both dates cannot be used
  if (candidate.preset === 'custom' && (!candidate.from || !candidate.to)) {
    return { ...candidate, preset: defaults.preset, from: '', to: '' };
  }
  return candidate;
};

export const FiltersProvider = ({ children }: PropsWithChildren) => {
  const [params, setParams] = useSearchParams();
  const [meta, setMeta] = useState<AnalyticsMeta | null>(null);
  const [error, setError] = useState('');
  const [filters, setFiltersState] = useState<Filters | null>(null);

  useEffect(() => {
    let active = true;
    analyticsService
      .meta()
      .then((result) => {
        if (!active) return;
        setMeta(result);
        setFiltersState((current) => current ?? initialFilters(params, result));
      })
      .catch(() => {
        if (active) setError('The filters could not be loaded. Please refresh the page.');
      });
    return () => {
      active = false;
    };
    // the first load only: later address changes come from this provider itself
  }, []);

  // keep the address and the remembered copy in step with the filters (other parameters, like ?report=, are kept)
  useEffect(() => {
    if (!filters) return;
    writeStored(filters);

    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.set('preset', filters.preset);
        const assign = (key: string, value: string) =>
          value ? next.set(key, value) : next.delete(key);
        assign('from', filters.preset === 'custom' ? filters.from : '');
        assign('to', filters.preset === 'custom' ? filters.to : '');
        assign('compare', filters.compare ? 'true' : '');
        assign('plan', filters.plan.join(','));
        assign('status', filters.status.join(','));
        assign('source', filters.source.join(','));
        return next;
      },
      { replace: true },
    );
  }, [filters, setParams]);

  const setFilters = useCallback((changes: Partial<Filters>) => {
    setFiltersState((current) => (current ? { ...current, ...changes } : current));
  }, []);

  const reset = useCallback(() => {
    if (meta) setFiltersState(defaultsFor(meta));
  }, [meta]);

  const value = useMemo<FiltersContextValue | null>(() => {
    if (!filters || !meta) return null;

    const defaults = defaultsFor(meta);
    const isDefault = JSON.stringify(filters) === JSON.stringify(defaults);

    const apiParams = (support: FilterSupport) => {
      const result: Record<string, string> = {};
      if (support.dateRange) {
        result.preset = filters.preset;
        if (filters.preset === 'custom') {
          result.from = filters.from;
          result.to = filters.to;
        }
        if (support.compare && filters.compare) result.compare = 'true';
      }
      if (support.plan && filters.plan.length) result.plan = filters.plan.join(',');
      if (support.status && filters.status.length) result.status = filters.status.join(',');
      if (support.source && filters.source.length) result.source = filters.source.join(',');
      return result;
    };

    return { filters, meta, setFilters, reset, isDefault, apiParams };
  }, [filters, meta, setFilters, reset]);

  if (error) return <PageLoaderMessage message={error} />;
  if (!value) return <PageLoader sx={{ minHeight: 320 }} />;

  return <FiltersContext value={value}>{children}</FiltersContext>;
};

const PageLoaderMessage = ({ message }: { message: string }) => (
  <div style={{ padding: 32 }}>{message}</div>
);

export const useFilters = () => {
  const context = use(FiltersContext);
  if (!context) throw new Error('useFilters must be used inside FiltersProvider');
  return context;
};
