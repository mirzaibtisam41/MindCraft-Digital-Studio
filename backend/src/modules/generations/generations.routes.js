import { checkUserIsLoggedInHook } from '#src/hooks/index.js';
import { generateImagesController } from './features/generate-images/generate-images.controller.js';
import { generateImagesBodySchema } from './features/generate-images/generate-images.schema.js';
import { getGenerationController } from './features/get-generation/get-generation.controller.js';
import { getGenerationParamsSchema } from './features/get-generation/get-generation.schema.js';

export function generationsRoutes(fastify) {
  fastify.addHook('onRequest', checkUserIsLoggedInHook);

  fastify.post(
    '/generate',
    { schema: { body: generateImagesBodySchema } },
    generateImagesController,
  );

  fastify.get(
    '/generations/:id',
    { schema: { params: getGenerationParamsSchema } },
    getGenerationController,
  );
}
