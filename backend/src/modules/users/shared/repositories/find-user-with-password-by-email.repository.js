import { eq, sql } from 'drizzle-orm';
import { users } from '#src/modules/users/user.table.js';
import { USER_COLUMNS } from '#src/modules/users/user-columns.constants.js';

export async function findUserWithPasswordByEmailRepository({ db, email }) {
  const [user] = await db
    .select({ ...USER_COLUMNS, passwordHash: users.passwordHash })
    .from(users)
    .where(eq(sql`lower(${users.email})`, email))
    .limit(1);

  return user ?? null;
}
