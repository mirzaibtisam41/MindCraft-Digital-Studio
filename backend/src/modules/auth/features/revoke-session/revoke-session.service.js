import { NotFoundError } from '#src/utils/index.js';
import { revokeAuthSessionFamilyRepository } from '#src/modules/auth-sessions/shared/repositories/index.js';

export async function revokeSessionService({ db, userId, familyId }) {
  const revokedCount = await revokeAuthSessionFamilyRepository({
    db,
    userId,
    familyId,
  });

  if (revokedCount === 0) {
    throw new NotFoundError('Session not found');
  }
}
