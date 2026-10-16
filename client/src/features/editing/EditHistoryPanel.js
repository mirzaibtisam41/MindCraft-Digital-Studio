'use client';

import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TYPE_LABELS } from '@/features/generations/generationLabels';
import { useGetImageHistoryQuery } from '@/features/images/imagesApi';
import { cn } from '@/lib/utils';

export function EditHistoryPanel({ imageId, onSelect }) {
  const { data: steps, isLoading } = useGetImageHistoryQuery(imageId);

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4">
      <div className="flex flex-col gap-1">
        <h2 className="font-medium">Edit history</h2>
        <p className="text-xs text-ink-3">
          Pick an earlier step to continue from it. Every step stays in My
          Creations.
        </p>
      </div>
      {isLoading ? <Skeleton className="h-24 w-full" /> : null}
      <ol className="flex flex-col gap-2">
        {(steps ?? []).map((step, index) => {
          const isCurrent = step.image.id === imageId;

          return (
            <li key={step.image.id}>
              <button
                type="button"
                onClick={() => onSelect(step.image.id)}
                disabled={isCurrent}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg border p-2 text-left transition-colors enabled:hover:bg-accent',
                  isCurrent && 'border-brand/60 bg-brand-tint/40',
                )}
              >
                <span className="w-5 text-center font-mono text-xs text-ink-3">
                  {index}
                </span>
                <img
                  src={step.image.thumbnailUrl}
                  alt=""
                  className="size-10 rounded-md object-cover"
                />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm">
                    {index === 0
                      ? 'Original'
                      : (step.generation?.prompt ?? 'Edit')}
                  </span>
                  <span className="text-xs text-ink-3">
                    {index === 0 || !step.generation
                      ? 'Starting image'
                      : `${TYPE_LABELS[step.generation.type] ?? 'Edit'} · ${step.generation.totalCredits} cr`}
                  </span>
                </span>
                {isCurrent ? <Badge tone="brand">Current</Badge> : null}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
