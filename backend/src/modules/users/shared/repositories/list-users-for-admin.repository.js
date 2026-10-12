import { and, desc, eq, ilike, isNotNull, isNull, or, sql } from 'drizzle-orm';
import { users } from '#src/modules/users/user.table.js';
import { ADMIN_USER_COLUMNS } from '#src/modules/users/user-columns.constants.js';

function buildFilters({ search, role, status }) {
  const filters = [];

  if (search) {
    const pattern = `%${search.replace(/[%_\\]/g, '\\$&')}%`;

    filters.push(or(ilike(users.name, pattern), ilike(users.email, pattern)));
  }

  if (role) filters.push(eq(users.role, role));
  if (status === 'suspended') filters.push(isNotNull(users.suspendedAt));
  if (status === 'active') filters.push(isNull(users.suspendedAt));

  return filters.length > 0 ? and(...filters) : undefined;
}

export async function listUsersForAdminRepository({
  db,
  search,
  role,
  status,
  limit,
  offset,
}) {
  const where = buildFilters({ search, role, status });

  const items = await db
    .select(ADMIN_USER_COLUMNS)
    .from(users)
    .where(where)
    .orderBy(desc(users.createdAt))
    .limit(limit)
    .offset(offset);

  const [{ total }] = await db
    .select({ total: sql`count(*)::int` })
    .from(users)
    .where(where);

  return { items, total };
}
