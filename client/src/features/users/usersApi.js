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
  }),
});

export const { useGetUsersQuery } = usersApi;
