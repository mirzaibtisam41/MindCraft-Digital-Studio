import { TrendingDown, TrendingUp } from 'lucide-react';
import { FEATURE_LABELS, percentChange } from '@/features/usage/usageLabels';
import { cn } from '@/lib/utils';

export function ChangeBadge({ current, previous }) {
  const change = percentChange(current, previous);

  if (change === null) {
    return <span className="text-xs text-ink-3">no data last month</span>;
  }

  const Icon = change >= 0 ? TrendingUp : TrendingDown;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        change >= 0 ? 'bg-brand-tint text-brand' : 'bg-muted text-ink-3',
      )}
    >
      <Icon className="size-3" />
      {change >= 0 ? '+' : ''}
      {change}% vs last month
    </span>
  );
}

export function DailyBarChart({ days, today, valueKey, unit }) {
  const highest = Math.max(1, ...days.map((day) => day[valueKey]));

  return (
    <div className="flex flex-col gap-2">
      <div
        className="flex h-36 items-end gap-[3px]"
        role="img"
        aria-label={`Daily ${unit} for the month`}
      >
        {days.map((day) => {
          const value = day[valueKey];

          return (
            <div
              key={day.date}
              title={`${day.date} · ${value} ${unit}`}
              className="flex h-full flex-1 items-end"
            >
              <div
                className={cn(
                  'w-full rounded-t-sm',
                  day.date === today
                    ? 'bg-brand'
                    : value
                      ? 'bg-brand/35'
                      : 'bg-muted',
                )}
                style={{ height: `${Math.max(4, (value / highest) * 100)}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between font-mono text-[11px] text-ink-3">
        <span>{days[0]?.date.slice(8)}</span>
        <span>{days[Math.floor(days.length / 2)]?.date.slice(8)}</span>
        <span>{days.at(-1)?.date.slice(8)}</span>
      </div>
    </div>
  );
}

export function CreditsDonut({ used, balance }) {
  const total = used + balance;
  const usedShare = total ? used / total : 0;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 100 100" className="size-28 shrink-0 -rotate-90">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeWidth="10"
          className="stroke-brand"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeWidth="10"
          strokeDasharray={`${usedShare * circumference} ${circumference}`}
          className="stroke-ink-3/30"
        />
      </svg>
      <div className="flex flex-col gap-1 text-sm">
        <span className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-brand" />
          {balance.toLocaleString()} left
        </span>
        <span className="flex items-center gap-2 text-muted-foreground">
          <span className="size-2 rounded-full bg-ink-3/50" />
          {used.toLocaleString()} used this month
        </span>
        <span className="text-xs text-ink-3">
          {total ? Math.round((balance / total) * 100) : 0}% remaining
        </span>
      </div>
    </div>
  );
}

export function FeatureBars({ features }) {
  const total = features.reduce((sum, feature) => sum + feature.credits, 0);

  return (
    <div className="flex flex-col gap-3">
      {features.map((feature) => {
        const share = total ? Math.round((feature.credits / total) * 100) : 0;

        return (
          <div key={feature.code} className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span>{FEATURE_LABELS[feature.code] ?? feature.code}</span>
              <span className="font-mono text-xs text-ink-3">
                {feature.credits} cr · {share}% · {feature.runs}{' '}
                {feature.runs === 1 ? 'run' : 'runs'}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-brand"
                style={{ width: `${share}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
