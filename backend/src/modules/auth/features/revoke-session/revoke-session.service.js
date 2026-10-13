import { NotFoundError } from '#src/utils/index.js';
import { SESSION_NOT_FOUND_MESSAGE } from '#src/modules/auth/auth.constants.js';
import { revokeAuthSessionFamilyRepository } from '#src/modules/auth-sessions/shared/repositories/index.js';

export async function revokeSessionService({ db, userId, familyId }) {
  const revokedCount = await revokeAuthSessionFamilyRepository({
    db,
    userId,
    familyId,
  });

  if (revokedCount === 0) {
    throw new NotFoundError(SESSION_NOT_FOUND_MESSAGE);
  }
}
