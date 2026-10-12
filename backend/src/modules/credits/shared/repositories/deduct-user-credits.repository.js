import { and, eq, gte, sql } from 'drizzle-orm';
import { users } from '#src/modules/users/user.table.js';

export async function deductUserCreditsRepository({ db, userId, amount }) {
  const [user] = await db
    .update(users)
    .set({ creditBalance: sql`${users.creditBalance} - ${amount}` })
    .where(and(eq(users.id, userId), gte(users.creditBalance, amount)))
    .returning({ creditBalance: users.creditBalance });

  return user ?? null;
}
