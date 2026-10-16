import { baseApi } from '@/store/baseApi';

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyNotifications: builder.query({
      query: () => '/api/notifications',
      transformResponse: (response) => ({
        notifications: response.data.notifications,
        unreadCount: response.meta.unreadCount,
      }),
      providesTags: ['Notifications', 'Wallet'],
    }),
    markNotificationRead: builder.mutation({
      query: (id) => ({ url: `/api/notifications/${id}/read`, method: 'POST' }),
      invalidatesTags: ['Notifications'],
    }),
    markAllNotificationsRead: builder.mutation({
      query: () => ({ url: '/api/notifications/read-all', method: 'POST' }),
      invalidatesTags: ['Notifications'],
    }),
  }),
});

export const {
  useGetMyNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} = notificationsApi;
