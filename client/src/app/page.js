'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import {
  selectIsAuthenticated,
  selectIsHydrated,
} from '@/features/auth/authSlice';
import { AuthSkeleton } from '@/components/layout/AuthSkeleton';

export default function RootPage() {
  const router = useRouter();
  const hydrated = useSelector(selectIsHydrated);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  useEffect(() => {
    if (!hydrated) return;

    router.replace(isAuthenticated ? '/app' : '/login');
  }, [hydrated, isAuthenticated, router]);

  return <AuthSkeleton />;
}
