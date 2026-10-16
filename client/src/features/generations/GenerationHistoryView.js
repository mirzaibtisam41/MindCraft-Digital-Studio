'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  History,
  ImageOff,
  Search,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/FormAlert';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { GenerationDetailsDialog } from '@/features/generations/GenerationDetailsDialog';
import {
  STATUS_BADGES,
  buildReuseUrl,
  describeFailure,
} from '@/features/generations/generationLabels';
import {
  useGetGenerationOptionsQuery,
  useGetMyGenerationsQuery,
} from '@/features/generations/generationsApi';
import { getErrorMessage } from '@/lib/apiError';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 20;
const ALL = 'all';

const STATUS_CHIPS = [
  { value: ALL, label: 'All', countKey: 'all' },
  { value: 'succeeded', label: 'Completed', countKey: 'succeeded' },
  { value: 'failed', label: 'Failed', countKey: 'failed' },
  { value: 'processing', label: 'Processing', countKey: 'processing' },
];

function formatDate(value) {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function GenerationHistoryView() {
  const [searchText, setSearchText] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(ALL);
  const [modelId, setModelId] = useState(ALL);
  const [page, setPage] = useState(1);
  const [openGenerationId, setOpenGenerationId] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchText.trim());
      setPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchText]);

  const { data: models = [] } = useGetGenerationOptionsQuery();
  const { data, isLoading, isFetching, error } = useGetMyGenerationsQuery({
    page,
    limit: PAGE_SIZE,
    ...(search ? { search } : {}),
    ...(status !== ALL ? { status } : {}),
    ...(modelId !== ALL ? { modelId } : {}),
  });

  const generations = data?.generations ?? [];
  const meta = data?.meta;
  const openGeneration =
    generations.find((item) => item.id === openGenerationId) ?? null;
  const firstRow =
    meta && meta.total > 0 ? (meta.page - 1) * meta.limit + 1 : 0;
  const lastRow = meta ? Math.min(meta.page * meta.limit, meta.total) : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-[22px] font-semibold tracking-tight">
          Generation History
        </h1>
        <p className="text-muted-foreground">
          Every image request you made, with its cost and result.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-3" />
            <Input
              placeholder="Search prompts"
              className="h-9 pl-9"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              aria-label="Search generations"
            />
          </div>
          <Select
            value={modelId}
            onValueChange={(value) => {
              setModelId(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-9 sm:w-48" aria-label="Model">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All models</SelectItem>
              {models.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  {model.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUS_CHIPS.map((chip) => (
            <button
              key={chip.value}
              type="button"
              aria-pressed={status === chip.value}
              onClick={() => {
                setStatus(chip.value);
                setPage(1);
              }}
              className={cn(
                'flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors hover:bg-accent',
                status === chip.value &&
                  'border-brand/60 bg-brand-tint text-brand',
              )}
            >
              {chip.label}
              <span className="text-xs text-ink-3">
                {meta?.statusCounts?.[chip.countKey] ?? 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      {error ? <FormAlert>{getErrorMessage(error)}</FormAlert> : null}

      {isLoading ? <Skeleton className="h-64 w-full" /> : null}

      {!isLoading && !error && generations.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-10 text-center">
          <span className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <History className="size-5" />
          </span>
          <p className="font-medium">No generations found</p>
          <Button asChild variant="outline">
            <Link href="/app/generate">Open the Image Generator</Link>
          </Button>
        </div>
      ) : null}

      {generations.length > 0 ? (
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Image</TableHead>
                <TableHead>Prompt</TableHead>
                <TableHead className="hidden md:table-cell">Model</TableHead>
                <TableHead className="hidden lg:table-cell">Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Credits</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {generations.map((generation) => {
                const badge = STATUS_BADGES[generation.status];
                const cover = generation.images[0];
                const isFailed = generation.status === 'failed';

                return (
                  <TableRow key={generation.id}>
                    <TableCell>
                      <span className="flex size-11 items-center justify-center overflow-hidden rounded-md bg-muted text-ink-3">
                        {cover ? (
                          <img
                            src={cover.thumbnailUrl}
                            alt=""
                            loading="lazy"
                            className="size-full object-cover"
                          />
                        ) : (
                          <ImageOff className="size-4" />
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-72">
                      <p className="truncate font-medium">
                        {generation.prompt}
                      </p>
                      {isFailed ? (
                        <p className="truncate text-xs text-danger">
                          {describeFailure(generation.errorCategory)}
                        </p>
                      ) : null}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {generation.model.name}
                    </TableCell>
                    <TableCell className="hidden font-mono text-xs text-muted-foreground lg:table-cell">
                      {formatDate(generation.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Badge tone={badge.tone}>{badge.label}</Badge>
                    </TableCell>
                    <TableCell
                      className={cn(
                        'text-right font-mono',
                        isFailed ? 'text-success' : 'text-muted-foreground',
                      )}
                    >
                      {isFailed
                        ? `+${generation.totalCredits}`
                        : `-${generation.totalCredits}`}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={buildReuseUrl(generation)}>Reuse</Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setOpenGenerationId(generation.id)}
                        >
                          View
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : null}

      {meta && meta.total > 0 ? (
        <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
          <span>
            Showing {firstRow}–{lastRow} of {meta.total}
          </span>
          {meta.totalPages > 1 ? (
            <div className="flex items-center gap-2">
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
      ) : null}

      <GenerationDetailsDialog
        generation={openGeneration}
        onOpenChange={(open) => {
          if (!open) setOpenGenerationId(null);
        }}
      />
    </div>
  );
}
