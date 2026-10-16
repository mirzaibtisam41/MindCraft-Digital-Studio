import { baseApi } from '@/store/baseApi';

export const promptsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPromptOptions: builder.query({
      query: () => '/api/prompts/options',
      transformResponse: (response) => response.data,
    }),
    getMyPrompts: builder.query({
      query: (params) => ({ url: '/api/prompts', params }),
      transformResponse: (response) => ({
        prompts: response.data.prompts,
        categoryCounts: response.meta.categoryCounts,
      }),
      providesTags: ['Prompts'],
    }),
    enhancePrompt: builder.mutation({
      query: (body) => ({ url: '/api/prompts/enhance', method: 'POST', body }),
      transformResponse: (response) => response.data,
    }),
    createPrompt: builder.mutation({
      query: (body) => ({ url: '/api/prompts', method: 'POST', body }),
      transformResponse: (response) => response.data.prompt,
      invalidatesTags: ['Prompts'],
    }),
    updatePrompt: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/api/prompts/${id}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response) => response.data.prompt,
      invalidatesTags: ['Prompts'],
    }),
    deletePrompt: builder.mutation({
      query: (id) => ({ url: `/api/prompts/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Prompts'],
    }),
    markPromptUsed: builder.mutation({
      query: (id) => ({ url: `/api/prompts/${id}/use`, method: 'POST' }),
      invalidatesTags: ['Prompts'],
    }),
  }),
});

export const {
  useGetPromptOptionsQuery,
  useGetMyPromptsQuery,
  useEnhancePromptMutation,
  useCreatePromptMutation,
  useUpdatePromptMutation,
  useDeletePromptMutation,
  useMarkPromptUsedMutation,
} = promptsApi;
