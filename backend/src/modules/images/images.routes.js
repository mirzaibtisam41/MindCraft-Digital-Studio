import fastifyMultipart from '@fastify/multipart';
import { checkUserIsLoggedInHook } from '#src/hooks/index.js';
import { uuidParamsSchema } from '#src/shared/schemas/uuid-params.schema.js';
import { IMAGE_UPLOAD_MAX_BYTES } from '#src/modules/images/image.constants.js';
import { deleteMyImageController } from '#src/modules/images/features/delete-my-image/delete-my-image.controller.js';
import { getMyImageController } from '#src/modules/images/features/get-my-image/get-my-image.controller.js';
import { listMyImagesController } from '#src/modules/images/features/list-my-images/list-my-images.controller.js';
import { listMyImagesQuerySchema } from '#src/modules/images/features/list-my-images/list-my-images.schema.js';
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

  fastify.get(
    '/:id',
    { schema: { params: uuidParamsSchema('id') } },
    getMyImageController,
  );

  fastify.delete(
    '/:id',
    { schema: { params: uuidParamsSchema('id') } },
    deleteMyImageController,
  );
}
