import { baseApi } from '@/store/baseApi';

export const aiProvidersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAiProviders: builder.query({
      query: () => '/api/admin/providers',
      transformResponse: (response) => response.data.providers,
      providesTags: ['AiProviders'],
    }),
    createAiProvider: builder.mutation({
      query: (body) => ({ url: '/api/admin/providers', method: 'POST', body }),
      transformResponse: (response) => response.data.provider,
      invalidatesTags: ['AiProviders'],
    }),
    updateAiProvider: builder.mutation({
      query: ({ id, name }) => ({
        url: `/api/admin/providers/${id}`,
        method: 'PATCH',
        body: { name },
      }),
      transformResponse: (response) => response.data.provider,
      invalidatesTags: ['AiProviders', 'AiModels'],
    }),
    updateAiProviderStatus: builder.mutation({
      query: ({ id, isActive }) => ({
        url: `/api/admin/providers/${id}/status`,
        method: 'PATCH',
        body: { isActive },
      }),
      transformResponse: (response) => response.data.provider,
      invalidatesTags: ['AiProviders', 'AiModels'],
    }),
    deleteAiProvider: builder.mutation({
      query: (id) => ({ url: `/api/admin/providers/${id}`, method: 'DELETE' }),
      invalidatesTags: ['AiProviders'],
    }),
  }),
});

export const {
  useGetAiProvidersQuery,
  useCreateAiProviderMutation,
  useUpdateAiProviderMutation,
  useUpdateAiProviderStatusMutation,
  useDeleteAiProviderMutation,
} = aiProvidersApi;
