import { checkUserIsLoggedInHook } from '#src/hooks/index.js';
import { uuidParamsSchema } from '#src/shared/schemas/uuid-params.schema.js';
import { projectCollectionBodySchema } from '#src/modules/projects/shared/schemas/project-fields.schema.js';
import { addProjectImagesController } from '#src/modules/projects/features/add-project-images/add-project-images.controller.js';
import { addProjectImagesBodySchema } from '#src/modules/projects/features/add-project-images/add-project-images.schema.js';
import { createProjectController } from '#src/modules/projects/features/create-project/create-project.controller.js';
import { createProjectBodySchema } from '#src/modules/projects/features/create-project/create-project.schema.js';
import { createProjectCollectionController } from '#src/modules/projects/features/create-project-collection/create-project-collection.controller.js';
import { deleteMyProjectController } from '#src/modules/projects/features/delete-my-project/delete-my-project.controller.js';
import { deleteProjectCollectionController } from '#src/modules/projects/features/delete-project-collection/delete-project-collection.controller.js';
import { getMyProjectController } from '#src/modules/projects/features/get-my-project/get-my-project.controller.js';
import { listMyProjectsController } from '#src/modules/projects/features/list-my-projects/list-my-projects.controller.js';
import { listMyProjectsQuerySchema } from '#src/modules/projects/features/list-my-projects/list-my-projects.schema.js';
import { listProjectImagesController } from '#src/modules/projects/features/list-project-images/list-project-images.controller.js';
import { listProjectImagesQuerySchema } from '#src/modules/projects/features/list-project-images/list-project-images.schema.js';
import { moveProjectImagesController } from '#src/modules/projects/features/move-project-images/move-project-images.controller.js';
import { moveProjectImagesBodySchema } from '#src/modules/projects/features/move-project-images/move-project-images.schema.js';
import { removeProjectImagesController } from '#src/modules/projects/features/remove-project-images/remove-project-images.controller.js';
import { removeProjectImagesBodySchema } from '#src/modules/projects/features/remove-project-images/remove-project-images.schema.js';
import { renameProjectCollectionController } from '#src/modules/projects/features/rename-project-collection/rename-project-collection.controller.js';
import { updateMyProjectController } from '#src/modules/projects/features/update-my-project/update-my-project.controller.js';
import { updateMyProjectBodySchema } from '#src/modules/projects/features/update-my-project/update-my-project.schema.js';

const projectParams = uuidParamsSchema('projectId');
const collectionParams = uuidParamsSchema('projectId', 'collectionId');

export function projectsRoutes(fastify) {
  fastify.addHook('onRequest', checkUserIsLoggedInHook);

  fastify.post(
    '/',
    { schema: { body: createProjectBodySchema } },
    createProjectController,
  );

  fastify.get(
    '/',
    { schema: { querystring: listMyProjectsQuerySchema } },
    listMyProjectsController,
  );

  fastify.get(
    '/:projectId',
    { schema: { params: projectParams } },
    getMyProjectController,
  );

  fastify.patch(
    '/:projectId',
    { schema: { params: projectParams, body: updateMyProjectBodySchema } },
    updateMyProjectController,
  );

  fastify.delete(
    '/:projectId',
    { schema: { params: projectParams } },
    deleteMyProjectController,
  );

  fastify.get(
    '/:projectId/images',
    {
      schema: {
        params: projectParams,
        querystring: listProjectImagesQuerySchema,
      },
    },
    listProjectImagesController,
  );

  fastify.post(
    '/:projectId/images',
    { schema: { params: projectParams, body: addProjectImagesBodySchema } },
    addProjectImagesController,
  );

  fastify.post(
    '/:projectId/images/remove',
    { schema: { params: projectParams, body: removeProjectImagesBodySchema } },
    removeProjectImagesController,
  );

  fastify.patch(
    '/:projectId/images/collection',
    { schema: { params: projectParams, body: moveProjectImagesBodySchema } },
    moveProjectImagesController,
  );

  fastify.post(
    '/:projectId/collections',
    { schema: { params: projectParams, body: projectCollectionBodySchema } },
    createProjectCollectionController,
  );

  fastify.patch(
    '/:projectId/collections/:collectionId',
    { schema: { params: collectionParams, body: projectCollectionBodySchema } },
    renameProjectCollectionController,
  );

  fastify.delete(
    '/:projectId/collections/:collectionId',
    { schema: { params: collectionParams } },
    deleteProjectCollectionController,
  );
}
