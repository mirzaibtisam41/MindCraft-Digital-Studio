'use client';

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
import { useLogoutMutation } from '@/features/auth/authApi';

export function LogoutConfirmDialog({ open, onOpenChange }) {
  const [logout, { isLoading }] = useLogoutMutation();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogTitle>Log out?</AlertDialogTitle>
        <AlertDialogDescription>
          You will be logged out on this device. Your other devices stay logged
          in.
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            disabled={isLoading}
            onClick={() => logout()}
          >
            {isLoading ? <Spinner /> : null}
            Log out
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
