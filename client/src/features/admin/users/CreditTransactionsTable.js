'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
  EmptyState,
  ErrorState,
  TableSkeleton,
} from '@/components/ui/DataState';
import { Pagination } from '@/components/ui/Pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CREDIT_TYPE_LABELS, PAGE_SIZE } from '@/constants/admin';
import { useGetAdminUserTransactionsQuery } from '@/features/admin/adminApi';
import { formatDateTime } from '@/lib/formatDate';

export function CreditTransactionsTable({ userId }) {
  const [page, setPage] = useState(1);
  const { data, isLoading, error, refetch } = useGetAdminUserTransactionsQuery({
    id: userId,
    page,
    pageSize: PAGE_SIZE,
  });

  return (
    <section className="rounded-xl border bg-card">
      <div className="border-b px-5 py-4">
        <h2 className="text-[15px] font-semibold">Credit activity</h2>
      </div>
      {isLoading ? <TableSkeleton rows={4} /> : null}
      {error ? <ErrorState error={error} onRetry={refetch} /> : null}
      {data && data.items.length === 0 ? (
        <EmptyState title="No credit activity yet" />
      ) : null}
      {data && data.items.length > 0 ? (
        <>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Note</TableHead>
                <TableHead className="text-right">Credits</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatDateTime(transaction.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Badge>
                      {CREDIT_TYPE_LABELS[transaction.type] ?? transaction.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">
                    {transaction.generationId ? (
                      <Link
                        href={`/admin/generations/${transaction.generationId}`}
                        className="hover:underline"
                      >
                        View generation
                      </Link>
                    ) : (
                      (transaction.note ?? '—')
                    )}
                  </TableCell>
                  <TableCell
                    className={`text-right font-mono ${
                      transaction.amount > 0 ? 'text-success' : ''
                    }`}
                  >
                    {transaction.amount > 0 ? '+' : ''}
                    {transaction.amount}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination meta={data.meta} onPageChange={setPage} />
        </>
      ) : null}
    </section>
  );
}
