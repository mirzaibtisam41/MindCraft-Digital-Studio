'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { ArrowLeft, Coins } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { FormAlert } from '@/components/ui/FormAlert';
import { Skeleton } from '@/components/ui/skeleton';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { CreditTransactionsTable } from '@/features/credits/CreditTransactionsTable';
import { AdjustCreditsForm } from '@/features/users/AdjustCreditsForm';
import { UserAccountActions } from '@/features/users/UserAccountActions';
import { findUserRole, findUserStatus } from '@/features/users/userOptions';
import {
  useGetUserQuery,
  useGetUserWalletQuery,
} from '@/features/users/usersApi';
import { getErrorMessage } from '@/lib/apiError';

const PAGE_SIZE = 10;

function formatDateTime(value) {
  if (!value) return 'Never';

  return new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function UserHeader({ user }) {
  const role = findUserRole(user.role);
  const status = findUserStatus(user.status);
  const details = [
    { label: 'Joined', value: formatDateTime(user.createdAt) },
    { label: 'Last login', value: formatDateTime(user.lastLoginAt) },
    { label: 'Active sessions', value: user.activeSessionCount },
    {
      label: 'Email verified',
      value: user.emailVerifiedAt ? formatDateTime(user.emailVerifiedAt) : 'No',
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="flex flex-wrap items-center gap-2 text-[22px] font-semibold tracking-tight">
          {user.name}
          <Badge tone={role.tone}>{role.label}</Badge>
          <Badge tone={status.tone}>{status.label}</Badge>
        </h1>
        <p className="text-muted-foreground">{user.email}</p>
      </div>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {details.map((detail) => (
          <div key={detail.label} className="rounded-xl border bg-card p-3">
            <dt className="text-xs text-ink-3">{detail.label}</dt>
            <dd className="mt-1 text-sm font-medium">{detail.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function UserDetailView({ userId }) {
  const [page, setPage] = useState(1);
  const currentUser = useSelector(selectCurrentUser);
  const user = useGetUserQuery(userId);
  const wallet = useGetUserWalletQuery({ userId, page, limit: PAGE_SIZE });
  const error = user.error ?? wallet.error;

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/admin/users"
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        All users
      </Link>

      {error ? <FormAlert>{getErrorMessage(error)}</FormAlert> : null}

      {user.isLoading ? <Skeleton className="h-36 w-full" /> : null}

      {user.data ? (
        <>
          <UserHeader user={user.data} />
          <UserAccountActions
            user={user.data}
            isCurrentUser={currentUser?.id === user.data.id}
          />
        </>
      ) : null}

      {user.data ? (
        <div className="flex flex-col gap-3">
          <h2 className="text-[16px] font-semibold">Credits</h2>

          <Card>
            <CardContent className="flex items-center gap-4">
              <span className="flex size-11 items-center justify-center rounded-xl bg-brand-tint text-brand">
                <Coins className="size-5" />
              </span>
              <div>
                <p className="text-sm text-ink-3">Available credits</p>
                {wallet.isLoading ? (
                  <Skeleton className="mt-1 h-8 w-24" />
                ) : (
                  <p className="font-mono text-[28px] leading-tight font-semibold">
                    {wallet.data?.balance.toLocaleString() ?? 0}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <AdjustCreditsForm userId={userId} />

          <CreditTransactionsTable
            transactions={wallet.data?.transactions}
            meta={wallet.data?.meta}
            isLoading={wallet.isLoading}
            isFetching={wallet.isFetching}
            onPageChange={setPage}
          />
        </div>
      ) : null}
    </div>
  );
}
