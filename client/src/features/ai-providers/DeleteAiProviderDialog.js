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
import { useDeleteAiProviderMutation } from '@/features/ai-providers/aiProvidersApi';
import { getErrorMessage } from '@/lib/apiError';

export function DeleteAiProviderDialog({ provider, onOpenChange }) {
  const [deleteAiProvider, { isLoading }] = useDeleteAiProviderMutation();

  async function handleDelete() {
    try {
      await deleteAiProvider(provider.id).unwrap();
      toast.success('Provider deleted');
      onOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <AlertDialog open={Boolean(provider)} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogTitle>Delete {provider?.name}?</AlertDialogTitle>
        <AlertDialogDescription>
          This removes the provider permanently. This can&apos;t be undone.
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            disabled={isLoading}
            onClick={handleDelete}
          >
            {isLoading ? <Spinner /> : null}
            Delete provider
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
