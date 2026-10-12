'use client';

import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/DataState';
import { PageHeader } from '@/components/ui/PageHeader';
import { useGetAdminOverviewQuery } from '@/features/admin/adminApi';

function StatCard({ label, value, hint, href }) {
  const content = (
    <div className="flex h-full flex-col gap-1 rounded-xl border bg-card p-5 transition-colors hover:bg-accent/30">
      <p className="text-[10.5px] font-semibold tracking-wider text-ink-3 uppercase">
        {label}
      </p>
      <p className="font-mono text-[28px] leading-tight font-semibold">
        {value}
      </p>
      <p className="text-[12.5px] text-muted-foreground">{hint}</p>
    </div>
  );

  return href ? (
    <Link href={href} className="block h-full">
      {content}
    </Link>
  ) : (
    content
  );
}

export function OverviewView() {
  const { data, isLoading, error, refetch } = useGetAdminOverviewQuery();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Overview"
        description="A snapshot of users, generations, credits and models."
      />

      {error ? <ErrorState error={error} onRetry={refetch} /> : null}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-32 w-full" />
          ))}
        </div>
      ) : null}

      {data ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Users"
            value={data.usersCount}
            hint={`${data.suspendedUsersCount} suspended`}
            href="/admin/users"
          />
          <StatCard
            label="Generations"
            value={data.generationsCount}
            hint={`${data.generationsLast24h} in the last 24h · ${data.failedGenerationsCount} failed`}
            href="/admin/generations"
          />
          <StatCard
            label="Credits in circulation"
            value={data.creditsInCirculation}
            hint="Sum of all user balances"
          />
          <StatCard
            label="Image models"
            value={`${data.enabledModelsCount} / ${data.modelsCount}`}
            hint="Enabled models"
            href="/admin/models"
          />
        </div>
      ) : null}
    </div>
  );
}
