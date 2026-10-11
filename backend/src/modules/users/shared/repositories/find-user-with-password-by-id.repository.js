import { eq } from 'drizzle-orm';
import { users } from '#src/modules/users/user.table.js';
import { USER_COLUMNS } from '#src/modules/users/user-columns.constants.js';

export async function findUserWithPasswordByIdRepository({ db, id }) {
  const [user] = await db
    .select({ ...USER_COLUMNS, passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return user ?? null;
}
