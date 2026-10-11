import { baseApi } from '@/store/baseApi';
import { credentialsReceived } from '@/features/auth/authSlice';

async function storeSession({ dispatch, queryFulfilled }) {
  try {
    const { data } = await queryFulfilled;

    dispatch(credentialsReceived({ accessToken: data.accessToken }));
    dispatch(baseApi.util.upsertQueryData('getProfile', undefined, data.user));
  } catch {
    return;
  }
}

async function storeProfile({ dispatch, queryFulfilled }) {
  try {
    const { data } = await queryFulfilled;

    dispatch(baseApi.util.upsertQueryData('getProfile', undefined, data));
  } catch {
    return;
  }
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (body) => ({ url: '/api/auth/register', method: 'POST', body }),
      transformResponse: (response) => response.data,
      onQueryStarted: (_arg, api) => storeSession(api),
    }),
    login: builder.mutation({
      query: (body) => ({ url: '/api/auth/login', method: 'POST', body }),
      transformResponse: (response) => response.data,
      onQueryStarted: (_arg, api) => storeSession(api),
    }),
    logout: builder.mutation({
      query: () => ({ url: '/api/auth/logout', method: 'POST' }),
    }),
    forgotPassword: builder.mutation({
      query: (body) => ({
        url: '/api/auth/forgot-password',
        method: 'POST',
        body,
      }),
    }),
    resetPassword: builder.mutation({
      query: (body) => ({
        url: '/api/auth/reset-password',
        method: 'POST',
        body,
      }),
    }),
    getProfile: builder.query({
      query: () => '/api/me',
      transformResponse: (response) => response.data,
      providesTags: ['Profile'],
    }),
    updateProfile: builder.mutation({
      query: (body) => ({ url: '/api/me', method: 'PATCH', body }),
      transformResponse: (response) => response.data,
      onQueryStarted: (_arg, api) => storeProfile(api),
    }),
    changePassword: builder.mutation({
      query: (body) => ({ url: '/api/me/password', method: 'PATCH', body }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
} = authApi;
