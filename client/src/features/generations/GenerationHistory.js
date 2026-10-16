'use client';

import { ImageOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { describeFailure } from '@/features/generations/generationLabels';
import { useGetMyGenerationsQuery } from '@/features/generations/generationsApi';
import { cn } from '@/lib/utils';

const STATUS_BADGES = {
  succeeded: { label: 'Completed', tone: 'success' },
  failed: { label: 'Failed', tone: 'danger' },
  processing: { label: 'Processing', tone: 'warning' },
};

function formatDate(value) {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function GenerationHistory({ selectedId, onSelect }) {
  const { data, isLoading } = useGetMyGenerationsQuery({ page: 1, limit: 10 });
  const generations = data?.generations ?? [];

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-[16px] font-semibold">Recent generations</h2>

      {isLoading ? <Skeleton className="h-32 w-full" /> : null}

      {!isLoading && generations.length === 0 ? (
        <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
          Nothing generated yet.
        </p>
      ) : null}

      {generations.map((generation) => {
        const badge = STATUS_BADGES[generation.status];
        const cover = generation.images[0];
        const canOpen = generation.images.length > 0;

        return (
          <button
            key={generation.id}
            type="button"
            disabled={!canOpen}
            onClick={() => onSelect(generation)}
            className={cn(
              'flex items-center gap-3 rounded-xl border bg-card p-2.5 text-left transition-colors enabled:hover:bg-accent',
              selectedId === generation.id && 'border-brand/50',
            )}
          >
            <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted text-ink-3">
              {cover ? (
                <img
                  src={cover.url}
                  alt=""
                  loading="lazy"
                  className="size-full object-cover"
                />
              ) : (
                <ImageOff className="size-5" />
              )}
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="truncate text-sm font-medium">
                {generation.prompt}
              </span>
              <span className="truncate text-xs text-ink-3">
                {generation.status === 'failed'
                  ? `${describeFailure(generation.errorCategory)} · ${generation.totalCredits} cr refunded`
                  : `${generation.model.name} · ${generation.images.length} ${generation.images.length === 1 ? 'image' : 'images'} · ${generation.totalCredits} cr`}
              </span>
              <span className="text-xs text-ink-3">
                {formatDate(generation.createdAt)}
              </span>
            </span>
            <Badge tone={badge.tone}>{badge.label}</Badge>
          </button>
        );
      })}
    </div>
  );
}
