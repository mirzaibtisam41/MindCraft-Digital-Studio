import { eq, sql } from 'drizzle-orm';
import { users } from '#src/modules/users/user.table.js';

export async function findUserWithPasswordByEmailRepository({ db, email }) {
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      status: users.status,
      emailVerifiedAt: users.emailVerifiedAt,
      createdAt: users.createdAt,
      passwordHash: users.passwordHash,
    })
    .from(users)
    .where(eq(sql`lower(${users.email})`, email))
    .limit(1);

  return user ?? null;
}
