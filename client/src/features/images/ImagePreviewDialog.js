'use client';

import { useState } from 'react';
import { ExternalLink, Trash2 } from 'lucide-react';
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
import { getErrorMessage } from '@/lib/apiError';

const SOURCE_LABELS = {
  upload: 'Uploaded',
  generated: 'Generated',
  edited: 'Edited',
};

function formatSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ImagePreviewDialog({ image, onOpenChange }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteImage, { isLoading }] = useDeleteImageMutation();

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

  const title = image?.originalFileName ?? 'Image';

  return (
    <>
      <Dialog open={Boolean(image)} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <DialogTitle className="truncate pr-8">{title}</DialogTitle>
          <DialogDescription>
            {image
              ? `${SOURCE_LABELS[image.source]} · ${image.width} × ${image.height} · ${formatSize(image.sizeBytes)} · ${new Date(image.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}`
              : null}
          </DialogDescription>
          {image ? (
            <img
              src={image.url}
              alt={title}
              className="max-h-[60vh] w-full rounded-lg bg-muted object-contain"
            />
          ) : null}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
              <Trash2 />
              Delete
            </Button>
            <Button asChild>
              <a href={image?.url} target="_blank" rel="noreferrer">
                <ExternalLink />
                Open full size
              </a>
            </Button>
          </div>
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
