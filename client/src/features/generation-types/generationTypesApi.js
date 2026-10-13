import { baseApi } from '@/store/baseApi';

export const generationTypesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getGenerationTypes: builder.query({
      query: () => '/api/admin/generation-types',
      transformResponse: (response) => response.data.generationTypes,
      providesTags: ['GenerationTypes'],
    }),
    createGenerationType: builder.mutation({
      query: (body) => ({
        url: '/api/admin/generation-types',
        method: 'POST',
        body,
      }),
      transformResponse: (response) => response.data.generationType,
      invalidatesTags: ['GenerationTypes', 'ModelWorkflows'],
    }),
    deleteGenerationType: builder.mutation({
      query: (id) => ({
        url: `/api/admin/generation-types/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['GenerationTypes', 'ModelWorkflows'],
    }),
    updateGenerationType: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/api/admin/generation-types/${id}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response) => response.data.generationType,
      invalidatesTags: ['GenerationTypes', 'ModelWorkflows'],
    }),
    updateGenerationTypeStatus: builder.mutation({
      query: ({ id, isActive }) => ({
        url: `/api/admin/generation-types/${id}/status`,
        method: 'PATCH',
        body: { isActive },
      }),
      transformResponse: (response) => response.data.generationType,
      invalidatesTags: ['GenerationTypes', 'ModelWorkflows'],
    }),
    getModelWorkflows: builder.query({
      query: (modelId) => `/api/admin/models/${modelId}/generation-types`,
      transformResponse: (response) => response.data,
      providesTags: ['ModelWorkflows'],
    }),
    saveModelWorkflow: builder.mutation({
      query: ({ modelId, typeId, ...body }) => ({
        url: `/api/admin/models/${modelId}/generation-types/${typeId}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response) => response.data.workflow,
      invalidatesTags: ['ModelWorkflows'],
    }),
  }),
});

export const {
  useGetGenerationTypesQuery,
  useCreateGenerationTypeMutation,
  useDeleteGenerationTypeMutation,
  useUpdateGenerationTypeMutation,
  useUpdateGenerationTypeStatusMutation,
  useGetModelWorkflowsQuery,
  useSaveModelWorkflowMutation,
} = generationTypesApi;
