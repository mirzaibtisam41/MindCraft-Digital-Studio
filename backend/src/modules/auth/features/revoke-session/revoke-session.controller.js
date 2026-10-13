import { revokeSessionService } from './revoke-session.service.js';

export async function revokeSessionController(request, reply) {
  await revokeSessionService({
    db: request.server.db,
    userId: request.user.id,
    familyId: request.params.familyId,
  });

  return reply.success({ message: 'Session logged out' });
}
