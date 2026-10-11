import { and, eq, isNull, ne } from 'drizzle-orm';
import { sessions } from '#src/modules/sessions/session.table.js';

export async function revokeUserSessionsRepository({
  db,
  userId,
  exceptSessionId,
}) {
  const conditions = [eq(sessions.userId, userId), isNull(sessions.revokedAt)];

  if (exceptSessionId) conditions.push(ne(sessions.id, exceptSessionId));

  await db
    .update(sessions)
    .set({ revokedAt: new Date() })
    .where(and(...conditions));
}
