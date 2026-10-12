import { eq } from 'drizzle-orm';
import { users } from '#src/modules/users/user.table.js';
import { ADMIN_USER_COLUMNS } from '#src/modules/users/user-columns.constants.js';

export async function updateUserForAdminRepository({ db, id, data }) {
  const [updated] = await db
    .update(users)
    .set(data)
    .where(eq(users.id, id))
    .returning({ id: users.id });

  if (!updated) return null;

  const [user] = await db
    .select(ADMIN_USER_COLUMNS)
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return user;
}
