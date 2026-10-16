import { eq } from 'drizzle-orm';
import { users } from '#src/modules/users/user.table.js';

export async function findUserPasswordHashByIdRepository({ db, id }) {
  const [user] = await db
    .select({ passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return user?.passwordHash ?? null;
}
