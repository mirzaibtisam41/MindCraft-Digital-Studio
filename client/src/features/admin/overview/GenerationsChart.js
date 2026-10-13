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
import { createStackedBarShape } from '@/components/charts/StackedBarShape';
import { formatLongDate } from '@/lib/formatDate';

const STACK_KEYS = ['completed', 'failed'];

const SERIES = [
  { key: 'completed', label: 'Completed', color: CHART_COLORS.primary },
  { key: 'failed', label: 'Failed', color: CHART_COLORS.critical },
];

const TABLE_COLUMNS = [
  { key: 'date', label: 'Date', format: formatLongDate },
  { key: 'completed', label: 'Completed', numeric: true },
  { key: 'failed', label: 'Failed', numeric: true },
  { key: 'images', label: 'Images', numeric: true },
];

export function GenerationsChart({ daily, className }) {
  return (
    <ChartCard
      title="Generations"
      description="Completed and failed generations per day."
      legend={SERIES.map((item) => ({ ...item, shape: 'bar' }))}
      table={{ columns: TABLE_COLUMNS, rows: daily }}
      className={className}
    >
      <div className="h-64">
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
            {SERIES.map((item) => (
              <Bar
                key={item.key}
                dataKey={item.key}
                stackId="generations"
                fill={item.color}
                maxBarSize={24}
                isAnimationActive={false}
                shape={createStackedBarShape({
                  dataKey: item.key,
                  stackKeys: STACK_KEYS,
                  fill: item.color,
                })}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
