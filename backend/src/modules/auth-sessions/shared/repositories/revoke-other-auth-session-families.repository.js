import { and, eq, isNull, ne } from 'drizzle-orm';
import { authSessions } from '#src/modules/auth-sessions/auth-session.table.js';

export async function revokeOtherAuthSessionFamiliesRepository({
  db,
  userId,
  currentFamilyId,
}) {
  const revokedSessions = await db
    .update(authSessions)
    .set({ revokedAt: new Date() })
    .where(
      and(
        eq(authSessions.userId, userId),
        ne(authSessions.familyId, currentFamilyId),
        isNull(authSessions.revokedAt),
      ),
    )
    .returning({ familyId: authSessions.familyId });

  return new Set(revokedSessions.map((session) => session.familyId)).size;
}
