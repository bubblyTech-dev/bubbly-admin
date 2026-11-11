// What the analytics API sends, and what an area page is configured with.

export type AnalyticsUnit = 'count' | 'money' | 'percent' | 'days';

export interface FilterOption {
  value: string | number;
  label: string;
}

export type RangePreset =
  | 'today'
  | 'yesterday'
  | 'last_7_days'
  | 'last_30_days'
  | 'last_90_days'
  | 'last_12_months'
  | 'this_month'
  | 'last_month'
  | 'this_quarter'
  | 'this_fiscal_year'
  | 'last_fiscal_year'
  | 'custom';

export interface PresetInfo {
  value: RangePreset;
  label: string;
  from: string | null;
  to: string | null;
}

export interface AnalyticsMeta {
  plans: FilterOption[];
  statusOptions: Record<string, FilterOption[]>;
  sourceOptions: Record<string, FilterOption[]>;
  presets: PresetInfo[];
  defaultRange: RangePreset;
  fiscalStartMonth: number;
  fiscalYear: string;
  timezone: string;
}

export interface RangeInfo {
  preset: RangePreset;
  from: string;
  to: string;
  days: number;
  granularity: 'day' | 'week' | 'month';
  timezone: string;
  fiscalYear: string;
  previous: { from: string; to: string; days: number } | null;
}

export interface Kpi {
  key: string;
  label: string;
  value: number;
  previous: number | null;
  change: number | null;
  unit: AnalyticsUnit;
  sparkline?: number[];
}

export interface SeriesDataset {
  key: string;
  label: string;
  // numbers per label; for a heatmap an array of [x, y, value]
  data: Array<number | [number, number, number]>;
  unit?: AnalyticsUnit;
}

export interface Series {
  labels: string[];
  // heatmap only: the labels of the rows
  yLabels?: string[];
  datasets: SeriesDataset[];
}

export interface BreakdownItem {
  label: string;
  value: number;
}

export interface TableColumn {
  key: string;
  label: string;
  type: 'text' | 'number' | 'integer' | 'money' | 'percent' | 'date' | 'datetime';
  width?: number;
}

export interface AnalyticsTable {
  columns: TableColumn[];
  rows: Array<Record<string, unknown>>;
  totals?: Record<string, unknown>;
}

export interface AnalyticsData {
  kpis?: Kpi[];
  series?: Record<string, Series>;
  breakdowns?: Record<string, BreakdownItem[]>;
  tables?: Record<string, AnalyticsTable>;
  exportTable?: string;
}

export interface AnalyticsResult {
  key: string;
  title: string;
  area: string;
  description: string;
  range: RangeInfo;
  previous: RangeInfo['previous'];
  filtersText: string;
  data: AnalyticsData;
}

export interface CatalogueDataset {
  key: string;
  title: string;
  description: string;
  filters: Array<'plan' | 'status' | 'source'>;
  statusKind: string | null;
  sourceKind: string | null;
}

export interface AnalyticsCatalogueArea {
  area: string;
  title: string;
  datasets: CatalogueDataset[];
}

// ---- area page configuration (see src/features/analytics/README) ----

export type WidgetType =
  | 'kpi'
  | 'line'
  | 'area'
  | 'bars'
  | 'stacked'
  | 'donut'
  | 'table'
  | 'heatmap';

export interface Widget {
  type: WidgetType;
  // the analytics dataset key, for example 'schools.growth'
  dataset: string;
  // where the data sits inside the dataset's `data`: 'kpis.totalSchools', 'series.newSchools', 'breakdowns.byStatus', 'tables.newSchools'
  path: string;
  title: string;
  subtitle?: string;
  // how many of the 4 grid columns the widget takes (1 to 4). Default: kpi 1, table 4, charts 2
  span?: 1 | 2 | 3 | 4;
  format?: AnalyticsUnit;
  colors?: string[];
  // kpi only: which direction is good news. 'down' paints a fall green (for example failed payments). Default 'up'
  goodWhen?: 'up' | 'down';
  // kpi only: an icon from the icon set
  icon?: string;
  // table only: show at most this many rows (default 10)
  maxRows?: number;
}

export interface AnalyticsSection {
  title?: string;
  widgets: Widget[];
}

export interface AnalyticsAreaConfig {
  // the area key, same as in the address: /analytics/<area>
  area: string;
  title: string;
  icon: string;
  description: string;
  // sidebar order (lower first)
  order: number;
  sections: AnalyticsSection[];
  // the dataset the Export menu downloads (default: the first widget's dataset)
  primaryDataset?: string;
}
