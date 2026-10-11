'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { restoreSession } from '@/features/auth/restoreSession';

export function SessionBoot() {
  const dispatch = useDispatch();

  useEffect(() => {
    restoreSession(dispatch);
  }, [dispatch]);

  return null;
}
