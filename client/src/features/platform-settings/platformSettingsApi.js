import { baseApi } from '@/store/baseApi';

export const platformSettingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPlatformSettings: builder.query({
      query: () => '/api/admin/settings',
      transformResponse: (response) => ({
        ...response.data.settings,
        visionModels: response.data.visionModels,
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
