import { listSessionsService } from '#src/modules/auth/features/list-sessions/list-sessions.service.js';

export async function listSessionsController(request, reply) {
  const sessions = await listSessionsService({
    db: request.server.db,
    userId: request.user.id,
    currentFamilyId: request.sessionFamilyId,
  });

  return reply.success({ data: { sessions } });
}
