import { eq } from 'drizzle-orm';
import { users } from '#src/modules/users/user.table.js';

export async function findUserEmailByIdRepository({ db, id }) {
  const [user] = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return user?.email ?? null;
}
