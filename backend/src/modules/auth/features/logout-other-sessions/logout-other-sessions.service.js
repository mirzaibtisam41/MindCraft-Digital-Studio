import { revokeOtherAuthSessionFamiliesRepository } from '#src/modules/auth-sessions/shared/repositories/index.js';

export async function logoutOtherSessionsService({
  db,
  userId,
  currentFamilyId,
}) {
  const loggedOutCount = await revokeOtherAuthSessionFamiliesRepository({
    db,
    userId,
    currentFamilyId,
  });

  return { loggedOutCount };
}
