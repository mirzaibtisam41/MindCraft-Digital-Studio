'use client';

import { useState } from 'react';
import { MailCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/Field';
import { FormAlert } from '@/components/ui/FormAlert';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/Spinner';
import { useForgotPasswordMutation } from '@/features/auth/authApi';
import { getErrorMessage } from '@/lib/apiError';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [sentMessage, setSentMessage] = useState('');
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  async function handleSubmit(event) {
    event.preventDefault();

    if (!email.trim()) {
      setErrorMessage('Enter the email of your account.');
      return;
    }

    setErrorMessage('');

    try {
      const response = await forgotPassword({ email: email.trim() }).unwrap();
      setSentMessage(response.message);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  }

  if (sentMessage) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-brand-tint text-brand">
          <MailCheck className="size-6" />
        </span>
        <p>{sentMessage}</p>
        <p className="text-sm text-muted-foreground">
          The link works for 30 minutes. Check your spam folder if you do not
          see it.
        </p>
      </div>
    );
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
      <Button type="submit" size="lg" disabled={isLoading}>
        {isLoading ? <Spinner /> : null}
        Send reset link
      </Button>
    </form>
  );
}
