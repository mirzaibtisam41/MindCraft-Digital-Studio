import { users } from '#src/modules/users/user.table.js';

export async function createUserRepository({ db, data }) {
  const [user] = await db.insert(users).values(data).returning({
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role,
    status: users.status,
    emailVerifiedAt: users.emailVerifiedAt,
    createdAt: users.createdAt,
  });

  return user;
}
