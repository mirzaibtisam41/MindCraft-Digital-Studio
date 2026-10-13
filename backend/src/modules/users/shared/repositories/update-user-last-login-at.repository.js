import { eq } from 'drizzle-orm';
import { users } from '#src/modules/users/user.table.js';

export async function updateUserLastLoginAtRepository({ db, userId }) {
  await db
    .update(users)
    .set({ lastLoginAt: new Date() })
    .where(eq(users.id, userId));
}
