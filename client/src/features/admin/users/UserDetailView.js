'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/DataState';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetAdminUserQuery } from '@/features/admin/adminApi';
import { AdjustCreditsForm } from '@/features/admin/users/AdjustCreditsForm';
import { CreditTransactionsTable } from '@/features/admin/users/CreditTransactionsTable';
import { UserAccountActions } from '@/features/admin/users/UserAccountActions';
import { RoleBadge, StatusBadge } from '@/features/admin/users/UserBadges';
import { useGetProfileQuery } from '@/features/auth/authApi';
import { formatDateTime } from '@/lib/formatDate';

function Stat({ label, value }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border bg-card p-4">
      <p className="text-[10.5px] font-semibold tracking-wider text-ink-3 uppercase">
        {label}
      </p>
      <p className="font-mono text-2xl font-semibold">{value}</p>
    </div>
  );
}

export function UserDetailView({ id }) {
  const { data: user, isLoading, error, refetch } = useGetAdminUserQuery(id);
  const { data: me } = useGetProfileQuery();

  return (
    <div className="flex flex-col gap-6">
      <Button asChild variant="ghost" size="sm" className="self-start">
        <Link href="/admin/users">
          <ArrowLeft />
          All users
        </Link>
      </Button>

      {error ? <ErrorState error={error} onRetry={refetch} /> : null}

      {isLoading ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-16 w-80" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : null}

      {user ? (
        <>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <h1 className="text-[22px] font-semibold tracking-tight">
                {user.name}
              </h1>
              <p className="text-muted-foreground">{user.email}</p>
              <p className="font-mono text-xs text-ink-3">
                Joined {formatDateTime(user.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <RoleBadge role={user.role} />
              <StatusBadge suspendedAt={user.suspendedAt} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Stat label="Credit balance" value={user.creditBalance} />
            <Stat label="Generations" value={user.generationsCount} />
            <Stat
              label="Failed generations"
              value={user.failedGenerationsCount}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <UserAccountActions user={user} isSelf={me?.id === user.id} />
            <AdjustCreditsForm user={user} />
          </div>

          <div className="flex justify-end">
            <Button asChild variant="secondary" size="sm">
              <Link href={`/admin/generations?userId=${user.id}`}>
                View this user&apos;s generations
              </Link>
            </Button>
          </div>

          <CreditTransactionsTable userId={user.id} />
        </>
      ) : null}
    </div>
  );
}
