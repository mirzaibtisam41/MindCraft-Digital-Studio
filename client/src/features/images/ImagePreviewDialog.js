'use client';

import { useState } from 'react';
import { Brush, Copy, Download, Heart, Trash2, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/Spinner';
import { useDeleteImageMutation } from '@/features/images/imagesApi';
import { useImageActions } from '@/features/images/useImageActions';
import { getErrorMessage } from '@/lib/apiError';
import { cn } from '@/lib/utils';

const SOURCE_LABELS = {
  upload: 'Uploaded',
  generated: 'Generated',
  edited: 'Edited',
};

function formatSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function describeImage(image) {
  const parts = [
    SOURCE_LABELS[image.source],
    image.model?.name,
    `${image.width} × ${image.height}`,
    formatSize(image.sizeBytes),
    new Date(image.createdAt).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }),
  ];

  return parts.filter(Boolean).join(' · ');
}

export function ImagePreviewDialog({ image, onOpenChange }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteImage, { isLoading }] = useDeleteImageMutation();
  const actions = useImageActions();

  async function handleDelete() {
    try {
      await deleteImage(image.id).unwrap();
      toast.success('Image deleted');
      setConfirmOpen(false);
      onOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  const title =
    image?.originalFileName ?? (image?.prompt ? 'Generated image' : 'Image');

  return (
    <>
      <Dialog open={Boolean(image)} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <DialogTitle className="truncate pr-8">{title}</DialogTitle>
          <DialogDescription>
            {image ? describeImage(image) : null}
          </DialogDescription>
          {image ? (
            <img
              src={image.url}
              alt={image.prompt ?? title}
              className="max-h-[60vh] w-full rounded-lg bg-muted object-contain"
            />
          ) : null}
          {image?.prompt ? (
            <p className="rounded-lg border bg-background p-3 text-sm text-muted-foreground">
              {image.prompt}
            </p>
          ) : null}
          {image ? (
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
              <Button
                variant="destructive"
                onClick={() => setConfirmOpen(true)}
              >
                <Trash2 />
                Delete
              </Button>
              <div className="flex flex-col-reverse gap-2 sm:flex-row">
                <Button
                  variant="outline"
                  onClick={() => actions.toggleFavorite(image)}
                >
                  <Heart
                    className={cn(
                      image.isFavorite && 'fill-danger text-danger',
                    )}
                  />
                  {image.isFavorite ? 'Favorited' : 'Favorite'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => actions.makeVariations(image)}
                >
                  <Copy />
                  Variations
                </Button>
                <Button
                  variant="outline"
                  onClick={() => actions.editImage(image)}
                >
                  <Brush />
                  Edit
                </Button>
                {image.prompt ? (
                  <Button
                    variant="outline"
                    onClick={() => actions.reusePrompt(image)}
                  >
                    <Wand2 />
                    Reuse prompt
                  </Button>
                ) : null}
                <Button onClick={() => actions.download(image)}>
                  <Download />
                  Download
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!isLoading) setConfirmOpen(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogTitle>Delete this image?</AlertDialogTitle>
          <AlertDialogDescription>
            It is removed from your creations and from storage. This cannot be
            undone.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={isLoading}
              onClick={handleDelete}
            >
              {isLoading ? <Spinner /> : null}
              Delete image
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
