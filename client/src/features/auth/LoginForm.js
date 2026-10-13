'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/Field';
import { FormAlert } from '@/components/ui/FormAlert';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/Spinner';
import { useLoginMutation } from '@/features/auth/authApi';
import { getErrorMessage } from '@/lib/apiError';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [login, { isLoading }] = useLoginMutation();

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Enter your email and password.');

      return;
    }

    try {
      await login({ email: email.trim(), password }).unwrap();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <FormAlert>{errorMessage}</FormAlert>

      <Field id="email" label="Email">
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          autoFocus
          className="h-10"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </Field>

      <Field id="password" label="Password">
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          className="h-10"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </Field>

      <Button type="submit" size="lg" disabled={isLoading}>
        {isLoading ? <Spinner /> : null}
        {isLoading ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  );
}
