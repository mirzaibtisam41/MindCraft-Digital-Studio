'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import {
  selectIsAuthenticated,
  selectIsHydrated,
  selectSignedOut,
} from '@/features/auth/authSlice';
import { AppShellSkeleton } from '@/components/layout/AppShellSkeleton';
import { buildLoginPath } from '@/lib/safeNextPath';

export function AuthGuard({ children }) {
  const router = useRouter();
  const hydrated = useSelector(selectIsHydrated);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const signedOut = useSelector(selectSignedOut);

  useEffect(() => {
    if (!hydrated || isAuthenticated) return;

    if (signedOut) {
      router.replace('/login');

      return;
    }

    const { pathname, search } = window.location;

    router.replace(buildLoginPath(`${pathname}${search}`));
  }, [hydrated, isAuthenticated, signedOut, router]);

  if (!hydrated || !isAuthenticated) return <AppShellSkeleton />;

  return children;
}
