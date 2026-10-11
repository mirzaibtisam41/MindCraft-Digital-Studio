import { sessionRestored } from '@/features/auth/authSlice';
import { API_URL } from '@/lib/apiUrl';
import { withRefreshLock } from '@/lib/refreshLock';

let inFlight = null;

async function requestAccessToken() {
  try {
    const response = await withRefreshLock(() =>
      fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      }),
    );

    if (!response.ok) return null;

    const body = await response.json();

    return body.data.accessToken;
  } catch {
    return null;
  }
}

export function restoreSession(dispatch) {
  if (!inFlight) {
    inFlight = requestAccessToken()
      .then((accessToken) =>
        dispatch(sessionRestored(accessToken ? { accessToken } : null)),
      )
      .finally(() => {
        inFlight = null;
      });
  }

  return inFlight;
}
