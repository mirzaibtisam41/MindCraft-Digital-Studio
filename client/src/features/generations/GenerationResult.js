'use client';

import { ImagePlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/FormAlert';
import { Spinner } from '@/components/ui/Spinner';
import {
  QUALITY_LABELS,
  SIZE_LABELS,
} from '@/features/generations/generationLabels';
import { cn } from '@/lib/utils';

function ImageGrid({ count, isLandscape, children }) {
  return (
    <div className="flex w-full justify-center rounded-xl border bg-card p-3">
      <div
        className={cn(
          'grid w-full gap-3',
          count > 1
            ? 'max-w-3xl grid-cols-2'
            : isLandscape
              ? 'max-w-2xl grid-cols-1'
              : 'max-w-lg grid-cols-1',
        )}
      >
        {children}
      </div>
    </div>
  );
}

function ResultHeader({ title, onClose }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-[16px] font-semibold">{title}</h2>
      {onClose ? (
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Close result"
          onClick={onClose}
        >
          <X />
        </Button>
      ) : null}
    </div>
  );
}

export function GenerationResult({
  generation,
  pendingCount,
  errorMessage,
  onOpenImage,
  onClose,
}) {
  if (pendingCount) {
    return (
      <div className="flex flex-col gap-3">
        <ResultHeader title="Generating" />
        <ImageGrid count={pendingCount}>
          {Array.from({ length: pendingCount }, (_, index) => (
            <div
              key={index}
              className="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-xl border bg-muted text-sm text-muted-foreground"
            >
              <Spinner />
              Generating…
            </div>
          ))}
        </ImageGrid>
        <p className="text-xs text-ink-3">
          This usually takes 10 to 60 seconds. Keep this page open.
        </p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="flex flex-col gap-3">
        <ResultHeader title="Generation failed" onClose={onClose} />
        <FormAlert>{errorMessage}</FormAlert>
      </div>
    );
  }

  if (!generation) {
    return (
      <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-16 text-center">
        <span className="flex size-10 items-center justify-center rounded-lg bg-brand-tint text-brand">
          <ImagePlus className="size-5" />
        </span>
        <div className="flex flex-col gap-1">
          <p className="font-medium">Your images will appear here</p>
          <p className="text-sm text-muted-foreground">
            Describe what you want to see and press Generate.
          </p>
        </div>
      </div>
    );
  }

  const { options } = generation;

  return (
    <div className="flex flex-col gap-3">
      <ResultHeader title="Result" onClose={onClose} />
      <ImageGrid
        count={generation.images.length}
        isLandscape={generation.images.every(
          (image) => image.width > image.height,
        )}
      >
        {generation.images.map((image, index) => (
          <button
            key={image.id}
            type="button"
            onClick={() => onOpenImage(image)}
            className="overflow-hidden rounded-xl border bg-muted focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
            aria-label={`Open image ${index + 1} of ${generation.images.length}`}
          >
            <img
              src={image.url}
              alt={generation.prompt}
              className="h-auto w-full object-contain"
              style={{ aspectRatio: `${image.width} / ${image.height}` }}
            />
          </button>
        ))}
      </ImageGrid>
      <p className="text-xs text-ink-3">
        <span className="text-muted-foreground">{generation.prompt}</span>
        {' · '}
        {generation.model.name} · {SIZE_LABELS[options.size] ?? options.size}{' '}
        {options.size} · {QUALITY_LABELS[options.quality] ?? options.quality} ·{' '}
        {generation.totalCredits} cr
      </p>
    </div>
  );
}
