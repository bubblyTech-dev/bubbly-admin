import { FilterOption, RangeInfo, TableColumn } from 'types/analytics';

export type ReportFilterType = 'select' | 'multiselect' | 'text' | 'date';

export interface ReportFilter {
  key: string;
  label: string;
  type: ReportFilterType;
  options?: FilterOption[];
}

export interface ReportInfo {
  key: string;
  title: string;
  description: string;
  area: string;
  usesDateRange: boolean;
  filters: ReportFilter[];
  columns: TableColumn[];
}

export interface ReportMeta {
  page: number;
  perPage: number;
  total: number;
  lastPage: number;
}

export interface ReportResult {
  report: ReportInfo;
  range: RangeInfo | null;
  filtersText: string;
  rows: Array<Record<string, unknown>>;
  totals: Record<string, unknown> | null;
  meta: ReportMeta;
}

export interface ReportCatalogueItem {
  key: string;
  title: string;
  description: string;
  usesDateRange: boolean;
}

export interface ReportCatalogueArea {
  area: string;
  title: string;
  reports: ReportCatalogueItem[];
}

// the report area page configuration (see src/features/reports/README)
export interface ReportAreaConfig {
  // the area key, same as in the address: /reports/<area>
  area: string;
  title: string;
  icon: string;
  description: string;
  // sidebar order (lower first)
  order: number;
  // report keys in the order the pills are shown
  reports: string[];
}
