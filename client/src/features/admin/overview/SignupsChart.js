'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartCard } from '@/components/charts/ChartCard';
import { ChartTooltip } from '@/components/charts/ChartTooltip';
import {
  CHART_BAR_CURSOR,
  CHART_COLORS,
  CHART_DATE_AXIS_PROPS,
  CHART_GRID_PROPS,
  CHART_MARGIN,
  CHART_VALUE_AXIS_PROPS,
} from '@/components/charts/chartAxes';
import { formatLongDate } from '@/lib/formatDate';

const SERIES = [
  { key: 'newUsers', label: 'New users', color: CHART_COLORS.primary },
];

const TABLE_COLUMNS = [
  { key: 'date', label: 'Date', format: formatLongDate },
  { key: 'newUsers', label: 'New users', numeric: true },
];

export function SignupsChart({ daily, className }) {
  return (
    <ChartCard
      title="New users"
      description="Accounts created per day."
      table={{ columns: TABLE_COLUMNS, rows: daily }}
      className={className}
    >
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={daily} margin={CHART_MARGIN} barCategoryGap="20%">
            <CartesianGrid {...CHART_GRID_PROPS} />
            <XAxis {...CHART_DATE_AXIS_PROPS} />
            <YAxis {...CHART_VALUE_AXIS_PROPS} />
            <Tooltip
              cursor={CHART_BAR_CURSOR}
              content={
                <ChartTooltip series={SERIES} formatLabel={formatLongDate} />
              }
            />
            <Bar
              dataKey="newUsers"
              fill={CHART_COLORS.primary}
              radius={[4, 4, 0, 0]}
              maxBarSize={24}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
