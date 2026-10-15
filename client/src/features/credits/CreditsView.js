'use client';

import { useState } from 'react';
import { Coins } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { FormAlert } from '@/components/ui/FormAlert';
import { Skeleton } from '@/components/ui/skeleton';
import { CreditTransactionsTable } from '@/features/credits/CreditTransactionsTable';
import { useGetMyWalletQuery } from '@/features/credits/walletApi';
import { getErrorMessage } from '@/lib/apiError';

const PAGE_SIZE = 10;

export function CreditsView() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, error } = useGetMyWalletQuery({
    page,
    limit: PAGE_SIZE,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-[22px] font-semibold tracking-tight">
          Usage &amp; Credits
        </h1>
        <p className="text-muted-foreground">
          Your credit balance and every change to it.
        </p>
      </div>

      {error ? <FormAlert>{getErrorMessage(error)}</FormAlert> : null}

      <Card>
        <CardContent className="flex items-center gap-4">
          <span className="flex size-11 items-center justify-center rounded-xl bg-brand-tint text-brand">
            <Coins className="size-5" />
          </span>
          <div>
            <p className="text-sm text-ink-3">Available credits</p>
            {isLoading ? (
              <Skeleton className="mt-1 h-8 w-24" />
            ) : (
              <p className="font-mono text-[28px] leading-tight font-semibold">
                {data?.balance.toLocaleString() ?? 0}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        <h2 className="text-[16px] font-semibold">History</h2>
        <CreditTransactionsTable
          transactions={data?.transactions}
          meta={data?.meta}
          isLoading={isLoading}
          isFetching={isFetching}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
