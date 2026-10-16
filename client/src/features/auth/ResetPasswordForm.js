'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CircleCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/Field';
import { FormAlert } from '@/components/ui/FormAlert';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/Spinner';
import { PASSWORD_MIN_LENGTH } from '@/constants/auth';
import { useResetPasswordMutation } from '@/features/auth/authApi';
import { getErrorMessage } from '@/lib/apiError';

export function ResetPasswordForm() {
  const token = useSearchParams().get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [isDone, setIsDone] = useState(false);
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  async function handleSubmit(event) {
    event.preventDefault();

    const errors = {};

    if (password.length < PASSWORD_MIN_LENGTH) {
      errors.password = `Use at least ${PASSWORD_MIN_LENGTH} characters.`;
    }

    if (confirmPassword !== password) {
      errors.confirmPassword = 'The passwords do not match.';
    }

    setFieldErrors(errors);
    setErrorMessage('');

    if (Object.keys(errors).length) return;

    try {
      await resetPassword({ token, newPassword: password }).unwrap();
      setIsDone(true);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  }

  if (!token) {
    return (
      <div className="flex flex-col gap-4">
        <FormAlert>This page needs the link from your reset email.</FormAlert>
        <Button asChild variant="outline">
          <Link href="/forgot-password">Ask for a reset link</Link>
        </Button>
      </div>
    );
  }

  if (isDone) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-brand-tint text-brand">
          <CircleCheck className="size-6" />
        </span>
        <p>Your password is changed. We logged you out on every device.</p>
        <Button asChild size="lg" className="w-full">
          <Link href="/login">Sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <FormAlert>{errorMessage}</FormAlert>
      {errorMessage ? (
        <Link
          href="/forgot-password"
          className="text-sm text-brand underline-offset-4 hover:underline"
        >
          Ask for a new link
        </Link>
      ) : null}
      <Field
        id="new-password"
        label="New password"
        error={fieldErrors.password}
        hint={`At least ${PASSWORD_MIN_LENGTH} characters.`}
      >
        <Input
          id="new-password"
          type="password"
          autoComplete="new-password"
          autoFocus
          className="h-10"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
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
          className="h-10"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
        />
      </Field>
      <Button type="submit" size="lg" disabled={isLoading}>
        {isLoading ? <Spinner /> : null}
        Save new password
      </Button>
    </form>
  );
}
