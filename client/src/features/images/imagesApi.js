import { baseApi } from '@/store/baseApi';

export const imagesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyImages: builder.query({
      query: (params) => ({ url: '/api/images', params }),
      transformResponse: (response) => ({
        images: response.data.images,
        meta: response.meta,
      }),
      providesTags: ['Images'],
    }),
    getImage: builder.query({
      query: (id) => `/api/images/${id}`,
      transformResponse: (response) => response.data.image,
      providesTags: ['Images'],
    }),
    getImageHistory: builder.query({
      query: (id) => `/api/images/${id}/history`,
      transformResponse: (response) => response.data.steps,
      providesTags: ['Images'],
    }),
    uploadImage: builder.mutation({
      query: (file) => {
        const body = new FormData();
        body.append('file', file);

        return { url: '/api/images', method: 'POST', body };
      },
      transformResponse: (response) => response.data.image,
      invalidatesTags: ['Images'],
    }),
    setImageFavorite: builder.mutation({
      query: ({ id, isFavorite }) => ({
        url: `/api/images/${id}`,
        method: 'PATCH',
        body: { isFavorite },
      }),
      transformResponse: (response) => response.data.image,
      invalidatesTags: ['Images', 'Generations', 'Projects', 'ProjectImages'],
    }),
    bulkFavoriteImages: builder.mutation({
      query: ({ ids, isFavorite }) => ({
        url: '/api/images/bulk-favorite',
        method: 'POST',
        body: { ids, isFavorite },
      }),
      transformResponse: (response) => response.data.updatedIds,
      invalidatesTags: ['Images', 'ProjectImages'],
    }),
    bulkDeleteImages: builder.mutation({
      query: (ids) => ({
        url: '/api/images/bulk-delete',
        method: 'POST',
        body: { ids },
      }),
      transformResponse: (response) => response.data.deletedIds,
      invalidatesTags: ['Images', 'Generations', 'Projects', 'ProjectImages'],
    }),
    deleteImage: builder.mutation({
      query: (id) => ({ url: `/api/images/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Images', 'Generations', 'Projects', 'ProjectImages'],
    }),
    getImageDownloadUrl: builder.mutation({
      query: (id) => `/api/images/${id}/download`,
      transformResponse: (response) => response.data.url,
    }),
  }),
});

export const {
  useGetMyImagesQuery,
  useGetImageQuery,
  useGetImageHistoryQuery,
  useUploadImageMutation,
  useSetImageFavoriteMutation,
  useBulkFavoriteImagesMutation,
  useBulkDeleteImagesMutation,
  useDeleteImageMutation,
  useGetImageDownloadUrlMutation,
} = imagesApi;
