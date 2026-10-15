import { eq } from 'drizzle-orm';
import { authSessions } from '#src/modules/auth-sessions/auth-session.table.js';
import { users } from '#src/modules/users/user.table.js';
import { USER_COLUMNS } from '#src/modules/users/user-columns.constants.js';

export async function findAuthSessionByTokenHashRepository({
  db,
  refreshTokenHash,
}) {
  const [row] = await db
    .select({
      session: {
        id: authSessions.id,
        familyId: authSessions.familyId,
        replacedById: authSessions.replacedById,
        expiresAt: authSessions.expiresAt,
        revokedAt: authSessions.revokedAt,
      },
      user: USER_COLUMNS,
    })
    .from(authSessions)
    .innerJoin(users, eq(users.id, authSessions.userId))
    .where(eq(authSessions.refreshTokenHash, refreshTokenHash))
    .limit(1);

  return row ?? null;
}
