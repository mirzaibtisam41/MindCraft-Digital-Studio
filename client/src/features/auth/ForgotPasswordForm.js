'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/Field';
import { FormAlert } from '@/components/ui/FormAlert';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/Spinner';
import { useForgotPasswordMutation } from '@/features/auth/authApi';
import { useFormState } from '@/hooks/useFormState';
import { getErrorMessage, readFieldErrors } from '@/lib/apiError';
import { hasErrors, validateEmail } from '@/lib/validators';

export function ForgotPasswordForm() {
  const form = useFormState({ email: '' });
  const [forgotPassword, { isLoading, isSuccess }] =
    useForgotPasswordMutation();

  async function handleSubmit(event) {
    event.preventDefault();

    const errors = { email: validateEmail(form.values.email) };

    form.setErrors(errors);

    if (hasErrors(errors)) return;

    try {
      await forgotPassword({ email: form.values.email.trim() }).unwrap();
    } catch (error) {
      form.setErrors(readFieldErrors(error));
      form.setFormError(getErrorMessage(error));
    }
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col gap-4">
        <FormAlert tone="success">
          If an account exists for {form.values.email.trim()}, we have sent a
          password reset link. It expires in 30 minutes.
        </FormAlert>
        <Button asChild variant="secondary" size="lg">
          <Link href="/login">Back to sign in</Link>
        </Button>
      </div>
    );
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

      <Button type="submit" size="lg" disabled={isLoading}>
        {isLoading ? <Spinner /> : null}
        {isLoading ? 'Sending…' : 'Send reset link'}
      </Button>
    </form>
  );
}
