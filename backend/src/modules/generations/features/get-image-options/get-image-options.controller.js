import { getImageOptionsService } from './get-image-options.service.js';

export async function getImageOptionsController(request, reply) {
  const data = await getImageOptionsService({
    fastify: request.server,
    userId: request.user.id,
  });

  return reply.success({ data });
}
