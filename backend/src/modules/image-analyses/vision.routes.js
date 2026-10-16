import { checkUserIsLoggedInHook } from '#src/hooks/index.js';
import { createImageAnalysisController } from '#src/modules/image-analyses/features/create-image-analysis/create-image-analysis.controller.js';
import { createImageAnalysisBodySchema } from '#src/modules/image-analyses/features/create-image-analysis/create-image-analysis.schema.js';
import { getVisionOptionsController } from '#src/modules/image-analyses/features/get-vision-options/get-vision-options.controller.js';
import { listImageAnalysesController } from '#src/modules/image-analyses/features/list-image-analyses/list-image-analyses.controller.js';
import { listImageAnalysesQuerySchema } from '#src/modules/image-analyses/features/list-image-analyses/list-image-analyses.schema.js';

export function visionRoutes(fastify) {
  fastify.addHook('onRequest', checkUserIsLoggedInHook);

  fastify.get('/options', getVisionOptionsController);

  fastify.post(
    '/analyses',
    { schema: { body: createImageAnalysisBodySchema } },
    createImageAnalysisController,
  );

  fastify.get(
    '/analyses',
    { schema: { querystring: listImageAnalysesQuerySchema } },
    listImageAnalysesController,
  );
}
