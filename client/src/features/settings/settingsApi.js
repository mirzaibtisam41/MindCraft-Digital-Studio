import { baseApi } from '@/store/baseApi';
import { userUpdated } from '@/features/auth/authSlice';

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    updateProfile: builder.mutation({
      query: (body) => ({ url: '/api/me/profile', method: 'PATCH', body }),
      transformResponse: (response) => response.data.user,
      async onQueryStarted(_body, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          dispatch(userUpdated(data));
        } catch {
          return;
        }
      },
    }),
    changePassword: builder.mutation({
      query: (body) => ({ url: '/api/me/password', method: 'POST', body }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['Sessions'],
    }),
    getMySettings: builder.query({
      query: () => '/api/me/settings',
      transformResponse: (response) => response.data.settings,
      providesTags: ['UserSettings'],
    }),
    updateMySettings: builder.mutation({
      query: (body) => ({ url: '/api/me/settings', method: 'PATCH', body }),
      transformResponse: (response) => response.data.settings,
      invalidatesTags: ['UserSettings'],
    }),
  }),
});

export const {
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useGetMySettingsQuery,
  useUpdateMySettingsMutation,
} = settingsApi;
