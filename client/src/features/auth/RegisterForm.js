'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/Field';
import { FormAlert } from '@/components/ui/FormAlert';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/Spinner';
import { useLoginMutation, useRegisterMutation } from '@/features/auth/authApi';
import { getErrorMessage } from '@/lib/apiError';

const PASSWORD_MIN_LENGTH = 8;
const EMAIL_TAKEN_STATUS = 409;

function validate({ name, email, password }) {
  const errors = {};

  if (!name.trim()) errors.name = 'Enter your name.';
  if (!email.trim()) errors.email = 'Enter your email.';
  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.password = `Use at least ${PASSWORD_MIN_LENGTH} characters.`;
  }

  return errors;
}

export function RegisterForm() {
  const [values, setValues] = useState({ name: '', email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [register, { isLoading: isRegistering }] = useRegisterMutation();
  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const isBusy = isRegistering || isLoggingIn;

  function handleChange(event) {
    setValues({ ...values, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage('');

    const errors = validate(values);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) return;

    const credentials = {
      email: values.email.trim(),
      password: values.password,
    };

    try {
      await register({ name: values.name.trim(), ...credentials }).unwrap();
      await login(credentials).unwrap();
    } catch (error) {
      if (error.status === EMAIL_TAKEN_STATUS) {
        setFieldErrors({ email: getErrorMessage(error) });

        return;
      }

      setErrorMessage(getErrorMessage(error));
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <FormAlert>{errorMessage}</FormAlert>

      <Field id="name" label="Name" error={fieldErrors.name}>
        <Input
          id="name"
          name="name"
          placeholder="Your full name"
          autoComplete="name"
          autoFocus
          className="h-10"
          value={values.name}
          onChange={handleChange}
          aria-invalid={Boolean(fieldErrors.name)}
        />
      </Field>

      <Field id="email" label="Email" error={fieldErrors.email}>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          className="h-10"
          value={values.email}
          onChange={handleChange}
          aria-invalid={Boolean(fieldErrors.email)}
        />
      </Field>

      <Field
        id="password"
        label="Password"
        error={fieldErrors.password}
        hint={`At least ${PASSWORD_MIN_LENGTH} characters.`}
      >
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Create a password"
          autoComplete="new-password"
          className="h-10"
          value={values.password}
          onChange={handleChange}
          aria-invalid={Boolean(fieldErrors.password)}
        />
      </Field>

      <Button type="submit" size="lg" disabled={isBusy}>
        {isBusy ? <Spinner /> : null}
        {isBusy ? 'Creating account…' : 'Create account'}
      </Button>
    </form>
  );
}
