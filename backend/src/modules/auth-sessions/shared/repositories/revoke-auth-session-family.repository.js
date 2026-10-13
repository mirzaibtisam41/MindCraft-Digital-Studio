import { and, eq, isNull } from 'drizzle-orm';
import { authSessions } from '#src/modules/auth-sessions/auth-session.table.js';

export async function revokeAuthSessionFamilyRepository({ db, familyId }) {
  await db
    .update(authSessions)
    .set({ revokedAt: new Date() })
    .where(
      and(eq(authSessions.familyId, familyId), isNull(authSessions.revokedAt)),
    );
}
