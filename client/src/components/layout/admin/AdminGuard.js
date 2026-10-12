'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppShellSkeleton } from '@/components/layout/AppShellSkeleton';
import { SUPER_ADMIN_ROLE } from '@/constants/admin';
import { useGetProfileQuery } from '@/features/auth/authApi';

export function AdminGuard({ children }) {
  const router = useRouter();
  const { data: user, isError } = useGetProfileQuery();
  const isForbidden = isError || (user && user.role !== SUPER_ADMIN_ROLE);

  useEffect(() => {
    if (isForbidden) router.replace('/app');
  }, [isForbidden, router]);

  if (!user || isForbidden) return <AppShellSkeleton />;

  return children;
}
