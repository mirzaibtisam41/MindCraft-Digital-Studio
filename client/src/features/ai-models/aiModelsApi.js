import { baseApi } from '@/store/baseApi';

export const aiModelsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAiModels: builder.query({
      query: (params) => ({ url: '/api/admin/models', params }),
      transformResponse: (response) => ({
        models: response.data.models,
        meta: response.meta,
      }),
      providesTags: ['AiModels'],
    }),
    createAiModel: builder.mutation({
      query: (body) => ({ url: '/api/admin/models', method: 'POST', body }),
      transformResponse: (response) => response.data.model,
      invalidatesTags: ['AiModels'],
    }),
    updateAiModel: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/api/admin/models/${id}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response) => response.data.model,
      invalidatesTags: ['AiModels'],
    }),
    updateAiModelStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/api/admin/models/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      transformResponse: (response) => response.data.model,
      invalidatesTags: ['AiModels'],
    }),
  }),
});

export const {
  useGetAiModelsQuery,
  useCreateAiModelMutation,
  useUpdateAiModelMutation,
  useUpdateAiModelStatusMutation,
} = aiModelsApi;
