'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/input';
import { SettingsCard } from '@/features/settings/SettingsCard';
import { useChangePasswordMutation } from '@/features/settings/settingsApi';
import { PASSWORD_MIN_LENGTH } from '@/constants/auth';
import { getErrorMessage } from '@/lib/apiError';

const EMPTY_FORM = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

export function ChangePasswordCard() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const isDirty = Object.values(form).some(Boolean);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function findErrors() {
    const errors = {};

    if (!form.currentPassword) {
      errors.currentPassword = 'Enter your current password.';
    }

    if (form.newPassword.length < PASSWORD_MIN_LENGTH) {
      errors.newPassword = `Use at least ${PASSWORD_MIN_LENGTH} characters.`;
    }

    if (form.confirmPassword !== form.newPassword) {
      errors.confirmPassword = 'The passwords do not match.';
    }

    return errors;
  }

  async function save() {
    const errors = findErrors();
    setFieldErrors(errors);
    setErrorMessage('');

    if (Object.keys(errors).length) return;

    try {
      const { loggedOutCount } = await changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      }).unwrap();
      setForm(EMPTY_FORM);
      toast.success(
        loggedOutCount
          ? `Password changed · logged out of ${loggedOutCount} other ${loggedOutCount === 1 ? 'device' : 'devices'}`
          : 'Password changed',
      );
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  }

  return (
    <SettingsCard
      title="Password"
      description="Changing it logs you out on every other device."
      errorMessage={errorMessage}
      isDirty={isDirty}
      isSaving={isLoading}
      onSave={save}
      saveLabel="Change password"
      onDiscard={() => {
        setForm(EMPTY_FORM);
        setFieldErrors({});
        setErrorMessage('');
      }}
    >
      <Field
        id="current-password"
        label="Current password"
        error={fieldErrors.currentPassword}
      >
        <Input
          id="current-password"
          type="password"
          autoComplete="current-password"
          value={form.currentPassword}
          onChange={(event) => update('currentPassword', event.target.value)}
        />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="new-password"
          label="New password"
          error={fieldErrors.newPassword}
        >
          <Input
            id="new-password"
            type="password"
            autoComplete="new-password"
            value={form.newPassword}
            onChange={(event) => update('newPassword', event.target.value)}
          />
        </Field>
        <Field
          id="confirm-password"
          label="Repeat new password"
          error={fieldErrors.confirmPassword}
        >
          <Input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={(event) => update('confirmPassword', event.target.value)}
          />
        </Field>
      </div>
    </SettingsCard>
  );
}
