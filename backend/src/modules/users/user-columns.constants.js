import { sql } from 'drizzle-orm';
import { users } from '#src/modules/users/user.table.js';

export const USER_COLUMNS = {
  id: users.id,
  name: users.name,
  email: users.email,
  role: users.role,
  suspendedAt: users.suspendedAt,
  creditBalance: users.creditBalance,
  createdAt: users.createdAt,
  updatedAt: users.updatedAt,
};

export const ADMIN_USER_COLUMNS = {
  ...USER_COLUMNS,
  generationsCount:
    sql`(select count(*)::int from generations where generations.user_id = ${users.id})`.mapWith(
      Number,
    ),
  failedGenerationsCount:
    sql`(select count(*)::int from generations where generations.user_id = ${users.id} and generations.status = 'failed')`.mapWith(
      Number,
    ),
};
