'use client';

import Link from 'next/link';
import { Download, Wand2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  QUALITY_LABELS,
  SIZE_LABELS,
  STATUS_BADGES,
  buildReuseUrl,
  describeFailure,
} from '@/features/generations/generationLabels';
import { useImageActions } from '@/features/images/useImageActions';

export function GenerationDetailsDialog({ generation, onOpenChange }) {
  const actions = useImageActions();
  const badge = generation ? STATUS_BADGES[generation.status] : null;

  return (
    <Dialog open={Boolean(generation)} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        {generation ? (
          <>
            <DialogTitle className="flex items-center gap-2 pr-8">
              Generation
              <Badge tone={badge.tone}>{badge.label}</Badge>
            </DialogTitle>
            <DialogDescription>
              {[
                generation.model.name,
                `${SIZE_LABELS[generation.options.size] ?? generation.options.size} ${generation.options.size}`,
                QUALITY_LABELS[generation.options.quality] ??
                  generation.options.quality,
                generation.status === 'failed'
                  ? `${generation.totalCredits} cr refunded`
                  : `${generation.totalCredits} cr`,
                new Date(generation.createdAt).toLocaleString(undefined, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                }),
              ].join(' · ')}
            </DialogDescription>

            <p className="rounded-lg border bg-background p-3 text-sm text-muted-foreground">
              {generation.prompt}
            </p>

            {generation.status === 'failed' ? (
              <p className="text-sm text-danger">
                {describeFailure(generation.errorCategory)}. The credits were
                refunded.
              </p>
            ) : null}

            {generation.images.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {generation.images.map((image, index) => (
                  <div key={image.id} className="flex flex-col gap-2">
                    <img
                      src={image.url}
                      alt={`${generation.prompt} (${index + 1})`}
                      className="w-full rounded-lg bg-muted object-contain"
                      style={{
                        aspectRatio: `${image.width} / ${image.height}`,
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => actions.download(image)}
                    >
                      <Download />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="flex justify-end">
              <Button asChild>
                <Link href={buildReuseUrl(generation)}>
                  <Wand2 />
                  Reuse settings
                </Link>
              </Button>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
