import { baseApi } from '@/store/baseApi';

export const generatorApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getImageOptions: builder.query({
      query: () => '/api/images/options',
      transformResponse: (response) => response.data,
      providesTags: ['ImageOptions'],
    }),
    generateImages: builder.mutation({
      query: (body) => ({ url: '/api/images/generate', method: 'POST', body }),
      transformResponse: (response) => response.data,
      invalidatesTags: () => ['Profile'],
    }),
  }),
});

export const { useGetImageOptionsQuery, useGenerateImagesMutation } =
  generatorApi;
