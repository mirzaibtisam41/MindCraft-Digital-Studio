'use client';

import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/Field';
import { FormAlert } from '@/components/ui/FormAlert';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { PasswordRules } from '@/components/ui/PasswordRules';
import { Spinner } from '@/components/ui/Spinner';
import { useRegisterMutation } from '@/features/auth/authApi';
import { useFormState } from '@/hooks/useFormState';
import { getErrorMessage, readFieldErrors } from '@/lib/apiError';
import {
  hasErrors,
  validateEmail,
  validateName,
  validateNewPassword,
} from '@/lib/validators';

const CONFLICT_STATUS = 409;

export function RegisterForm() {
  const form = useFormState({ name: '', email: '', password: '' });
  const [register, { isLoading, isSuccess }] = useRegisterMutation();
  const busy = isLoading || isSuccess;

  async function handleSubmit(event) {
    event.preventDefault();

    const errors = {
      name: validateName(form.values.name),
      email: validateEmail(form.values.email),
      password: validateNewPassword(form.values.password),
    };

    form.setErrors(errors);

    if (hasErrors(errors)) return;

    try {
      await register({
        name: form.values.name.trim(),
        email: form.values.email.trim(),
        password: form.values.password,
      }).unwrap();
    } catch (error) {
      if (error.status === CONFLICT_STATUS) {
        form.setErrors({ email: getErrorMessage(error) });

        return;
      }

      form.setErrors(readFieldErrors(error));
      form.setFormError(getErrorMessage(error));
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <FormAlert>{form.formError}</FormAlert>

      <Field id="name" label="Name" error={form.errors.name}>
        <Input
          id="name"
          name="name"
          autoComplete="name"
          autoFocus
          className="h-10"
          value={form.values.name}
          onChange={form.handleChange}
          aria-invalid={Boolean(form.errors.name)}
          aria-describedby={form.errors.name ? 'name-error' : undefined}
        />
      </Field>

      <Field id="email" label="Email" error={form.errors.email}>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          className="h-10"
          value={form.values.email}
          onChange={form.handleChange}
          aria-invalid={Boolean(form.errors.email)}
          aria-describedby={form.errors.email ? 'email-error' : undefined}
        />
      </Field>

      <Field id="password" label="Password" error={form.errors.password}>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          value={form.values.password}
          onChange={form.handleChange}
          aria-invalid={Boolean(form.errors.password)}
          aria-describedby={form.errors.password ? 'password-error' : undefined}
        />
        <PasswordRules value={form.values.password} />
      </Field>

      <Button type="submit" size="lg" disabled={busy}>
        {busy ? <Spinner /> : null}
        {busy ? 'Creating account…' : 'Create account'}
      </Button>
    </form>
  );
}
