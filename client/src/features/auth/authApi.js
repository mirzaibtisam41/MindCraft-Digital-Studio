import { baseApi } from '@/store/baseApi';
import { loggedOut, sessionStarted } from '@/features/auth/authSlice';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (body) => ({ url: '/api/auth/register', method: 'POST', body }),
      transformResponse: (response) => response.data,
    }),
    login: builder.mutation({
      query: (body) => ({ url: '/api/auth/login', method: 'POST', body }),
      transformResponse: (response) => response.data,
      async onQueryStarted(_body, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          dispatch(sessionStarted(data));
        } catch {
          return;
        }
      },
    }),
    logout: builder.mutation({
      query: () => ({ url: '/api/auth/logout', method: 'POST' }),
      async onQueryStarted(_body, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch {
          return;
        } finally {
          dispatch(loggedOut());
        }
      },
    }),
    getSessions: builder.query({
      query: () => '/api/auth/sessions',
      transformResponse: (response) => response.data.sessions,
      providesTags: ['Sessions'],
    }),
    revokeSession: builder.mutation({
      query: (familyId) => ({
        url: `/api/auth/sessions/${familyId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Sessions'],
    }),
    logoutOtherSessions: builder.mutation({
      query: () => ({ url: '/api/auth/logout-others', method: 'POST' }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['Sessions'],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useGetSessionsQuery,
  useRevokeSessionMutation,
  useLogoutOtherSessionsMutation,
} = authApi;
