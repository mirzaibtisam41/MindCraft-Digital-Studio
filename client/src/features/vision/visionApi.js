import { baseApi } from '@/store/baseApi';

export const visionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getVisionOptions: builder.query({
      query: () => '/api/vision/options',
      transformResponse: (response) => response.data,
    }),
    getImageAnalyses: builder.query({
      query: (imageId) => ({
        url: '/api/vision/analyses',
        params: { imageId },
      }),
      transformResponse: (response) => response.data.analyses,
      providesTags: ['ImageAnalyses'],
    }),
    createImageAnalysis: builder.mutation({
      query: (body) => ({ url: '/api/vision/analyses', method: 'POST', body }),
      transformResponse: (response) => response.data.analysis,
      invalidatesTags: ['ImageAnalyses', 'Wallet'],
    }),
  }),
});

export const {
  useGetVisionOptionsQuery,
  useGetImageAnalysesQuery,
  useCreateImageAnalysisMutation,
} = visionApi;
