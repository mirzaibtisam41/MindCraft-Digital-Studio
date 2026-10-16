import { baseApi } from '@/store/baseApi';

const PROJECT_CHANGE_TAGS = ['Projects', 'ProjectImages'];

export const projectsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProjects: builder.query({
      query: (params) => ({ url: '/api/projects', params }),
      transformResponse: (response) => ({
        projects: response.data.projects,
        meta: response.meta,
      }),
      providesTags: ['Projects'],
    }),
    getProject: builder.query({
      query: (projectId) => `/api/projects/${projectId}`,
      transformResponse: (response) => response.data.project,
      providesTags: ['Projects'],
    }),
    createProject: builder.mutation({
      query: (body) => ({ url: '/api/projects', method: 'POST', body }),
      transformResponse: (response) => response.data.project,
      invalidatesTags: ['Projects'],
    }),
    updateProject: builder.mutation({
      query: ({ projectId, ...body }) => ({
        url: `/api/projects/${projectId}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response) => response.data.project,
      invalidatesTags: ['Projects'],
    }),
    deleteProject: builder.mutation({
      query: (projectId) => ({
        url: `/api/projects/${projectId}`,
        method: 'DELETE',
      }),
      invalidatesTags: PROJECT_CHANGE_TAGS,
    }),
    getProjectImages: builder.query({
      query: ({ projectId, ...params }) => ({
        url: `/api/projects/${projectId}/images`,
        params,
      }),
      transformResponse: (response) => ({
        images: response.data.images,
        meta: response.meta,
      }),
      providesTags: ['ProjectImages'],
    }),
    addProjectImages: builder.mutation({
      query: ({ projectId, imageIds, collectionId }) => ({
        url: `/api/projects/${projectId}/images`,
        method: 'POST',
        body: { imageIds, ...(collectionId ? { collectionId } : {}) },
      }),
      transformResponse: (response) => response.data.addedIds,
      invalidatesTags: PROJECT_CHANGE_TAGS,
    }),
    removeProjectImages: builder.mutation({
      query: ({ projectId, imageIds }) => ({
        url: `/api/projects/${projectId}/images/remove`,
        method: 'POST',
        body: { imageIds },
      }),
      transformResponse: (response) => response.data.removedIds,
      invalidatesTags: PROJECT_CHANGE_TAGS,
    }),
    moveProjectImages: builder.mutation({
      query: ({ projectId, imageIds, collectionId }) => ({
        url: `/api/projects/${projectId}/images/collection`,
        method: 'PATCH',
        body: { imageIds, collectionId },
      }),
      transformResponse: (response) => response.data.movedIds,
      invalidatesTags: PROJECT_CHANGE_TAGS,
    }),
    createCollection: builder.mutation({
      query: ({ projectId, name }) => ({
        url: `/api/projects/${projectId}/collections`,
        method: 'POST',
        body: { name },
      }),
      transformResponse: (response) => response.data.collection,
      invalidatesTags: ['Projects'],
    }),
    renameCollection: builder.mutation({
      query: ({ projectId, collectionId, name }) => ({
        url: `/api/projects/${projectId}/collections/${collectionId}`,
        method: 'PATCH',
        body: { name },
      }),
      transformResponse: (response) => response.data.collection,
      invalidatesTags: ['Projects'],
    }),
    deleteCollection: builder.mutation({
      query: ({ projectId, collectionId }) => ({
        url: `/api/projects/${projectId}/collections/${collectionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: PROJECT_CHANGE_TAGS,
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetProjectQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useGetProjectImagesQuery,
  useAddProjectImagesMutation,
  useRemoveProjectImagesMutation,
  useMoveProjectImagesMutation,
  useCreateCollectionMutation,
  useRenameCollectionMutation,
  useDeleteCollectionMutation,
} = projectsApi;
