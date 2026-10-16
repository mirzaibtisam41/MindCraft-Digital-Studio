import { getMyUsageService } from '#src/modules/usage/features/get-my-usage/get-my-usage.service.js';

export async function getMyUsageController(request, reply) {
  const usage = await getMyUsageService({
    db: request.server.db,
    userId: request.user.id,
    query: request.query,
  });

  return reply.success({ data: usage });
}
