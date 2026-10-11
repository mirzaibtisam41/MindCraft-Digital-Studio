'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/Field';
import { FormAlert } from '@/components/ui/FormAlert';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Spinner } from '@/components/ui/Spinner';
import { useLoginMutation } from '@/features/auth/authApi';
import { useFormState } from '@/hooks/useFormState';
import { getErrorMessage, readFieldErrors } from '@/lib/apiError';
import {
  hasErrors,
  validateEmail,
  validateRequiredPassword,
} from '@/lib/validators';

export function LoginForm() {
  const form = useFormState({ email: '', password: '' });
  const [login, { isLoading, isSuccess }] = useLoginMutation();
  const busy = isLoading || isSuccess;

  async function handleSubmit(event) {
    event.preventDefault();

    const errors = {
      email: validateEmail(form.values.email),
      password: validateRequiredPassword(form.values.password),
    };

    form.setErrors(errors);

    if (hasErrors(errors)) return;

    try {
      await login({
        email: form.values.email.trim(),
        password: form.values.password,
      }).unwrap();
    } catch (error) {
      form.setErrors(readFieldErrors(error));
      form.setFormError(getErrorMessage(error));
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <FormAlert>{form.formError}</FormAlert>

      <Field id="email" label="Email" error={form.errors.email}>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          autoFocus
          className="h-10"
          value={form.values.email}
          onChange={form.handleChange}
          aria-invalid={Boolean(form.errors.email)}
          aria-describedby={form.errors.email ? 'email-error' : undefined}
        />
      </Field>

      <Field
        id="password"
        label="Password"
        error={form.errors.password}
        aside={
          <Link
            href="/forgot-password"
            className="text-xs font-medium text-brand underline-offset-4 hover:underline"
          >
            Forgot password?
          </Link>
        }
      >
        <PasswordInput
          id="password"
          name="password"
          autoComplete="current-password"
          value={form.values.password}
          onChange={form.handleChange}
          aria-invalid={Boolean(form.errors.password)}
          aria-describedby={form.errors.password ? 'password-error' : undefined}
        />
      </Field>

      <Button type="submit" size="lg" disabled={busy}>
        {busy ? <Spinner /> : null}
        {busy ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  );
}
