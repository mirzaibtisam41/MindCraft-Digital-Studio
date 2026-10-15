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
    uploadImage: builder.mutation({
      query: (file) => {
        const body = new FormData();
        body.append('file', file);

        return { url: '/api/images', method: 'POST', body };
      },
      transformResponse: (response) => response.data.image,
      invalidatesTags: ['Images'],
    }),
    deleteImage: builder.mutation({
      query: (id) => ({ url: `/api/images/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Images'],
    }),
  }),
});

export const {
  useGetMyImagesQuery,
  useUploadImageMutation,
  useDeleteImageMutation,
} = imagesApi;
