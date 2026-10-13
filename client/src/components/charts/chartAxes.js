import { formatShortDate } from '@/lib/formatDate';
import { formatCompact } from '@/lib/formatNumber';

export const CHART_COLORS = {
  primary: 'var(--chart-1)',
  secondary: 'var(--chart-2)',
  critical: 'var(--chart-critical)',
};

export const CHART_GRID_PROPS = {
  vertical: false,
  stroke: 'var(--chart-grid)',
};

export const CHART_DATE_AXIS_PROPS = {
  dataKey: 'date',
  tickLine: false,
  axisLine: { stroke: 'var(--chart-grid)' },
  tick: { fill: 'var(--ink-3)', fontSize: 11 },
  tickMargin: 8,
  minTickGap: 28,
  interval: 'preserveStartEnd',
  tickFormatter: formatShortDate,
};

export const CHART_VALUE_AXIS_PROPS = {
  width: 36,
  tickLine: false,
  axisLine: false,
  allowDecimals: false,
  tick: { fill: 'var(--ink-3)', fontSize: 11 },
  tickFormatter: formatCompact,
};

export const CHART_MARGIN = { top: 8, right: 8, bottom: 0, left: 0 };

export const CHART_BAR_CURSOR = { fill: 'var(--accent)', opacity: 0.6 };

export const CHART_LINE_CURSOR = { stroke: 'var(--ink-3)', strokeWidth: 1 };
