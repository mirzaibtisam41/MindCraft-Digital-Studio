'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/DataState';
import { Skeleton } from '@/components/ui/skeleton';
import { CREDIT_TYPE_LABELS } from '@/constants/admin';
import { useGetAdminGenerationQuery } from '@/features/admin/adminApi';
import { GenerationStatusBadge } from '@/features/admin/generations/GenerationStatusBadge';
import { SettingsCard } from '@/features/settings/SettingsCard';
import { formatDateTime } from '@/lib/formatDate';

function Detail({ label, children }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-[10.5px] font-semibold tracking-wider text-ink-3 uppercase">
        {label}
      </dt>
      <dd className="text-[13.5px] break-words">{children}</dd>
    </div>
  );
}

export function GenerationDetailView({ id }) {
  const {
    data: generation,
    isLoading,
    error,
    refetch,
  } = useGetAdminGenerationQuery(id);

  return (
    <div className="flex flex-col gap-6">
      <Button asChild variant="ghost" size="sm" className="self-start">
        <Link href="/admin/generations">
          <ArrowLeft />
          All generations
        </Link>
      </Button>

      {error ? <ErrorState error={error} onRetry={refetch} /> : null}
      {isLoading ? <Skeleton className="h-96 w-full" /> : null}

      {generation ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-[22px] font-semibold tracking-tight">
              Generation
            </h1>
            <GenerationStatusBadge status={generation.status} />
          </div>

          <SettingsCard title="Request">
            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Detail label="User">
                <Link
                  href={`/admin/users/${generation.userId}`}
                  className="hover:underline"
                >
                  {generation.userName} · {generation.userEmail}
                </Link>
              </Detail>
              <Detail label="Model">
                <span className="font-mono text-xs">
                  {generation.provider} / {generation.model}
                </span>
              </Detail>
              <Detail label="Images">{generation.imageCount}</Detail>
              <Detail label="Created">
                {formatDateTime(generation.createdAt)}
              </Detail>
              <Detail label="Started">
                {generation.startedAt
                  ? formatDateTime(generation.startedAt)
                  : '—'}
              </Detail>
              <Detail label="Completed">
                {generation.completedAt
                  ? formatDateTime(generation.completedAt)
                  : '—'}
              </Detail>
            </dl>
            <Detail label="Prompt">
              <p className="rounded-lg border bg-background/50 p-3 whitespace-pre-wrap">
                {generation.prompt}
              </p>
            </Detail>
            <Detail label="Settings">
              <pre className="overflow-x-auto rounded-lg border bg-background/50 p-3 font-mono text-xs">
                {JSON.stringify(generation.settings, null, 2)}
              </pre>
            </Detail>
            {generation.errorCategory ? (
              <Detail label="Error">
                <span className="text-danger">
                  {generation.errorCategory} · {generation.errorMessage}
                </span>
              </Detail>
            ) : null}
          </SettingsCard>

          <SettingsCard
            title="Credits"
            description="Credits held for this generation and any refund."
          >
            {generation.creditTransactions.length === 0 ? (
              <p className="text-[13px] text-muted-foreground">
                No credit activity recorded.
              </p>
            ) : (
              <ul className="flex flex-col divide-y">
                {generation.creditTransactions.map((transaction) => (
                  <li
                    key={transaction.id}
                    className="flex items-center justify-between gap-3 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <Badge>
                        {CREDIT_TYPE_LABELS[transaction.type] ??
                          transaction.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(transaction.createdAt)}
                      </span>
                    </div>
                    <span
                      className={`font-mono ${
                        transaction.amount > 0 ? 'text-success' : ''
                      }`}
                    >
                      {transaction.amount > 0 ? '+' : ''}
                      {transaction.amount}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </SettingsCard>
        </>
      ) : null}
    </div>
  );
}
