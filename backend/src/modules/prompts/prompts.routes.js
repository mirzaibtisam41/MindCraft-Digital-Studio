import { checkUserIsLoggedInHook } from '#src/hooks/index.js';
import { uuidParamsSchema } from '#src/shared/schemas/uuid-params.schema.js';
import { createPromptController } from '#src/modules/prompts/features/create-prompt/create-prompt.controller.js';
import { createPromptBodySchema } from '#src/modules/prompts/features/create-prompt/create-prompt.schema.js';
import { deleteMyPromptController } from '#src/modules/prompts/features/delete-my-prompt/delete-my-prompt.controller.js';
import { enhancePromptController } from '#src/modules/prompts/features/enhance-prompt/enhance-prompt.controller.js';
import { enhancePromptBodySchema } from '#src/modules/prompts/features/enhance-prompt/enhance-prompt.schema.js';
import { getPromptOptionsController } from '#src/modules/prompts/features/get-prompt-options/get-prompt-options.controller.js';
import { listMyPromptsController } from '#src/modules/prompts/features/list-my-prompts/list-my-prompts.controller.js';
import { listMyPromptsQuerySchema } from '#src/modules/prompts/features/list-my-prompts/list-my-prompts.schema.js';
import { updateMyPromptController } from '#src/modules/prompts/features/update-my-prompt/update-my-prompt.controller.js';
import { updateMyPromptBodySchema } from '#src/modules/prompts/features/update-my-prompt/update-my-prompt.schema.js';
import { useMyPromptController } from '#src/modules/prompts/features/use-my-prompt/use-my-prompt.controller.js';

export function promptsRoutes(fastify) {
  fastify.addHook('onRequest', checkUserIsLoggedInHook);

  fastify.post(
    '/enhance',
    {
      schema: { body: enhancePromptBodySchema },
      config: { rateLimit: { max: 20, timeWindow: '1 minute' } },
    },
    enhancePromptController,
  );

  fastify.get('/options', getPromptOptionsController);

  fastify.get(
    '/',
    { schema: { querystring: listMyPromptsQuerySchema } },
    listMyPromptsController,
  );

  fastify.post(
    '/',
    { schema: { body: createPromptBodySchema } },
    createPromptController,
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        params: uuidParamsSchema('id'),
        body: updateMyPromptBodySchema,
      },
    },
    updateMyPromptController,
  );

  fastify.delete(
    '/:id',
    { schema: { params: uuidParamsSchema('id') } },
    deleteMyPromptController,
  );

  fastify.post(
    '/:id/use',
    { schema: { params: uuidParamsSchema('id') } },
    useMyPromptController,
  );
}
