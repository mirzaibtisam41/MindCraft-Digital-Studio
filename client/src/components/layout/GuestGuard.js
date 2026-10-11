'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import {
  selectIsAuthenticated,
  selectIsHydrated,
} from '@/features/auth/authSlice';
import { AuthSkeleton } from '@/components/layout/AuthSkeleton';
import { readNextPathFromLocation } from '@/lib/safeNextPath';

export function GuestGuard({ children }) {
  const router = useRouter();
  const hydrated = useSelector(selectIsHydrated);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  useEffect(() => {
    if (hydrated && isAuthenticated) {
      router.replace(readNextPathFromLocation());
    }
  }, [hydrated, isAuthenticated, router]);

  if (!hydrated || isAuthenticated) return <AuthSkeleton />;

  return children;
}
