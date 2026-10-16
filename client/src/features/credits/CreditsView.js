'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FormAlert } from '@/components/ui/FormAlert';
import { Skeleton } from '@/components/ui/skeleton';
import { CreditTransactionsTable } from '@/features/credits/CreditTransactionsTable';
import { useGetMyWalletQuery } from '@/features/credits/walletApi';
import {
  ChangeBadge,
  DailyBarChart,
  FeatureBars,
} from '@/features/usage/UsageCharts';
import { useGetMyUsageQuery } from '@/features/usage/usageApi';
import { formatMonth, shiftMonth } from '@/features/usage/usageLabels';
import { getErrorMessage } from '@/lib/apiError';

const PAGE_SIZE = 10;

function StatCard({ label, value, children }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-1.5">
        <p className="text-sm text-ink-3">{label}</p>
        <p className="font-mono text-[26px] leading-tight font-semibold">
          {value}
        </p>
        {children}
      </CardContent>
    </Card>
  );
}

function Section({ title, children }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <h2 className="text-[15px] font-semibold">{title}</h2>
        {children}
      </CardContent>
    </Card>
  );
}

export function CreditsView() {
  const [page, setPage] = useState(1);
  const [month, setMonth] = useState(null);
  const wallet = useGetMyWalletQuery({ page, limit: PAGE_SIZE });
  const usageQuery = useGetMyUsageQuery({ month });
  const usage = usageQuery.data;
  const error = wallet.error ?? usageQuery.error;
  const isCurrentMonth = usage ? usage.month >= usage.today.slice(0, 7) : true;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-[22px] font-semibold tracking-tight">
            Usage &amp; Credits
          </h1>
          <p className="text-muted-foreground">
            Where your credits went, and every change to your balance.
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border bg-card p-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Previous month"
            disabled={!usage}
            onClick={() => setMonth(shiftMonth(usage.month, -1))}
          >
            <ChevronLeft />
          </Button>
          <span className="min-w-32 text-center text-sm font-medium">
            {usage ? formatMonth(usage.month) : '…'}
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Next month"
            disabled={!usage || isCurrentMonth}
            onClick={() => setMonth(shiftMonth(usage.month, 1))}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>

      {error ? <FormAlert>{getErrorMessage(error)}</FormAlert> : null}

      {usage ? (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            <StatCard label="Balance" value={usage.balance.toLocaleString()}>
              <span className="text-xs text-ink-3">available now</span>
            </StatCard>
            <StatCard
              label="Credits used"
              value={usage.creditsUsed.toLocaleString()}
            >
              <ChangeBadge
                current={usage.creditsUsed}
                previous={usage.previousCreditsUsed}
              />
            </StatCard>
            <StatCard
              label="Images created"
              value={usage.imagesGenerated.toLocaleString()}
            >
              <ChangeBadge
                current={usage.imagesGenerated}
                previous={usage.previousImagesGenerated}
              />
            </StatCard>
            <StatCard
              label="Avg credits / image"
              value={usage.averageCreditsPerImage ?? '—'}
            >
              <span className="text-xs text-ink-3">
                {usage.refunds
                  ? `${usage.creditsRefunded} cr refunded on ${usage.refunds} failed ${usage.refunds === 1 ? 'run' : 'runs'}`
                  : 'no refunds this month'}
              </span>
            </StatCard>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
            <Section title="Usage by feature">
              <FeatureBars features={usage.features} />
            </Section>
            <Section title="Daily credit use">
              <DailyBarChart
                days={usage.days}
                today={usage.today}
                valueKey="credits"
                unit="credits"
              />
            </Section>
          </div>
        </>
      ) : null}

      {usageQuery.isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          {[0, 1, 2, 3].map((index) => (
            <Skeleton key={index} className="h-28" />
          ))}
        </div>
      ) : null}

      <div className="flex flex-col gap-3">
        <h2 className="text-[16px] font-semibold">Credit history</h2>
        <CreditTransactionsTable
          transactions={wallet.data?.transactions}
          meta={wallet.data?.meta}
          isLoading={wallet.isLoading}
          isFetching={wallet.isFetching}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
