import { Box } from '@mui/material';
import { DatasetState } from 'hooks/useAnalyticsData';
import { AnalyticsData, AnalyticsTable, BreakdownItem, Kpi, Series, Widget } from 'types/analytics';
import AnalyticsChart, { ChartVariant } from './AnalyticsChart';
import ChartCard from './ChartCard';
import DataTable from './DataTable';
import ExportMenu from './ExportMenu';
import KpiCard from './KpiCard';

interface WidgetRendererProps {
  widget: Widget;
  state: DatasetState | undefined;
  // the filters used for the page (so the small export icon of a chart downloads the same data)
  params: Record<string, string>;
  onRetry: () => void;
}

// 'series.newSchools' -> data.series.newSchools
const pick = (data: AnalyticsData, path: string): unknown => {
  const [group, name] = path.split('.');
  if (group === 'kpis') return data.kpis?.find((item) => item.key === name);
  const bucket = (data as Record<string, unknown>)[group] as Record<string, unknown> | undefined;
  return bucket ? bucket[name] : undefined;
};

export const defaultSpan = (widget: Widget) => {
  if (widget.span) return widget.span;
  if (widget.type === 'kpi') return 1;
  if (widget.type === 'table') return 4;
  return 2;
};

const isEmptySeries = (series: Series | undefined) =>
  !series ||
  series.labels.length === 0 ||
  series.datasets.every((dataset) =>
    dataset.data.every((value) => (Array.isArray(value) ? value[2] === 0 : value === 0)),
  );

// Draws one widget of an area page from the dataset it points at.
const WidgetRenderer = ({ widget, state, params, onRetry }: WidgetRendererProps) => {
  const loading = !state || state.loading;
  const error = state?.error ?? '';
  const data = state?.result?.data;
  const found = data ? pick(data, widget.path) : undefined;

  if (widget.type === 'kpi') {
    const kpi = found as Kpi | undefined;
    if (error) {
      return (
        <ChartCard title={widget.title} error={error} onRetry={onRetry} height={80}>
          {null}
        </ChartCard>
      );
    }
    return (
      <KpiCard
        label={widget.title}
        loading={loading}
        value={kpi?.value}
        unit={widget.format ?? kpi?.unit}
        change={kpi?.change ?? null}
        previous={kpi?.previous ?? null}
        sparkline={kpi?.sparkline}
        icon={widget.icon}
        goodWhen={widget.goodWhen}
      />
    );
  }

  const exportAction = (
    <ExportMenu
      kind="analytics"
      dataKey={widget.dataset}
      params={params}
      variant="icon"
      disabled={loading || Boolean(error)}
    />
  );

  if (widget.type === 'table') {
    const table = found as AnalyticsTable | undefined;
    return (
      <ChartCard
        title={widget.title}
        subtitle={widget.subtitle}
        loading={loading}
        error={error}
        onRetry={onRetry}
        empty={!table || table.rows.length === 0}
        action={exportAction}
        height={180}
      >
        {table && (
          <DataTable
            columns={table.columns}
            rows={table.rows}
            totals={table.totals}
            maxRows={widget.maxRows ?? 10}
          />
        )}
      </ChartCard>
    );
  }

  if (widget.type === 'donut') {
    const items = (found as BreakdownItem[] | undefined) ?? [];
    return (
      <ChartCard
        title={widget.title}
        subtitle={widget.subtitle}
        loading={loading}
        error={error}
        onRetry={onRetry}
        empty={items.length === 0 || items.every((item) => item.value === 0)}
        action={exportAction}
      >
        <AnalyticsChart
          variant="donut"
          items={items}
          format={widget.format}
          colors={widget.colors}
        />
      </ChartCard>
    );
  }

  const series = found as Series | undefined;
  return (
    <ChartCard
      title={widget.title}
      subtitle={widget.subtitle}
      loading={loading}
      error={error}
      onRetry={onRetry}
      empty={isEmptySeries(series)}
      action={exportAction}
    >
      {series && (
        <Box>
          <AnalyticsChart
            variant={widget.type as ChartVariant}
            labels={series.labels}
            yLabels={series.yLabels}
            datasets={series.datasets}
            format={widget.format ?? series.datasets[0]?.unit}
            colors={widget.colors}
          />
        </Box>
      )}
    </ChartCard>
  );
};

export default WidgetRenderer;
