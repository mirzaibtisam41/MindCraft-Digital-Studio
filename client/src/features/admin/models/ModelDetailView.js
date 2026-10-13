'use client';

import Link from 'next/link';
import { BackLink } from '@/components/ui/BackLink';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/DataState';
import { Skeleton } from '@/components/ui/skeleton';
import { IMAGE_PROVIDER_OPTIONS } from '@/constants/admin';
import { useGetAdminModelQuery } from '@/features/admin/adminApi';
import { MakeDefaultButton } from '@/features/admin/models/MakeDefaultButton';
import { ModelBadges } from '@/features/admin/models/ModelBadges';
import { ModelEditor } from '@/features/admin/models/ModelEditor';
import { formatDateTime, formatRelativeTime } from '@/lib/formatDate';
import { formatNumber } from '@/lib/formatNumber';

const PROVIDER_LABELS = Object.fromEntries(
  IMAGE_PROVIDER_OPTIONS.map(({ value, label }) => [value, label]),
);

function Stat({ label, value, hint }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border bg-card p-4">
      <p className="text-[12.5px] font-medium text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold tracking-tight">{value}</p>
      {hint ? <p className="text-[12px] text-ink-3">{hint}</p> : null}
    </div>
  );
}

function UsageStats({ usage }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Stat
        label="Generations"
        value={formatNumber(usage.generations)}
        hint={`${formatNumber(usage.recentGenerations)} in the last ${usage.recentDays} days`}
      />
      <Stat
        label="Images created"
        value={formatNumber(usage.images)}
        hint={`${formatNumber(usage.users)} users`}
      />
      <Stat
        label="Credits spent"
        value={formatNumber(usage.creditsSpent)}
        hint="After refunds"
      />
      <Stat
        label="Failed"
        value={formatNumber(usage.failed)}
        hint={
          usage.lastUsedAt
            ? `Last used ${formatRelativeTime(usage.lastUsedAt)}`
            : 'Never used yet'
        }
      />
    </div>
  );
}

export function ModelDetailView({ id }) {
  const { data, isLoading, error, refetch } = useGetAdminModelQuery(id);
  const model = data?.model;

  return (
    <div className="flex flex-col gap-6">
      <BackLink href="/admin/models">All models</BackLink>

      {error ? <ErrorState error={error} onRetry={refetch} /> : null}

      {isLoading ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-16 w-80" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : null}

      {model ? (
        <>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-[22px] font-semibold tracking-tight">
                  {model.label}
                </h1>
                <ModelBadges model={model} showStatus />
              </div>
              {model.description ? (
                <p className="text-muted-foreground">{model.description}</p>
              ) : null}
              <p className="font-mono text-xs text-ink-3">
                {model.id} · {PROVIDER_LABELS[model.provider] ?? model.provider}{' '}
                · updated {formatDateTime(model.updatedAt)}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {model.isDefault ? null : <MakeDefaultButton model={model} />}
              <Button asChild variant="secondary" size="sm">
                <Link
                  href={`/admin/generations?model=${encodeURIComponent(model.id)}`}
                >
                  View generations
                </Link>
              </Button>
            </div>
          </div>

          <UsageStats usage={data.usage} />

          <ModelEditor
            key={`${model.id}-${model.updatedAt}`}
            model={model}
            editable={data.editable}
          />
        </>
      ) : null}
    </div>
  );
}
