import { baseApi } from '@/store/baseApi';

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: (params) => ({ url: '/api/admin/users', params }),
      transformResponse: (response) => ({
        users: response.data.users,
        meta: response.meta,
      }),
      providesTags: ['Users'],
    }),
    getUser: builder.query({
      query: (userId) => `/api/admin/users/${userId}`,
      transformResponse: (response) => response.data.user,
      providesTags: ['Users'],
    }),
    updateUserStatus: builder.mutation({
      query: ({ userId, status }) => ({
        url: `/api/admin/users/${userId}/status`,
        method: 'PATCH',
        body: { status },
      }),
      transformResponse: (response) => response.data.user,
      invalidatesTags: ['Users'],
    }),
    updateUserRole: builder.mutation({
      query: ({ userId, role }) => ({
        url: `/api/admin/users/${userId}/role`,
        method: 'PATCH',
        body: { role },
      }),
      transformResponse: (response) => response.data.user,
      invalidatesTags: ['Users'],
    }),
    getUserWallet: builder.query({
      query: ({ userId, page = 1, limit = 10 }) => ({
        url: `/api/admin/users/${userId}/wallet`,
        params: { page, limit },
      }),
      transformResponse: (response) => ({
        balance: response.data.balance,
        transactions: response.data.transactions,
        meta: response.meta,
      }),
      providesTags: ['UserWallet'],
    }),
    adjustUserCredits: builder.mutation({
      query: ({ userId, amount, reason }) => ({
        url: `/api/admin/users/${userId}/credit-adjustments`,
        method: 'POST',
        body: { amount, reason },
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['Users', 'UserWallet', 'Wallet'],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserQuery,
  useUpdateUserStatusMutation,
  useUpdateUserRoleMutation,
  useGetUserWalletQuery,
  useAdjustUserCreditsMutation,
} = usersApi;
