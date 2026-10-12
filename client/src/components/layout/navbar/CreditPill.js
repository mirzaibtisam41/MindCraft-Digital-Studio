'use client';

import Link from 'next/link';
import { Coins } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetProfileQuery } from '@/features/auth/authApi';

export function CreditPill() {
  const { data: user } = useGetProfileQuery();

  if (!user) return <Skeleton className="h-7 w-20 rounded-full" />;

  return (
    <Link
      href="/app/generate"
      aria-label={`${user.creditBalance} credits available`}
      className="flex h-7 items-center gap-1.5 rounded-full border bg-card px-2.5 text-[12.5px] font-medium outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <Coins className="size-3.5 text-brand" aria-hidden="true" />
      <span className="font-mono">{user.creditBalance}</span>
      <span className="hidden text-ink-3 sm:inline">credits</span>
    </Link>
  );
}
