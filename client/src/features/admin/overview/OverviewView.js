'use client';

import { useState } from 'react';
import Link from 'next/link';
import { RefreshCw, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/DataState';
import { PageHeader } from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  OVERVIEW_RANGE_DEFAULT,
  OVERVIEW_RANGE_OPTIONS,
} from '@/constants/admin';
import { useGetAdminOverviewQuery } from '@/features/admin/adminApi';
import { formatDate } from '@/lib/formatDate';
import {
  formatDuration,
  formatNumber,
  formatPercent,
} from '@/lib/formatNumber';
import { cn } from '@/lib/utils';
import { CreditsChart } from './CreditsChart';
import { GenerationsChart } from './GenerationsChart';
import { KpiCard } from './KpiCard';
import { humanizeKey, pairSuccessRate } from './overviewMath';
import { PlatformCard } from './PlatformCard';
import { RankedBarsCard } from './RankedBarsCard';
import { RecentActivityCard } from './RecentActivityCard';
import { RecentGenerationsCard } from './RecentGenerationsCard';
import { SignupsChart } from './SignupsChart';
import { TopSpendersCard } from './TopSpendersCard';

const BROWSER_TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

function RangeToggle({ value, onChange }) {
  return (
    <ToggleGroup
      type="single"
      variant="outline"
      size="sm"
      value={value}
      onValueChange={(next) => next && onChange(next)}
      aria-label="Date range"
    >
      {OVERVIEW_RANGE_OPTIONS.map((option) => (
        <ToggleGroupItem key={option.value} value={option.value}>
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

function OverviewSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-44 w-full" />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-28 w-full" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <Skeleton className="h-80 w-full xl:col-span-2" />
        <Skeleton className="h-80 w-full" />
      </div>
    </div>
  );
}

function SetupAlerts({ totals }) {
  if (totals.enabledModelsCount > 0) return null;

  return (
    <div
      role="alert"
      className="flex flex-wrap items-center gap-3 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-[13px]"
    >
      <TriangleAlert className="size-4 shrink-0 text-warning" />
      <p className="flex-1">
        <span className="font-medium">No image model is enabled.</span>{' '}
        <span className="text-muted-foreground">
          Users cannot generate images until you add or enable one.
        </span>
      </p>
      <Button asChild size="sm" variant="outline">
        <Link href="/admin/models">Manage models</Link>
      </Button>
    </div>
  );
}

function OverviewContent({ data }) {
  const { kpis, totals, daily, range } = data;
  const comparisonLabel = `vs previous ${range.days} days`;
  const successRate = pairSuccessRate(kpis);
  const trend = (key) => daily.map((day) => day[key]);

  return (
    <div className="flex flex-col gap-4">
      <SetupAlerts totals={totals} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="New users"
          value={formatNumber(kpis.newUsers.current)}
          pair={kpis.newUsers}
          comparisonLabel={comparisonLabel}
          trend={trend('newUsers')}
          hint={`${formatNumber(totals.usersCount)} total · ${formatNumber(totals.suspendedUsersCount)} suspended`}
          href="/admin/users"
        />
        <KpiCard
          label="Generations"
          value={formatNumber(kpis.generations.current)}
          pair={kpis.generations}
          comparisonLabel={comparisonLabel}
          trend={daily.map((day) => day.completed + day.failed + day.other)}
          hint={`${formatNumber(totals.generationsCount)} all time`}
          href="/admin/generations"
        />
        <KpiCard
          label="Images created"
          value={formatNumber(kpis.images.current)}
          pair={kpis.images}
          comparisonLabel={comparisonLabel}
          trend={trend('images')}
          hint={`${formatNumber(totals.imagesCount)} stored in total`}
        />
        <KpiCard
          label="Credits spent"
          value={formatNumber(kpis.creditsSpent.current)}
          pair={kpis.creditsSpent}
          comparisonLabel={comparisonLabel}
          trend={trend('creditsSpent')}
          hint={`${formatNumber(totals.creditsInCirculation)} in user balances`}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Success rate"
          value={formatPercent(successRate.current)}
          pair={successRate}
          comparisonLabel={comparisonLabel}
          hint={`${formatNumber(kpis.failed.current)} failed in this period`}
        />
        <KpiCard
          label="Active users"
          value={formatNumber(kpis.activeUsers.current)}
          pair={kpis.activeUsers}
          comparisonLabel={comparisonLabel}
          hint="Users who generated at least once"
        />
        <KpiCard
          label="Avg generation time"
          value={formatDuration(kpis.avgDurationMs.current)}
          pair={kpis.avgDurationMs}
          upIsGood={false}
          comparisonLabel={comparisonLabel}
          hint="Completed generations only"
        />
        <KpiCard
          label="Credits issued"
          value={formatNumber(kpis.creditsIssued.current)}
          pair={kpis.creditsIssued}
          comparisonLabel={comparisonLabel}
          hint="Signup grants and admin top-ups"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <GenerationsChart daily={daily} className="xl:col-span-2" />
        <RankedBarsCard
          title="Usage by model"
          description="Generations per image model."
          emptyText="No generations in this period."
          rows={data.modelUsage.map((item) => ({
            key: item.model,
            label: item.label,
            value: item.generations,
            detail: `${formatNumber(item.images)} images · ${formatNumber(item.creditsSpent)} cr · ${formatNumber(item.failed)} failed`,
          }))}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <CreditsChart daily={daily} className="xl:col-span-2" />
        <TopSpendersCard spenders={data.topSpenders} />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <SignupsChart daily={daily} className="xl:col-span-2" />
        <RankedBarsCard
          title="Failure reasons"
          description="Why generations failed."
          emptyText="No failed generations in this period."
          barClassName="bg-chart-critical"
          rows={data.failureReasons.map((item) => ({
            key: item.category,
            label: humanizeKey(item.category),
            value: item.count,
          }))}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <RecentGenerationsCard generations={data.recentGenerations} />
        <RecentActivityCard entries={data.recentAuditLogs} />
        <PlatformCard platform={data.platform} totals={totals} />
      </div>
    </div>
  );
}

export function OverviewView() {
  const [range, setRange] = useState(OVERVIEW_RANGE_DEFAULT);
  const { data, isLoading, isFetching, error, refetch } =
    useGetAdminOverviewQuery({ range, timezone: BROWSER_TIMEZONE });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Overview"
        description={
          data
            ? `Activity from ${formatDate(data.range.from)} to today (${data.range.timezone}).`
            : 'Users, generations, credits and platform health.'
        }
        actions={
          <div className="flex items-center gap-2">
            <RangeToggle value={range} onChange={setRange} />
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={refetch}
              disabled={isFetching}
              aria-label="Refresh"
            >
              <RefreshCw
                className={cn('size-3.5', isFetching && 'animate-spin')}
              />
            </Button>
          </div>
        }
      />

      {error ? <ErrorState error={error} onRetry={refetch} /> : null}
      {isLoading ? <OverviewSkeleton /> : null}
      {data ? (
        <div
          className={cn('transition-opacity', isFetching && 'opacity-60')}
          aria-busy={isFetching}
        >
          <OverviewContent data={data} />
        </div>
      ) : null}
    </div>
  );
}
