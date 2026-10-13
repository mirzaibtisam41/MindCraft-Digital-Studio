'use client';

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartCard } from '@/components/charts/ChartCard';
import { ChartTooltip } from '@/components/charts/ChartTooltip';
import {
  CHART_COLORS,
  CHART_DATE_AXIS_PROPS,
  CHART_GRID_PROPS,
  CHART_LINE_CURSOR,
  CHART_MARGIN,
  CHART_VALUE_AXIS_PROPS,
} from '@/components/charts/chartAxes';
import { formatLongDate } from '@/lib/formatDate';

const SERIES = [
  { key: 'creditsSpent', label: 'Spent', color: CHART_COLORS.primary },
  { key: 'creditsIssued', label: 'Issued', color: CHART_COLORS.secondary },
];

const TABLE_COLUMNS = [
  { key: 'date', label: 'Date', format: formatLongDate },
  { key: 'creditsSpent', label: 'Spent', numeric: true },
  { key: 'creditsIssued', label: 'Issued', numeric: true },
];

export function CreditsChart({ daily, className }) {
  return (
    <ChartCard
      title="Credit flow"
      description="Credits spent on generations (after refunds) vs credits issued by signups and admins."
      legend={SERIES.map((item) => ({ ...item, shape: 'line' }))}
      table={{ columns: TABLE_COLUMNS, rows: daily }}
      className={className}
    >
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={daily} margin={CHART_MARGIN}>
            <CartesianGrid {...CHART_GRID_PROPS} />
            <XAxis {...CHART_DATE_AXIS_PROPS} />
            <YAxis {...CHART_VALUE_AXIS_PROPS} />
            <Tooltip
              cursor={CHART_LINE_CURSOR}
              content={
                <ChartTooltip series={SERIES} formatLabel={formatLongDate} />
              }
            />
            {SERIES.map((item) => (
              <Line
                key={item.key}
                type="monotone"
                dataKey={item.key}
                stroke={item.color}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                dot={false}
                activeDot={{ r: 4, stroke: 'var(--card)', strokeWidth: 2 }}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
