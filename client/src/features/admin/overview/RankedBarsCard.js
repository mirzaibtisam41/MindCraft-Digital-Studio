import { ChartCard } from '@/components/charts/ChartCard';
import { formatNumber, formatPercent } from '@/lib/formatNumber';
import { cn } from '@/lib/utils';

export function RankedBarsCard({
  title,
  description,
  rows,
  emptyText,
  barClassName = 'bg-chart-1',
  className,
}) {
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  const max = Math.max(...rows.map((row) => row.value), 1);

  return (
    <ChartCard title={title} description={description} className={className}>
      {rows.length === 0 ? (
        <p className="py-8 text-center text-[12.5px] text-muted-foreground">
          {emptyText}
        </p>
      ) : (
        <ul className="flex flex-col gap-3.5">
          {rows.map((row) => (
            <li key={row.key} className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-3 text-[12.5px]">
                <span className="truncate font-medium">{row.label}</span>
                <span className="shrink-0 font-mono tabular-nums">
                  {formatNumber(row.value)}
                  <span className="ml-1.5 text-ink-3">
                    {formatPercent(row.value / total, 0)}
                  </span>
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted">
                <div
                  className={cn('h-full rounded-full', barClassName)}
                  style={{ width: `${(row.value / max) * 100}%` }}
                />
              </div>
              {row.detail ? (
                <p className="text-[11.5px] text-ink-3">{row.detail}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </ChartCard>
  );
}
