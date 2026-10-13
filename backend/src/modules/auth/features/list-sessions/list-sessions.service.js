import { listActiveAuthSessionsRepository } from '#src/modules/auth-sessions/shared/repositories/index.js';

export async function listSessionsService({ db, userId, currentFamilyId }) {
  const sessions = await listActiveAuthSessionsRepository({ db, userId });

  return sessions.map((session) => ({
    ...session,
    isCurrent: session.familyId === currentFamilyId,
  }));
}
