'use client';

import { useState } from 'react';
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Spinner } from '@/components/ui/Spinner';
import {
  useUpdateUserRoleMutation,
  useUpdateUserStatusMutation,
} from '@/features/users/usersApi';
import { getErrorMessage } from '@/lib/apiError';

function buildActions(user) {
  const isSuspended = user.status === 'suspended';
  const isAdmin = user.role === 'admin';

  return {
    status: isSuspended
      ? {
          label: 'Unsuspend account',
          title: `Unsuspend ${user.name}?`,
          description:
            'They can log in again. Their old sessions stay ended, so they need to log in once more.',
          change: { status: 'active' },
          destructive: false,
        }
      : {
          label: 'Suspend account',
          title: `Suspend ${user.name}?`,
          description:
            'They are logged out on every device and cannot log in until you unsuspend the account.',
          change: { status: 'suspended' },
          destructive: true,
        },
    role: isAdmin
      ? {
          label: 'Remove admin access',
          title: `Remove admin access from ${user.name}?`,
          description: 'They lose access to the admin console straight away.',
          change: { role: 'user' },
          destructive: true,
        }
      : {
          label: 'Make admin',
          title: `Make ${user.name} an admin?`,
          description:
            'They get full access to the admin console, including users, models and credits.',
          change: { role: 'admin' },
          destructive: false,
        },
  };
}

export function UserAccountActions({ user, isCurrentUser }) {
  const [pendingAction, setPendingAction] = useState(null);
  const [updateStatus, statusState] = useUpdateUserStatusMutation();
  const [updateRole, roleState] = useUpdateUserRoleMutation();
  const isSaving = statusState.isLoading || roleState.isLoading;
  const actions = buildActions(user);

  async function confirmAction() {
    const { change } = pendingAction;

    try {
      const response = change.status
        ? await updateStatus({
            userId: user.id,
            status: change.status,
          }).unwrap()
        : await updateRole({ userId: user.id, role: change.role }).unwrap();

      toast.success(
        change.status
          ? `${response.name} is now ${response.status}`
          : `${response.name} is now ${response.role === 'admin' ? 'an admin' : 'a regular user'}`,
      );
      setPendingAction(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account</CardTitle>
        <CardDescription>
          {isCurrentUser
            ? 'This is your own account. Another admin has to change its status or role.'
            : 'Suspend the account or change what it can access.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {[actions.status, actions.role].map((action) => (
          <Button
            key={action.label}
            variant={action.destructive ? 'destructive' : 'outline'}
            disabled={isCurrentUser}
            onClick={() => setPendingAction(action)}
          >
            {action.label}
          </Button>
        ))}
      </CardContent>

      <AlertDialog
        open={Boolean(pendingAction)}
        onOpenChange={(open) => {
          if (!open && !isSaving) setPendingAction(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogTitle>{pendingAction?.title}</AlertDialogTitle>
          <AlertDialogDescription>
            {pendingAction?.description}
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>Cancel</AlertDialogCancel>
            <Button
              variant={pendingAction?.destructive ? 'destructive' : 'default'}
              disabled={isSaving}
              onClick={confirmAction}
            >
              {isSaving ? <Spinner /> : null}
              {pendingAction?.label}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
