import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from '@/lib/apiUrl';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: API_URL, credentials: 'include' }),
  refetchOnFocus: true,
  refetchOnReconnect: true,
  tagTypes: [],
  endpoints: () => ({}),
});
