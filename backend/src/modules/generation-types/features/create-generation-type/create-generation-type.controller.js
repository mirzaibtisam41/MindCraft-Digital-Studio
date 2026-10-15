import { StatusCodes } from 'http-status-codes';
import { createGenerationTypeService } from '#src/modules/generation-types/features/create-generation-type/create-generation-type.service.js';

export async function createGenerationTypeController(request, reply) {
  const generationType = await createGenerationTypeService({
    db: request.server.db,
    data: request.body,
  });

  return reply.success({
    data: { generationType },
    message: 'Generation type created',
    statusCode: StatusCodes.CREATED,
  });
}
