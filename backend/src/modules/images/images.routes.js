import { checkUserIsLoggedInHook } from '#src/hooks/index.js';
import { getImageUrlController } from './features/get-image-url/get-image-url.controller.js';
import { getImageUrlParamsSchema } from './features/get-image-url/get-image-url.schema.js';

export function imagesRoutes(fastify) {
  fastify.addHook('onRequest', checkUserIsLoggedInHook);

  fastify.get(
    '/:id/url',
    { schema: { params: getImageUrlParamsSchema } },
    getImageUrlController,
  );
}
