import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  credentialsReceived,
  selectToken,
  sessionEnded,
} from '@/features/auth/authSlice';
import { API_URL } from '@/lib/apiUrl';
import { withRefreshLock } from '@/lib/refreshLock';

const NO_REFRESH_URLS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh',
  '/api/auth/logout',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
];

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = selectToken(getState());

    if (token) headers.set('authorization', `Bearer ${token}`);

    return headers;
  },
});

let refreshInFlight = null;

function getRequestUrl(args) {
  return typeof args === 'string' ? args : args.url;
}

async function requestNewTokens(api, extraOptions) {
  const result = await rawBaseQuery(
    { url: '/api/auth/refresh', method: 'POST' },
    api,
    extraOptions,
  );

  if (!result.data) return false;

  api.dispatch(
    credentialsReceived({ accessToken: result.data.data.accessToken }),
  );

  return true;
}

export function refreshTokens(api, extraOptions) {
  if (!refreshInFlight) {
    refreshInFlight = withRefreshLock(() =>
      requestNewTokens(api, extraOptions),
    ).finally(() => {
      refreshInFlight = null;
    });
  }

  return refreshInFlight;
}

async function baseQueryWithReauth(args, api, extraOptions) {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (
    result.error?.status !== 401 ||
    NO_REFRESH_URLS.includes(getRequestUrl(args))
  ) {
    return result;
  }

  const refreshed = await refreshTokens(api, extraOptions);

  if (!refreshed) {
    api.dispatch(sessionEnded());

    return result;
  }

  const retried = await rawBaseQuery(args, api, extraOptions);

  if (retried.error?.status === 401) api.dispatch(sessionEnded());

  return retried;
}

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  refetchOnFocus: true,
  refetchOnReconnect: true,
  tagTypes: [
    'Profile',
    'Settings',
    'ImageOptions',
    'AdminOverview',
    'AdminModels',
    'AdminUsers',
    'AdminUser',
    'AdminTransactions',
    'AdminGenerations',
    'AdminAudit',
    'AdminSettings',
  ],
  endpoints: () => ({}),
});
