'use client';

import Link from 'next/link';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { CHART_COLORS } from '@/components/charts/chartAxes';
import { formatPercent } from '@/lib/formatNumber';
import { cn } from '@/lib/utils';
import { computeChange } from './overviewMath';

function ChangeBadge({ pair, upIsGood, comparisonLabel }) {
  const change = computeChange(pair);

  if (change.kind === 'none') {
    return <span className="text-ink-3">No data {comparisonLabel}</span>;
  }

  if (change.kind === 'flat') {
    return (
      <span className="inline-flex items-center gap-1 text-ink-3">
        <Minus className="size-3" aria-hidden />
        No change {comparisonLabel}
      </span>
    );
  }

  if (change.kind === 'new') {
    return <span className="text-ink-3">Nothing {comparisonLabel}</span>;
  }

  const isGood = (change.kind === 'up') === upIsGood;
  const Icon = change.kind === 'up' ? ArrowUpRight : ArrowDownRight;

  return (
    <span className="inline-flex items-center gap-1">
      <span
        className={cn(
          'inline-flex items-center gap-0.5 font-medium',
          isGood ? 'text-success' : 'text-danger',
        )}
      >
        <Icon className="size-3.5" aria-hidden />
        <span className="sr-only">{change.kind === 'up' ? 'Up' : 'Down'}</span>
        {formatPercent(change.ratio)}
      </span>
      <span className="text-ink-3">{comparisonLabel}</span>
    </span>
  );
}

function Sparkline({ values }) {
  const data = values.map((value, index) => ({ index, value }));

  return (
    <div className="h-9 w-full" aria-hidden>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 2, right: 0, bottom: 2, left: 0 }}
        >
          <Area
            type="monotone"
            dataKey="value"
            stroke={CHART_COLORS.primary}
            strokeWidth={1.5}
            fill={CHART_COLORS.primary}
            fillOpacity={0.1}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function KpiCard({
  label,
  value,
  pair,
  upIsGood = true,
  comparisonLabel,
  hint,
  trend,
  href,
}) {
  const content = (
    <div className="flex h-full flex-col gap-2 rounded-xl border bg-card p-5 transition-colors hover:bg-accent/30">
      <p className="text-[12.5px] font-medium text-muted-foreground">{label}</p>
      <p className="text-[28px] leading-none font-semibold tracking-tight">
        {value}
      </p>
      <div className="text-[12px]">
        {pair ? (
          <ChangeBadge
            pair={pair}
            upIsGood={upIsGood}
            comparisonLabel={comparisonLabel}
          />
        ) : null}
      </div>
      {trend ? <Sparkline values={trend} /> : null}
      {hint ? <p className="mt-auto text-[12px] text-ink-3">{hint}</p> : null}
    </div>
  );

  return href ? (
    <Link href={href} className="block h-full rounded-xl">
      {content}
    </Link>
  ) : (
    content
  );
}
