'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { CircleCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/FormAlert';
import { Spinner } from '@/components/ui/Spinner';
import { AUTH_STATUS, selectAuthStatus } from '@/features/auth/authSlice';
import { useVerifyEmailMutation } from '@/features/auth/authApi';
import { getErrorMessage } from '@/lib/apiError';

export function VerifyEmailView() {
  const token = useSearchParams().get('token') ?? '';
  const status = useSelector(selectAuthStatus);
  const [verifyEmail, { data, error, isLoading, isUninitialized }] =
    useVerifyEmailMutation();
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!token || hasStarted.current || status === AUTH_STATUS.CHECKING) {
      return;
    }

    hasStarted.current = true;
    verifyEmail(token);
  }, [token, status, verifyEmail]);

  const nextLink =
    status === AUTH_STATUS.LOGGED_IN
      ? { href: '/app', label: 'Go to your workspace' }
      : { href: '/login', label: 'Sign in' };

  if (!token) {
    return <FormAlert>This page needs the link from your email.</FormAlert>;
  }

  if (isLoading || isUninitialized) {
    return (
      <div className="flex items-center justify-center gap-2 text-muted-foreground">
        <Spinner />
        Checking your link…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <FormAlert>{getErrorMessage(error)}</FormAlert>
        <p className="text-sm text-muted-foreground">
          You can ask for a new link from the banner in your workspace.
        </p>
        <Button asChild variant="outline">
          <Link href={nextLink.href}>{nextLink.label}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-brand-tint text-brand">
        <CircleCheck className="size-6" />
      </span>
      <p>
        {data.emailChanged
          ? `Your email is now ${data.email}.`
          : `${data.email} is confirmed.`}
      </p>
      <Button asChild size="lg" className="w-full">
        <Link href={nextLink.href}>{nextLink.label}</Link>
      </Button>
    </div>
  );
}
