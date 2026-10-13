'use client';

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
import { useDeleteGenerationTypeMutation } from '@/features/generation-types/generationTypesApi';
import { getErrorMessage } from '@/lib/apiError';

export function DeleteGenerationTypeDialog({ generationType, onOpenChange }) {
  const [deleteGenerationType, { isLoading }] =
    useDeleteGenerationTypeMutation();

  async function handleDelete() {
    try {
      await deleteGenerationType(generationType.id).unwrap();
      toast.success('Generation type deleted');
      onOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <AlertDialog open={Boolean(generationType)} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogTitle>Delete {generationType?.name}?</AlertDialogTitle>
        <AlertDialogDescription>
          This removes the generation type permanently. If any model uses it, it
          cannot be deleted; turn it off instead.
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            disabled={isLoading}
            onClick={handleDelete}
          >
            {isLoading ? <Spinner /> : null}
            Delete generation type
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
