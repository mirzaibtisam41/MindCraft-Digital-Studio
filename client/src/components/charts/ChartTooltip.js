import { formatNumber } from '@/lib/formatNumber';

export function ChartTooltip({ active, payload, label, series, formatLabel }) {
  if (!active || !payload?.length) return null;

  const values = payload[0].payload;

  return (
    <div className="min-w-40 rounded-lg border bg-popover px-3 py-2 text-[12px] shadow-lg">
      <p className="mb-1.5 text-muted-foreground">
        {formatLabel ? formatLabel(label) : label}
      </p>
      <ul className="flex flex-col gap-1">
        {series.map((item) => (
          <li key={item.key} className="flex items-center gap-2">
            <span
              className="h-0.5 w-3 rounded-full"
              style={{ backgroundColor: item.color }}
              aria-hidden
            />
            <span className="font-mono font-semibold tabular-nums">
              {(item.format ?? formatNumber)(values[item.key])}
            </span>
            <span className="text-muted-foreground">{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
