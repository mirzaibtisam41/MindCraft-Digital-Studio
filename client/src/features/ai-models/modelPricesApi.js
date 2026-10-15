import { baseApi } from '@/store/baseApi';

export const modelPricesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getModelPrices: builder.query({
      query: (modelId) => `/api/admin/models/${modelId}/prices`,
      transformResponse: (response) => response.data.prices,
      providesTags: ['ModelPrices'],
    }),
    saveWorkflowPrices: builder.mutation({
      query: ({ modelId, typeId, prices }) => ({
        url: `/api/admin/models/${modelId}/workflows/${typeId}/prices`,
        method: 'PUT',
        body: { prices },
      }),
      invalidatesTags: ['ModelPrices'],
    }),
  }),
});

export const { useGetModelPricesQuery, useSaveWorkflowPricesMutation } =
  modelPricesApi;
