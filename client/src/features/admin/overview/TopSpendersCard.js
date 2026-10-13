import Link from 'next/link';
import { ChartCard } from '@/components/charts/ChartCard';
import { formatNumber } from '@/lib/formatNumber';

export function TopSpendersCard({ spenders, className }) {
  return (
    <ChartCard
      title="Top users"
      description="Most credits spent in this period."
      className={className}
    >
      {spenders.length === 0 ? (
        <p className="py-8 text-center text-[12.5px] text-muted-foreground">
          No credits spent in this period.
        </p>
      ) : (
        <ol className="flex flex-col gap-3">
          {spenders.map((spender, index) => (
            <li key={spender.userId}>
              <Link
                href={`/admin/users/${spender.userId}`}
                className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-accent/40"
              >
                <span className="w-4 font-mono text-[12px] text-ink-3">
                  {index + 1}
                </span>
                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="truncate text-[13px] font-medium">
                    {spender.name}
                  </p>
                  <p className="truncate text-[11.5px] text-ink-3">
                    {spender.email}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <p className="font-mono text-[13px] tabular-nums">
                    {formatNumber(spender.creditsSpent)} cr
                  </p>
                  <p className="text-[11.5px] text-ink-3">
                    {formatNumber(spender.generations)} generations
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </ChartCard>
  );
}
