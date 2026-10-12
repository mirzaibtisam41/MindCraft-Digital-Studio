'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetProfileQuery } from '@/features/auth/authApi';
import { formatDate } from '@/lib/formatDate';
import { getInitials } from '@/lib/getInitials';

export function AccountCard() {
  const { data: user } = useGetProfileQuery();

  return (
    <section
      aria-labelledby="account-heading"
      className="flex flex-col gap-4 rounded-xl border bg-card p-5"
    >
      <h2
        id="account-heading"
        className="text-[10.5px] font-semibold tracking-wider text-ink-3 uppercase"
      >
        Your account
      </h2>
      {user ? (
        <div className="flex items-center gap-3">
          <Avatar className="size-11">
            <AvatarFallback className="bg-brand-tint font-semibold text-brand">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold">{user.name}</p>
            <p className="truncate text-muted-foreground">{user.email}</p>
            <p className="font-mono text-xs text-ink-3">
              Member since {formatDate(user.createdAt)}
            </p>
            <p className="font-mono text-xs text-ink-3">
              {user.creditBalance} credits
            </p>
          </div>
        </div>
      ) : (
        <Skeleton className="h-12 w-full" />
      )}
      <Button asChild variant="secondary" className="self-start">
        <Link href="/app/settings">
          Manage settings
          <ArrowRight />
        </Link>
      </Button>
    </section>
  );
}
