'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FormAlert } from '@/components/ui/FormAlert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CREDIT_TRANSACTION_TYPE_LABELS } from '@/features/credits/creditTransactionTypes';
import { useGetMyWalletQuery } from '@/features/credits/walletApi';
import { getErrorMessage } from '@/lib/apiError';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 10;

function formatDate(value) {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function CreditsView() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, error } = useGetMyWalletQuery({
    page,
    limit: PAGE_SIZE,
  });
  const meta = data?.meta;

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

        {isLoading ? <Skeleton className="h-40 w-full" /> : null}

        {data && data.transactions.length === 0 ? (
          <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            No credit changes yet.
          </p>
        ) : null}

        {data?.transactions.length ? (
          <div className="rounded-xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead className="text-right">Credits</TableHead>
                  <TableHead className="hidden text-right sm:table-cell">
                    Balance
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.transactions.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="text-muted-foreground">
                      {formatDate(entry.createdAt)}
                    </TableCell>
                    <TableCell>
                      <p>
                        {CREDIT_TRANSACTION_TYPE_LABELS[entry.type] ??
                          entry.type}
                      </p>
                      {entry.reason ? (
                        <p className="text-xs text-ink-3">{entry.reason}</p>
                      ) : null}
                    </TableCell>
                    <TableCell
                      className={cn(
                        'text-right font-mono font-medium',
                        entry.amount > 0 ? 'text-success' : 'text-danger',
                      )}
                    >
                      {entry.amount > 0 ? '+' : ''}
                      {entry.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="hidden text-right font-mono text-muted-foreground sm:table-cell">
                      {entry.balanceAfter.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : null}

        {meta && meta.totalPages > 1 ? (
          <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isFetching}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft />
              Previous
            </Button>
            <span>
              Page {meta.page} of {meta.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= meta.totalPages || isFetching}
              onClick={() => setPage(page + 1)}
            >
              Next
              <ChevronRight />
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
