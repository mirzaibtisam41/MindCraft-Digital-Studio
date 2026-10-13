import { eq, sql } from 'drizzle-orm';
import { users } from '#src/modules/users/user.table.js';

export async function findUserByEmailRepository({ db, email }) {
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(sql`lower(${users.email})`, email))
    .limit(1);

  return user ?? null;
}
