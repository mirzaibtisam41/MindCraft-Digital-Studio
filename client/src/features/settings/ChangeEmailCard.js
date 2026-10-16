'use client';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/input';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { SettingsCard } from '@/features/settings/SettingsCard';
import { useChangeEmailMutation } from '@/features/settings/settingsApi';
import { getErrorMessage } from '@/lib/apiError';

const EMPTY_FORM = { newEmail: '', currentPassword: '' };

export function ChangeEmailCard() {
  const user = useSelector(selectCurrentUser);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errorMessage, setErrorMessage] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [changeEmail, { isLoading }] = useChangeEmailMutation();
  const isDirty = Object.values(form).some(Boolean);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function save() {
    if (!form.newEmail.trim() || !form.currentPassword) {
      setErrorMessage('Enter the new email and your current password.');
      return;
    }

    setErrorMessage('');

    try {
      const response = await changeEmail({
        newEmail: form.newEmail.trim(),
        currentPassword: form.currentPassword,
      }).unwrap();
      setPendingEmail(response.data.newEmail);
      setForm(EMPTY_FORM);
      toast.success('Confirmation link sent');
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  }

  return (
    <SettingsCard
      title="Email"
      description="We send a link to the new address. Your email changes only when you open it."
      errorMessage={errorMessage}
      isDirty={isDirty}
      isSaving={isLoading}
      onSave={save}
      saveLabel="Send confirmation link"
      onDiscard={() => {
        setForm(EMPTY_FORM);
        setErrorMessage('');
      }}
    >
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-ink-3">Current email</span>
        <span className="font-medium">{user.email}</span>
        <Badge tone={user.emailVerifiedAt ? 'brand' : 'neutral'}>
          {user.emailVerifiedAt ? 'Confirmed' : 'Not confirmed'}
        </Badge>
      </div>
      {pendingEmail ? (
        <p className="rounded-lg border bg-background p-3 text-sm text-muted-foreground">
          Open the link we sent to{' '}
          <span className="font-medium text-foreground">{pendingEmail}</span> to
          finish the change. It works for 24 hours.
        </p>
      ) : null}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="new-email" label="New email">
          <Input
            id="new-email"
            type="email"
            autoComplete="email"
            value={form.newEmail}
            onChange={(event) => update('newEmail', event.target.value)}
          />
        </Field>
        <Field id="email-current-password" label="Current password">
          <Input
            id="email-current-password"
            type="password"
            autoComplete="current-password"
            value={form.currentPassword}
            onChange={(event) => update('currentPassword', event.target.value)}
          />
        </Field>
      </div>
    </SettingsCard>
  );
}
