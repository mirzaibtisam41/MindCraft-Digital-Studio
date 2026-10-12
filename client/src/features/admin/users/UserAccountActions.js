'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Ban, ShieldCheck, ShieldOff, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { SUPER_ADMIN_ROLE } from '@/constants/admin';
import { useUpdateAdminUserMutation } from '@/features/admin/adminApi';
import { SettingsCard } from '@/features/settings/SettingsCard';
import { getErrorMessage } from '@/lib/apiError';

function buildAction({ user, isSelf }) {
  if (isSelf) return null;

  const isSuspended = Boolean(user.suspendedAt);
  const isAdmin = user.role === SUPER_ADMIN_ROLE;

  return {
    suspension: isSuspended
      ? {
          body: { suspended: false },
          icon: UserCheck,
          label: 'Unsuspend account',
          title: `Unsuspend ${user.name}?`,
          description:
            'They will be able to sign in again. Their credits and history are untouched.',
          success: 'Account unsuspended',
          destructive: false,
        }
      : {
          body: { suspended: true },
          icon: Ban,
          label: 'Suspend account',
          title: `Suspend ${user.name}?`,
          description:
            'They are signed out everywhere and cannot sign in until you unsuspend the account.',
          success: 'Account suspended',
          destructive: true,
        },
    role: isAdmin
      ? {
          body: { role: 'user' },
          icon: ShieldOff,
          label: 'Remove super admin',
          title: `Remove super admin from ${user.name}?`,
          description: 'They lose access to the admin console immediately.',
          success: 'Role changed to user',
          destructive: true,
        }
      : {
          body: { role: SUPER_ADMIN_ROLE },
          icon: ShieldCheck,
          label: 'Make super admin',
          title: `Make ${user.name} a super admin?`,
          description:
            'They will be able to manage models, pricing, users, credits and settings.',
          success: 'Role changed to super admin',
          destructive: false,
        },
  };
}

export function UserAccountActions({ user, isSelf }) {
  const [updateUser, { isLoading }] = useUpdateAdminUserMutation();
  const [pending, setPending] = useState(null);
  const actions = buildAction({ user, isSelf });

  async function confirm() {
    try {
      await updateUser({ id: user.id, body: pending.body }).unwrap();
      toast.success(pending.success);
      setPending(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <SettingsCard
      title="Account"
      description="Access and role. Every change is written to the audit log."
    >
      {actions ? (
        <div className="flex flex-wrap gap-3">
          {Object.values(actions).map((action) => {
            const Icon = action.icon;

            return (
              <Button
                key={action.label}
                type="button"
                variant={action.destructive ? 'outline' : 'secondary'}
                className={action.destructive ? 'text-danger' : undefined}
                onClick={() => setPending(action)}
              >
                <Icon />
                {action.label}
              </Button>
            );
          })}
        </div>
      ) : (
        <p className="text-[13px] text-muted-foreground">
          This is your own account. You cannot change your own role or
          suspension.
        </p>
      )}

      <ConfirmDialog
        open={Boolean(pending)}
        onOpenChange={(open) => {
          if (!open && !isLoading) setPending(null);
        }}
        title={pending?.title ?? ''}
        description={pending?.description ?? ''}
        confirmLabel={pending?.label ?? 'Confirm'}
        destructive={pending?.destructive}
        pending={isLoading}
        onConfirm={confirm}
      />
    </SettingsCard>
  );
}
