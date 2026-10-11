'use client';

import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { useLogoutMutation } from '@/features/auth/authApi';
import { SESSION_END_REASON, sessionEnded } from '@/features/auth/authSlice';

const NETWORK_ERRORS = ['FETCH_ERROR', 'TIMEOUT_ERROR'];

export function useSignOut() {
  const dispatch = useDispatch();
  const [logout] = useLogoutMutation();

  return async function signOut() {
    const serverUnreachable = await logout()
      .unwrap()
      .then(() => false)
      .catch((error) => NETWORK_ERRORS.includes(error.status));

    dispatch(sessionEnded({ reason: SESSION_END_REASON.SIGNED_OUT }));

    if (serverUnreachable) {
      toast.warning(
        'Signed out on this device, but the server could not be reached. The session ends there on its own shortly.',
      );
    }
  };
}
