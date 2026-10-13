import { baseApi } from '@/store/baseApi';

export const walletApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyWallet: builder.query({
      query: ({ page = 1, limit = 20 } = {}) => ({
        url: '/api/wallet',
        params: { page, limit },
      }),
      transformResponse: (response) => ({
        balance: response.data.balance,
        transactions: response.data.transactions,
        meta: response.meta,
      }),
      providesTags: ['Wallet'],
    }),
  }),
});

export const { useGetMyWalletQuery } = walletApi;
