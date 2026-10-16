import { StatusCodes } from 'http-status-codes';
import { createGenerationService } from '#src/modules/generations/features/create-generation/create-generation.service.js';

export async function createGenerationController(request, reply) {
  const generation = await createGenerationService({
    server: request.server,
    log: request.log,
    userId: request.user.id,
    data: request.body,
  });

  return reply.success({
    data: { generation },
    message:
      generation.images.length === 1
        ? 'Image generated'
        : `${generation.images.length} images generated`,
    statusCode: StatusCodes.CREATED,
  });
}
