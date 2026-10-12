import { eq, sql } from 'drizzle-orm';
import { users } from '#src/modules/users/user.table.js';

export async function addUserCreditsRepository({ db, userId, amount }) {
  const [user] = await db
    .update(users)
    .set({ creditBalance: sql`${users.creditBalance} + ${amount}` })
    .where(eq(users.id, userId))
    .returning({ creditBalance: users.creditBalance });

  return user ?? null;
}
