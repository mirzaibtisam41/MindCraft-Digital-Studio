'use client';

import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/Field';
import { FormAlert } from '@/components/ui/FormAlert';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { PasswordRules } from '@/components/ui/PasswordRules';
import { Spinner } from '@/components/ui/Spinner';
import { useChangePasswordMutation } from '@/features/auth/authApi';
import { SettingsCard } from '@/features/settings/SettingsCard';
import { useFormState } from '@/hooks/useFormState';
import { getErrorMessage, readFieldErrors } from '@/lib/apiError';
import {
  hasErrors,
  validateNewPassword,
  validatePasswordConfirmation,
  validateRequiredPassword,
} from '@/lib/validators';

const BAD_REQUEST_STATUS = 400;

const INITIAL_VALUES = {
  currentPassword: '',
  newPassword: '',
  confirmation: '',
};

export function ChangePasswordForm() {
  const form = useFormState(INITIAL_VALUES);
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  async function handleSubmit(event) {
    event.preventDefault();

    const errors = {
      currentPassword: validateRequiredPassword(form.values.currentPassword),
      newPassword: validateNewPassword(form.values.newPassword),
      confirmation: validatePasswordConfirmation(
        form.values.newPassword,
        form.values.confirmation,
      ),
    };

    form.setErrors(errors);

    if (hasErrors(errors)) return;

    try {
      await changePassword({
        currentPassword: form.values.currentPassword,
        newPassword: form.values.newPassword,
      }).unwrap();

      form.reset();
      toast.success('Password changed. Other devices have been signed out.');
    } catch (error) {
      const fieldErrors = readFieldErrors(error);

      if (error.status === BAD_REQUEST_STATUS && !error.data?.details) {
        form.setErrors({ currentPassword: getErrorMessage(error) });

        return;
      }

      form.setErrors(fieldErrors);
      form.setFormError(getErrorMessage(error));
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <SettingsCard
        title="Password"
        description="Changing your password signs you out on every other device."
        footer={
          <Button type="submit" size="sm" disabled={isLoading}>
            {isLoading ? <Spinner /> : null}
            {isLoading ? 'Updating…' : 'Update password'}
          </Button>
        }
      >
        <FormAlert>{form.formError}</FormAlert>

        <Field
          id="currentPassword"
          label="Current password"
          error={form.errors.currentPassword}
        >
          <PasswordInput
            id="currentPassword"
            name="currentPassword"
            autoComplete="current-password"
            value={form.values.currentPassword}
            onChange={form.handleChange}
            aria-invalid={Boolean(form.errors.currentPassword)}
            aria-describedby={
              form.errors.currentPassword ? 'currentPassword-error' : undefined
            }
          />
        </Field>

        <Field
          id="newPassword"
          label="New password"
          error={form.errors.newPassword}
        >
          <PasswordInput
            id="newPassword"
            name="newPassword"
            autoComplete="new-password"
            value={form.values.newPassword}
            onChange={form.handleChange}
            aria-invalid={Boolean(form.errors.newPassword)}
            aria-describedby={
              form.errors.newPassword ? 'newPassword-error' : undefined
            }
          />
          <PasswordRules value={form.values.newPassword} />
        </Field>

        <Field
          id="confirmation"
          label="Confirm new password"
          error={form.errors.confirmation}
        >
          <PasswordInput
            id="confirmation"
            name="confirmation"
            autoComplete="new-password"
            value={form.values.confirmation}
            onChange={form.handleChange}
            aria-invalid={Boolean(form.errors.confirmation)}
            aria-describedby={
              form.errors.confirmation ? 'confirmation-error' : undefined
            }
          />
        </Field>
      </SettingsCard>
    </form>
  );
}
