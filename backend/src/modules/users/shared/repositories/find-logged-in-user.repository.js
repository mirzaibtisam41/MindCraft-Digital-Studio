import { and, eq, exists, gt, isNull } from 'drizzle-orm';
import { users } from '#src/modules/users/user.table.js';
import { authSessions } from '#src/modules/auth-sessions/auth-session.table.js';

export async function findLoggedInUserRepository({ db, userId, familyId }) {
  const activeSessionInFamily = db
    .select({ id: authSessions.id })
    .from(authSessions)
    .where(
      and(
        eq(authSessions.familyId, familyId),
        eq(authSessions.userId, userId),
        isNull(authSessions.revokedAt),
        gt(authSessions.expiresAt, new Date()),
      ),
    );

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      status: users.status,
      emailVerifiedAt: users.emailVerifiedAt,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(and(eq(users.id, userId), exists(activeSessionInFamily)))
    .limit(1);

  return user ?? null;
}
