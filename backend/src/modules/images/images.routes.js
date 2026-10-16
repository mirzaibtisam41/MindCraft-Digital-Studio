import fastifyMultipart from '@fastify/multipart';
import { checkUserIsLoggedInHook } from '#src/hooks/index.js';
import { uuidParamsSchema } from '#src/shared/schemas/uuid-params.schema.js';
import { IMAGE_UPLOAD_MAX_BYTES } from '#src/modules/images/image.constants.js';
import { bulkDeleteMyImagesController } from '#src/modules/images/features/bulk-delete-my-images/bulk-delete-my-images.controller.js';
import { bulkDeleteMyImagesBodySchema } from '#src/modules/images/features/bulk-delete-my-images/bulk-delete-my-images.schema.js';
import { bulkFavoriteMyImagesController } from '#src/modules/images/features/bulk-favorite-my-images/bulk-favorite-my-images.controller.js';
import { bulkFavoriteMyImagesBodySchema } from '#src/modules/images/features/bulk-favorite-my-images/bulk-favorite-my-images.schema.js';
import { deleteMyImageController } from '#src/modules/images/features/delete-my-image/delete-my-image.controller.js';
import { getMyImageController } from '#src/modules/images/features/get-my-image/get-my-image.controller.js';
import { getMyImageDownloadController } from '#src/modules/images/features/get-my-image-download/get-my-image-download.controller.js';
import { listMyImagesController } from '#src/modules/images/features/list-my-images/list-my-images.controller.js';
import { listMyImagesQuerySchema } from '#src/modules/images/features/list-my-images/list-my-images.schema.js';
import { updateMyImageController } from '#src/modules/images/features/update-my-image/update-my-image.controller.js';
import { updateMyImageBodySchema } from '#src/modules/images/features/update-my-image/update-my-image.schema.js';
import { uploadImageController } from '#src/modules/images/features/upload-image/upload-image.controller.js';

export async function imagesRoutes(fastify) {
  await fastify.register(fastifyMultipart, {
    limits: { fileSize: IMAGE_UPLOAD_MAX_BYTES, files: 1, fields: 0 },
  });

  fastify.addHook('onRequest', checkUserIsLoggedInHook);

  fastify.post('/', uploadImageController);

  fastify.get(
    '/',
    { schema: { querystring: listMyImagesQuerySchema } },
    listMyImagesController,
  );

  fastify.post(
    '/bulk-favorite',
    { schema: { body: bulkFavoriteMyImagesBodySchema } },
    bulkFavoriteMyImagesController,
  );

  fastify.post(
    '/bulk-delete',
    { schema: { body: bulkDeleteMyImagesBodySchema } },
    bulkDeleteMyImagesController,
  );

  fastify.get(
    '/:id',
    { schema: { params: uuidParamsSchema('id') } },
    getMyImageController,
  );

  fastify.patch(
    '/:id',
    {
      schema: { params: uuidParamsSchema('id'), body: updateMyImageBodySchema },
    },
    updateMyImageController,
  );

  fastify.get(
    '/:id/download',
    { schema: { params: uuidParamsSchema('id') } },
    getMyImageDownloadController,
  );

  fastify.delete(
    '/:id',
    { schema: { params: uuidParamsSchema('id') } },
    deleteMyImageController,
  );
}
