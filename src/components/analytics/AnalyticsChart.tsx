import { useMemo } from 'react';
import { useTheme } from '@mui/material';
import type { EChartsOption } from 'echarts';
import { BarChart, HeatmapChart, LineChart, PieChart } from 'echarts/charts';
import {
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  VisualMapComponent,
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import useChartPalette from 'hooks/useChartPalette';
import { formatByUnit } from 'lib/format';
import { AnalyticsUnit, BreakdownItem, SeriesDataset } from 'types/analytics';
import ReactEchart from 'components/base/ReactEchart';

echarts.use([
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  VisualMapComponent,
  LineChart,
  BarChart,
  PieChart,
  HeatmapChart,
  CanvasRenderer,
]);

export type ChartVariant = 'line' | 'area' | 'bars' | 'stacked' | 'donut' | 'heatmap';

interface AnalyticsChartProps {
  variant: ChartVariant;
  format?: AnalyticsUnit;
  // line, area, bars, stacked, heatmap
  labels?: string[];
  datasets?: SeriesDataset[];
  // heatmap: the row labels
  yLabels?: string[];
  // donut
  items?: BreakdownItem[];
  // override the palette (theme colour names are not accepted here: pass resolved colours only if you must)
  colors?: string[];
  height?: number;
}

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// One chart component for every chart type. Colours, fonts and tooltips come from the theme.
const AnalyticsChart = ({
  variant,
  format = 'count',
  labels = [],
  datasets = [],
  yLabels = [],
  items = [],
  colors,
  height = 280,
}: AnalyticsChartProps) => {
  const { typography } = useTheme();
  const palette = useChartPalette();

  const option = useMemo<EChartsOption>(() => {
    const series = colors && colors.length ? colors : palette.colors;
    const font = { fontFamily: typography.fontFamily, fontSize: 12, color: palette.text };
    const animation = !reducedMotion();
    const compact = (value: number) => formatByUnit(value, format, true);
    const full = (value: number) => formatByUnit(value, format, false);

    if (variant === 'donut') {
      const total = items.reduce((sum, item) => sum + item.value, 0);
      return {
        animation,
        color: series,
        tooltip: {
          trigger: 'item',
          valueFormatter: (value) => full(Number(value)),
        },
        title: {
          text: full(total),
          subtext: 'Total',
          left: 'center',
          top: '31%',
          textStyle: { ...font, fontSize: 22, fontWeight: 700, color: palette.text },
          subtextStyle: { ...font, fontSize: 12, color: palette.muted },
        },
        legend: {
          bottom: 0,
          type: 'plain',
          icon: 'circle',
          itemWidth: 8,
          itemHeight: 8,
          itemGap: 12,
          textStyle: font,
        },
        series: [
          {
            type: 'pie',
            radius: ['56%', '78%'],
            center: ['50%', '40%'],
            avoidLabelOverlap: true,
            label: { show: false },
            itemStyle: { borderColor: palette.surface, borderWidth: 3, borderRadius: 6 },
            data: items.map((item) => ({ name: item.label, value: item.value })),
          },
        ],
      };
    }

    if (variant === 'heatmap') {
      const values = (datasets[0]?.data ?? []) as Array<[number, number, number]>;
      const max = Math.max(1, ...values.map((point) => point[2]));
      return {
        animation,
        tooltip: {
          position: 'top',
          formatter: (params) => {
            const point = (params as unknown as { data: [number, number, number] }).data;
            return `${yLabels[point[1]] ?? ''} · ${labels[point[0]] ?? ''}<br/><b>${full(point[2])}</b>`;
          },
        },
        grid: { left: 8, right: 8, top: 8, bottom: 56, containLabel: true },
        xAxis: {
          type: 'category',
          data: labels,
          splitArea: { show: false },
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { ...font, hideOverlap: true },
        },
        yAxis: {
          type: 'category',
          data: yLabels,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: font,
        },
        visualMap: {
          min: 0,
          max,
          calculable: false,
          orient: 'horizontal',
          left: 'center',
          bottom: 4,
          itemWidth: 12,
          itemHeight: 120,
          textStyle: font,
          inRange: { color: [palette.grid, series[0]] },
        },
        series: [
          {
            type: 'heatmap',
            data: values,
            itemStyle: { borderColor: palette.surface, borderWidth: 2, borderRadius: 4 },
            emphasis: { itemStyle: { borderColor: palette.text } },
          },
        ],
      };
    }

    const showLegend = datasets.length > 1;

    return {
      animation,
      color: series,
      grid: { left: 8, right: 16, top: showLegend ? 44 : 16, bottom: 8, containLabel: true },
      legend: showLegend
        ? { top: 0, type: 'scroll', icon: 'circle', itemWidth: 8, itemHeight: 8, textStyle: font }
        : { show: false },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: variant === 'bars' || variant === 'stacked' ? 'shadow' : 'line',
          shadowStyle: { color: palette.grid, opacity: 0.4 },
          lineStyle: { color: palette.muted },
        },
        valueFormatter: (value) => full(Number(value)),
      },
      xAxis: {
        type: 'category',
        data: labels,
        boundaryGap: variant === 'bars' || variant === 'stacked',
        axisLine: { lineStyle: { color: palette.grid } },
        axisTick: { show: false },
        axisLabel: { ...font, hideOverlap: true, margin: 12 },
      },
      yAxis: {
        type: 'value',
        // counts are whole numbers, so the axis never shows 0.5 or 1.5
        minInterval: format === 'count' ? 1 : undefined,
        axisLabel: { ...font, formatter: (value: number) => compact(value) },
        splitLine: { lineStyle: { color: palette.grid, type: 'dashed' } },
      },
      series: datasets.map((dataset, index) => {
        const base = { name: dataset.label, data: dataset.data as number[] };

        if (variant === 'bars' || variant === 'stacked') {
          return {
            ...base,
            type: 'bar' as const,
            stack: variant === 'stacked' ? 'total' : undefined,
            barMaxWidth: 28,
            itemStyle: { borderRadius: variant === 'stacked' ? 0 : [4, 4, 0, 0] },
            emphasis: { focus: 'series' as const },
          };
        }

        return {
          ...base,
          type: 'line' as const,
          smooth: 0.2,
          showSymbol: false,
          symbolSize: 7,
          lineStyle: { width: 2.5 },
          areaStyle: variant === 'area' ? { opacity: 0.14 } : undefined,
          emphasis: { focus: 'series' as const },
          z: datasets.length - index,
        };
      }),
    };
  }, [variant, format, labels, datasets, yLabels, items, colors, palette, typography.fontFamily]);

  return <ReactEchart echarts={echarts} option={option} sx={{ height, width: 1, minWidth: 0 }} />;
};

export default AnalyticsChart;
