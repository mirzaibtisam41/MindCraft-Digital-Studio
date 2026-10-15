import { and, eq, gt, isNull } from 'drizzle-orm';
import { users } from '#src/modules/users/user.table.js';
import { USER_WITH_BALANCE_COLUMNS } from '#src/modules/users/user-columns.constants.js';
import { creditWallets } from '#src/modules/credit-wallets/credit-wallet.table.js';
import { authSessions } from '#src/modules/auth-sessions/auth-session.table.js';

export async function findUserByIdRepository({ db, id }) {
  const [user] = await db
    .select({
      ...USER_WITH_BALANCE_COLUMNS,
      activeSessionCount: db.$count(
        authSessions,
        and(
          eq(authSessions.userId, users.id),
          isNull(authSessions.revokedAt),
          gt(authSessions.expiresAt, new Date()),
        ),
      ),
    })
    .from(users)
    .leftJoin(creditWallets, eq(creditWallets.userId, users.id))
    .where(eq(users.id, id))
    .limit(1);

  return user ?? null;
}
