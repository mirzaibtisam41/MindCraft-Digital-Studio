import { users } from '#src/modules/users/user.table.js';

export const USER_COLUMNS = {
  id: users.id,
  name: users.name,
  email: users.email,
  createdAt: users.createdAt,
  updatedAt: users.updatedAt,
};
