'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import {
  AUTH_STATUS,
  selectAuthStatus,
  selectCurrentUser,
} from '@/features/auth/authSlice';
import { PageLoader } from '@/components/layout/PageLoader';

const ADMIN_ROLE = 'admin';

export function AuthGuard({ adminOnly = false, children }) {
  const router = useRouter();
  const status = useSelector(selectAuthStatus);
  const user = useSelector(selectCurrentUser);

  const isLoggedIn = status === AUTH_STATUS.LOGGED_IN;
  const isMissingAdminRole = adminOnly && user?.role !== ADMIN_ROLE;

  useEffect(() => {
    if (status === AUTH_STATUS.LOGGED_OUT) {
      router.replace('/login');
    } else if (isLoggedIn && isMissingAdminRole) {
      router.replace('/app');
    }
  }, [status, isLoggedIn, isMissingAdminRole, router]);

  if (!isLoggedIn || isMissingAdminRole) return <PageLoader />;

  return children;
}
