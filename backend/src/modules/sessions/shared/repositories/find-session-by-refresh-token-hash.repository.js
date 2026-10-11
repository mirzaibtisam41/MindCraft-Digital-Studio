import { eq } from 'drizzle-orm';
import { sessions } from '#src/modules/sessions/session.table.js';

export async function findSessionByRefreshTokenHashRepository({
  db,
  refreshTokenHash,
}) {
  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.refreshTokenHash, refreshTokenHash))
    .limit(1);

  return session ?? null;
}
