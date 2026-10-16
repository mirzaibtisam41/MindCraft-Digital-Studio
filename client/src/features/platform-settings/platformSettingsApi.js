import { baseApi } from '@/store/baseApi';

export const platformSettingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPlatformSettings: builder.query({
      query: () => '/api/admin/settings',
      transformResponse: (response) => ({
        ...response.data.settings,
        chatModels: response.data.chatModels,
      }),
      providesTags: ['PlatformSettings'],
    }),
    updatePlatformSettings: builder.mutation({
      query: (body) => ({ url: '/api/admin/settings', method: 'PATCH', body }),
      transformResponse: (response) => response.data.settings,
      invalidatesTags: ['PlatformSettings'],
    }),
  }),
});

export const {
  useGetPlatformSettingsQuery,
  useUpdatePlatformSettingsMutation,
} = platformSettingsApi;
