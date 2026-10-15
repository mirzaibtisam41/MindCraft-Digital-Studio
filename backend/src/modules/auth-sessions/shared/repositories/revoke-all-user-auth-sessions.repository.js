import { and, eq, isNull } from 'drizzle-orm';
import { authSessions } from '#src/modules/auth-sessions/auth-session.table.js';

export async function revokeAllUserAuthSessionsRepository({ db, userId }) {
  const revokedSessions = await db
    .update(authSessions)
    .set({ revokedAt: new Date() })
    .where(and(eq(authSessions.userId, userId), isNull(authSessions.revokedAt)))
    .returning({ id: authSessions.id });

  return revokedSessions.length;
}
