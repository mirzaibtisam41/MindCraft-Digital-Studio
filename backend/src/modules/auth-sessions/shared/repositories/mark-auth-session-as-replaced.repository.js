import { and, eq, isNull } from 'drizzle-orm';
import { authSessions } from '#src/modules/auth-sessions/auth-session.table.js';

export async function markAuthSessionAsReplacedRepository({
  db,
  sessionId,
  replacedById,
}) {
  const now = new Date();

  const [session] = await db
    .update(authSessions)
    .set({ replacedById, revokedAt: now, lastUsedAt: now })
    .where(and(eq(authSessions.id, sessionId), isNull(authSessions.revokedAt)))
    .returning({ id: authSessions.id });

  return session ?? null;
}
