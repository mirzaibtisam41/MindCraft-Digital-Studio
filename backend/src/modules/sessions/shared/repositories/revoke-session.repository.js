import { and, eq, isNull } from 'drizzle-orm';
import { sessions } from '#src/modules/sessions/session.table.js';

export async function revokeSessionRepository({ db, id }) {
  const [session] = await db
    .update(sessions)
    .set({ revokedAt: new Date() })
    .where(and(eq(sessions.id, id), isNull(sessions.revokedAt)))
    .returning({ id: sessions.id });

  return session ?? null;
}
