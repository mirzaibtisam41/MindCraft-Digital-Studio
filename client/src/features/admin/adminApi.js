import { baseApi } from '@/store/baseApi';
import { buildQueryString } from '@/lib/query';

function paged(response) {
  return { items: response.data, meta: response.meta };
}

const SIDE_EFFECT_TAGS = ['AdminOverview', 'AdminAudit'];

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminOverview: builder.query({
      query: () => '/api/admin/overview',
      transformResponse: (response) => response.data,
      providesTags: ['AdminOverview'],
    }),

    getAdminModels: builder.query({
      query: () => '/api/admin/models',
      transformResponse: (response) => response.data,
      providesTags: ['AdminModels'],
    }),
    createAdminModel: builder.mutation({
      query: (body) => ({ url: '/api/admin/models', method: 'POST', body }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['AdminModels', 'ImageOptions', ...SIDE_EFFECT_TAGS],
    }),
    updateAdminModel: builder.mutation({
      query: ({ id, body }) => ({
        url: `/api/admin/models/${id}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['AdminModels', 'ImageOptions', ...SIDE_EFFECT_TAGS],
    }),

    getAdminUsers: builder.query({
      query: (params) => `/api/admin/users${buildQueryString(params)}`,
      transformResponse: paged,
      providesTags: ['AdminUsers'],
    }),
    getAdminUser: builder.query({
      query: (id) => `/api/admin/users/${id}`,
      transformResponse: (response) => response.data,
      providesTags: (_result, _error, id) => [{ type: 'AdminUser', id }],
    }),
    updateAdminUser: builder.mutation({
      query: ({ id, body }) => ({
        url: `/api/admin/users/${id}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'AdminUser', id },
        'AdminUsers',
        ...SIDE_EFFECT_TAGS,
      ],
    }),
    adjustAdminUserCredits: builder.mutation({
      query: ({ id, body }) => ({
        url: `/api/admin/users/${id}/credits`,
        method: 'POST',
        body,
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'AdminUser', id },
        'AdminUsers',
        'AdminTransactions',
        'Profile',
        ...SIDE_EFFECT_TAGS,
      ],
    }),
    getAdminUserTransactions: builder.query({
      query: ({ id, ...params }) =>
        `/api/admin/users/${id}/credit-transactions${buildQueryString(params)}`,
      transformResponse: paged,
      providesTags: ['AdminTransactions'],
    }),

    getAdminGenerations: builder.query({
      query: (params) => `/api/admin/generations${buildQueryString(params)}`,
      transformResponse: paged,
      providesTags: ['AdminGenerations'],
    }),
    getAdminGeneration: builder.query({
      query: (id) => `/api/admin/generations/${id}`,
      transformResponse: (response) => response.data,
      providesTags: ['AdminGenerations'],
    }),

    getAdminAuditLogs: builder.query({
      query: (params) => `/api/admin/audit-logs${buildQueryString(params)}`,
      transformResponse: paged,
      providesTags: ['AdminAudit'],
    }),

    getAdminSettings: builder.query({
      query: () => '/api/admin/settings',
      transformResponse: (response) => response.data,
      providesTags: ['AdminSettings'],
    }),
    updateAdminSettings: builder.mutation({
      query: (body) => ({ url: '/api/admin/settings', method: 'PATCH', body }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['AdminSettings', 'AdminAudit'],
    }),
  }),
});

export const {
  useGetAdminOverviewQuery,
  useGetAdminModelsQuery,
  useCreateAdminModelMutation,
  useUpdateAdminModelMutation,
  useGetAdminUsersQuery,
  useGetAdminUserQuery,
  useUpdateAdminUserMutation,
  useAdjustAdminUserCreditsMutation,
  useGetAdminUserTransactionsQuery,
  useGetAdminGenerationsQuery,
  useGetAdminGenerationQuery,
  useGetAdminAuditLogsQuery,
  useGetAdminSettingsQuery,
  useUpdateAdminSettingsMutation,
} = adminApi;
