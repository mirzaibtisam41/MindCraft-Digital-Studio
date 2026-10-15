import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { cn } from '@/lib/utils';

function formatDate(value) {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function CreditTransactionsTable({
  transactions,
  meta,
  isLoading,
  isFetching,
  onPageChange,
}) {
  if (isLoading) return <Skeleton className="h-40 w-full" />;

  if (!transactions) return null;

  if (transactions.length === 0) {
    return (
      <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
        No credit changes yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
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
            {transactions.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="text-muted-foreground">
                  {formatDate(entry.createdAt)}
                </TableCell>
                <TableCell>
                  <p>
                    {CREDIT_TRANSACTION_TYPE_LABELS[entry.type] ?? entry.type}
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

      {meta && meta.totalPages > 1 ? (
        <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
          <Button
            variant="outline"
            size="sm"
            disabled={meta.page <= 1 || isFetching}
            onClick={() => onPageChange(meta.page - 1)}
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
            disabled={meta.page >= meta.totalPages || isFetching}
            onClick={() => onPageChange(meta.page + 1)}
          >
            Next
            <ChevronRight />
          </Button>
        </div>
      ) : null}
    </div>
  );
}
