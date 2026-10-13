import { logoutOtherSessionsService } from './logout-other-sessions.service.js';

export async function logoutOtherSessionsController(request, reply) {
  const result = await logoutOtherSessionsService({
    db: request.server.db,
    userId: request.user.id,
    currentFamilyId: request.sessionFamilyId,
  });

  return reply.success({
    data: result,
    message: 'Logged out from other devices',
  });
}
