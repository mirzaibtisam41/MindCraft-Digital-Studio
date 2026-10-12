'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  EmptyState,
  ErrorState,
  TableSkeleton,
} from '@/components/ui/DataState';
import { FilterSelect } from '@/components/ui/FilterSelect';
import { PageHeader } from '@/components/ui/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AUDIT_ACTION_OPTIONS, PAGE_SIZE } from '@/constants/admin';
import { useGetAdminAuditLogsQuery } from '@/features/admin/adminApi';
import { describeChanges } from '@/features/admin/audit/describeChanges';
import { formatDateTime } from '@/lib/formatDate';

const ACTION_LABELS = Object.fromEntries(
  AUDIT_ACTION_OPTIONS.map(({ value, label }) => [value, label]),
);

export function AuditLogView() {
  const [action, setAction] = useState('');
  const [page, setPage] = useState(1);
  const { data, isFetching, isLoading, error, refetch } =
    useGetAdminAuditLogsQuery({ page, pageSize: PAGE_SIZE, action });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Audit log"
        description="A permanent record of every admin change to models, users, credits and settings."
      />

      <FilterSelect
        label="Filter by action"
        allLabel="All actions"
        value={action}
        options={AUDIT_ACTION_OPTIONS}
        onChange={(value) => {
          setAction(value);
          setPage(1);
        }}
        className="w-56"
      />

      <div className="rounded-xl border bg-card" aria-busy={isFetching}>
        {isLoading ? <TableSkeleton /> : null}
        {error ? <ErrorState error={error} onRetry={refetch} /> : null}
        {data && data.items.length === 0 ? (
          <EmptyState
            title="No audit entries yet"
            description="Changes made from the admin console will show up here."
          />
        ) : null}
        {data && data.items.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>When</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Changes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {formatDateTime(entry.createdAt)}
                    </TableCell>
                    <TableCell className="max-w-44 truncate">
                      {entry.actorEmail ?? 'Deleted user'}
                    </TableCell>
                    <TableCell>
                      <Badge tone="brand">
                        {ACTION_LABELS[entry.action] ?? entry.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-48 truncate font-mono text-xs text-muted-foreground">
                      {entry.targetType}:{entry.targetId}
                    </TableCell>
                    <TableCell className="max-w-md text-xs text-muted-foreground">
                      {describeChanges(entry.changes).map((line) => (
                        <span key={line} className="block truncate">
                          {line}
                        </span>
                      ))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination meta={data.meta} onPageChange={setPage} />
          </>
        ) : null}
      </div>
    </div>
  );
}
