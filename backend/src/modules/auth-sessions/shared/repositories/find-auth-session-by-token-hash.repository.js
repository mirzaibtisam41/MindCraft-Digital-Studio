import { eq } from 'drizzle-orm';
import { authSessions } from '#src/modules/auth-sessions/auth-session.table.js';
import { users } from '#src/modules/users/user.table.js';

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
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        status: users.status,
        emailVerifiedAt: users.emailVerifiedAt,
        createdAt: users.createdAt,
      },
    })
    .from(authSessions)
    .innerJoin(users, eq(users.id, authSessions.userId))
    .where(eq(authSessions.refreshTokenHash, refreshTokenHash))
    .limit(1);

  return row ?? null;
}
