import { users } from '#src/modules/users/user.table.js';
import { USER_COLUMNS } from '#src/modules/users/user-columns.constants.js';

export async function insertUserRepository({ db, data }) {
  const [user] = await db.insert(users).values(data).returning(USER_COLUMNS);

  return user;
}
