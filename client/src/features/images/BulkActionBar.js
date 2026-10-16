'use client';

import { useState } from 'react';
import { Heart, Trash2, X } from 'lucide-react';
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
import { Spinner } from '@/components/ui/Spinner';
import {
  useBulkDeleteImagesMutation,
  useBulkFavoriteImagesMutation,
} from '@/features/images/imagesApi';
import { getErrorMessage } from '@/lib/apiError';

export function BulkActionBar({ selectedIds, onClear, children }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [bulkFavorite, favoriteState] = useBulkFavoriteImagesMutation();
  const [bulkDelete, deleteState] = useBulkDeleteImagesMutation();
  const count = selectedIds.length;

  if (count === 0) return null;

  async function handleFavorite() {
    try {
      const updatedIds = await bulkFavorite({
        ids: selectedIds,
        isFavorite: true,
      }).unwrap();
      toast.success(`${updatedIds.length} added to favorites`);
      onClear();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function handleDelete() {
    try {
      const deletedIds = await bulkDelete(selectedIds).unwrap();
      toast.success(
        deletedIds.length === 1
          ? '1 image deleted'
          : `${deletedIds.length} images deleted`,
      );
      setConfirmOpen(false);
      onClear();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <>
      <div className="sticky bottom-4 z-20 mx-auto flex w-fit max-w-full flex-wrap items-center gap-2 rounded-xl border bg-popover p-2 pl-4 shadow-lg">
        <span className="text-sm font-medium">{count} selected</span>
        <Button
          variant="outline"
          size="sm"
          disabled={favoriteState.isLoading}
          onClick={handleFavorite}
        >
          {favoriteState.isLoading ? <Spinner /> : <Heart />}
          Favorite
        </Button>
        {children}
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setConfirmOpen(true)}
        >
          <Trash2 />
          Delete
        </Button>
        <Button variant="ghost" size="sm" onClick={onClear}>
          <X />
          Clear
        </Button>
      </div>

      <AlertDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!deleteState.isLoading) setConfirmOpen(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogTitle>
            Delete {count} {count === 1 ? 'image' : 'images'}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            They are removed from your creations and from storage. This cannot
            be undone.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteState.isLoading}>
              Cancel
            </AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={deleteState.isLoading}
              onClick={handleDelete}
            >
              {deleteState.isLoading ? <Spinner /> : null}
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
