'use client';

import { useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
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
import { GENERATION_STATUS_OPTIONS, PAGE_SIZE } from '@/constants/admin';
import {
  useGetAdminGenerationsQuery,
  useGetAdminModelsQuery,
} from '@/features/admin/adminApi';
import { GenerationStatusBadge } from '@/features/admin/generations/GenerationStatusBadge';
import { formatDateTime } from '@/lib/formatDate';

export function GenerationsView({ initialUserId, initialModel }) {
  const [status, setStatus] = useState('');
  const [model, setModel] = useState(initialModel);
  const [userId, setUserId] = useState(initialUserId);
  const [page, setPage] = useState(1);
  const { data: modelsData } = useGetAdminModelsQuery();

  const { data, isFetching, isLoading, error, refetch } =
    useGetAdminGenerationsQuery({
      page,
      pageSize: PAGE_SIZE,
      status,
      model,
      userId,
    });

  const modelOptions = (modelsData?.models ?? []).map(({ id, label }) => ({
    value: id,
    label,
  }));

  function changeFilter(setter) {
    return (value) => {
      setter(value);
      setPage(1);
    };
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Generations"
        description="Every generation across all users, with status and errors."
      />

      <div className="flex flex-wrap items-center gap-3">
        <FilterSelect
          label="Filter by status"
          allLabel="All statuses"
          value={status}
          options={GENERATION_STATUS_OPTIONS}
          onChange={changeFilter(setStatus)}
          className="w-44"
        />
        <FilterSelect
          label="Filter by model"
          allLabel="All models"
          value={model}
          options={modelOptions}
          onChange={changeFilter(setModel)}
          className="w-52"
        />
        {userId ? (
          <button
            type="button"
            onClick={() => {
              setUserId('');
              setPage(1);
            }}
            className="inline-flex"
          >
            <Badge tone="brand" className="gap-1 py-0.5">
              Filtered by one user
              <X className="size-3" aria-label="Clear user filter" />
            </Badge>
          </button>
        ) : null}
      </div>

      <div className="rounded-xl border bg-card" aria-busy={isFetching}>
        {isLoading ? <TableSkeleton /> : null}
        {error ? <ErrorState error={error} onRetry={refetch} /> : null}
        {data && data.items.length === 0 ? (
          <EmptyState
            title="No generations found"
            description="Try clearing the filters."
          />
        ) : null}
        {data && data.items.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Created</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Prompt</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead className="text-right">Images</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((generation) => (
                  <TableRow key={generation.id}>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      <Link
                        href={`/admin/generations/${generation.id}`}
                        className="hover:underline"
                      >
                        {formatDateTime(generation.createdAt)}
                      </Link>
                    </TableCell>
                    <TableCell className="max-w-48 truncate">
                      {generation.userEmail}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">
                      {generation.prompt}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {generation.model}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {generation.imageCount}
                    </TableCell>
                    <TableCell>
                      <GenerationStatusBadge status={generation.status} />
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
