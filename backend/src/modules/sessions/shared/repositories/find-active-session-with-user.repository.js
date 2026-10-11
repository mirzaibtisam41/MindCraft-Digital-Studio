import { and, eq, gt, isNull } from 'drizzle-orm';
import { sessions } from '#src/modules/sessions/session.table.js';
import { users } from '#src/modules/users/user.table.js';
import { USER_COLUMNS } from '#src/modules/users/user-columns.constants.js';

export async function findActiveSessionWithUserRepository({ db, id, userId }) {
  const [activeSession] = await db
    .select({ sessionId: sessions.id, user: USER_COLUMNS })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(
      and(
        eq(sessions.id, id),
        eq(sessions.userId, userId),
        isNull(sessions.revokedAt),
        gt(sessions.expiresAt, new Date()),
      ),
    )
    .limit(1);

  return activeSession ?? null;
}
