import { StatusCodes } from 'http-status-codes';
import { createAiProviderService } from './create-ai-provider.service.js';

export async function createAiProviderController(request, reply) {
  const provider = await createAiProviderService({
    db: request.server.db,
    data: request.body,
  });

  return reply.success({
    data: { provider },
    message: 'Provider created',
    statusCode: StatusCodes.CREATED,
  });
}
