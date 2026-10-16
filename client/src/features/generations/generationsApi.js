import { baseApi } from '@/store/baseApi';

export const generationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getGenerationOptions: builder.query({
      query: () => '/api/generations/options',
      transformResponse: (response) => response.data.models,
    }),
    getMyGenerations: builder.query({
      query: (params) => ({ url: '/api/generations', params }),
      transformResponse: (response) => ({
        generations: response.data.generations,
        meta: response.meta,
      }),
      providesTags: ['Generations'],
    }),
    createGeneration: builder.mutation({
      query: (body) => ({ url: '/api/generations', method: 'POST', body }),
      transformResponse: (response) => response.data.generation,
      invalidatesTags: ['Generations', 'Images', 'Wallet'],
    }),
  }),
});

export const {
  useGetGenerationOptionsQuery,
  useGetMyGenerationsQuery,
  useCreateGenerationMutation,
} = generationsApi;
