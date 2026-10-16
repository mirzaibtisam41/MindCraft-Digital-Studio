import { baseApi } from '@/store/baseApi';

function readTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC';
  } catch {
    return 'UTC';
  }
}

export const usageApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyUsage: builder.query({
      query: ({ month } = {}) => ({
        url: '/api/usage',
        params: { timezone: readTimezone(), ...(month ? { month } : {}) },
      }),
      transformResponse: (response) => response.data,
      providesTags: ['Wallet'],
    }),
  }),
});

export const { useGetMyUsageQuery } = usageApi;
