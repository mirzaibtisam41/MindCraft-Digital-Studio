'use client';

import Link from 'next/link';
import { Coins } from 'lucide-react';
import { useGetMyWalletQuery } from '@/features/credits/walletApi';

export function CreditBalancePill() {
  const { data } = useGetMyWalletQuery();

  if (!data) return null;

  return (
    <Link
      href="/app/credits"
      className="flex items-center gap-1.5 rounded-full border bg-card px-2.5 py-1 text-[13px] font-medium hover:bg-accent"
      title="Your credits"
    >
      <Coins className="size-3.5 text-brand" />
      {data.balance.toLocaleString()}
      <span className="hidden text-ink-3 sm:inline">credits</span>
    </Link>
  );
}
