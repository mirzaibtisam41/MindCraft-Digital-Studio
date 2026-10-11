import { eq } from 'drizzle-orm';
import { users } from '#src/modules/users/user.table.js';
import { USER_COLUMNS } from '#src/modules/users/user-columns.constants.js';

export async function updateUserRepository({ db, id, data }) {
  const [user] = await db
    .update(users)
    .set(data)
    .where(eq(users.id, id))
    .returning(USER_COLUMNS);

  return user ?? null;
}
