'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/Field';
import { FormAlert } from '@/components/ui/FormAlert';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { PasswordRules } from '@/components/ui/PasswordRules';
import { Spinner } from '@/components/ui/Spinner';
import { useResetPasswordMutation } from '@/features/auth/authApi';
import { useFormState } from '@/hooks/useFormState';
import { getErrorMessage, readFieldErrors } from '@/lib/apiError';
import {
  hasErrors,
  validateNewPassword,
  validatePasswordConfirmation,
} from '@/lib/validators';

const BAD_REQUEST_STATUS = 400;

function InvalidLink({ message }) {
  return (
    <div className="flex flex-col gap-4">
      <FormAlert>{message}</FormAlert>
      <Button asChild size="lg">
        <Link href="/forgot-password">Request a new link</Link>
      </Button>
    </div>
  );
}

export function ResetPasswordForm() {
  const token = useSearchParams().get('token');
  const form = useFormState({ password: '', confirmation: '' });
  const [linkInvalid, setLinkInvalid] = useState(false);
  const [resetPassword, { isLoading, isSuccess }] = useResetPasswordMutation();

  async function handleSubmit(event) {
    event.preventDefault();

    const errors = {
      password: validateNewPassword(form.values.password),
      confirmation: validatePasswordConfirmation(
        form.values.password,
        form.values.confirmation,
      ),
    };

    form.setErrors(errors);

    if (hasErrors(errors)) return;

    try {
      await resetPassword({ token, password: form.values.password }).unwrap();
    } catch (error) {
      if (error.status === BAD_REQUEST_STATUS && !error.data?.details) {
        setLinkInvalid(true);

        return;
      }

      form.setErrors(readFieldErrors(error));
      form.setFormError(getErrorMessage(error));
    }
  }

  if (!token) {
    return <InvalidLink message="This password reset link is incomplete." />;
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col gap-4">
        <FormAlert tone="success">
          Your password has been reset. You have been signed out everywhere, so
          sign in again with the new password.
        </FormAlert>
        <Button asChild size="lg">
          <Link href="/login">Sign in</Link>
        </Button>
      </div>
    );
  }

  if (linkInvalid) {
    return (
      <InvalidLink message="This password reset link is invalid or has expired." />
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <FormAlert>{form.formError}</FormAlert>

      <Field id="password" label="New password" error={form.errors.password}>
        <PasswordInput
          id="password"
          name="password"
          placeholder="Enter a new password"
          autoComplete="new-password"
          autoFocus
          value={form.values.password}
          onChange={form.handleChange}
          aria-invalid={Boolean(form.errors.password)}
          aria-describedby={form.errors.password ? 'password-error' : undefined}
        />
        <PasswordRules value={form.values.password} />
      </Field>

      <Field
        id="confirmation"
        label="Confirm new password"
        error={form.errors.confirmation}
      >
        <PasswordInput
          id="confirmation"
          name="confirmation"
          placeholder="Repeat the new password"
          autoComplete="new-password"
          value={form.values.confirmation}
          onChange={form.handleChange}
          aria-invalid={Boolean(form.errors.confirmation)}
          aria-describedby={
            form.errors.confirmation ? 'confirmation-error' : undefined
          }
        />
      </Field>

      <Button type="submit" size="lg" disabled={isLoading}>
        {isLoading ? <Spinner /> : null}
        {isLoading ? 'Resetting…' : 'Reset password'}
      </Button>
    </form>
  );
}
