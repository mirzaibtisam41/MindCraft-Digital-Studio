import { and, count, desc, eq, ilike, or } from 'drizzle-orm';
import { escapeLikePatternUtil } from '#src/utils/index.js';
import { users } from '#src/modules/users/user.table.js';
import { USER_WITH_BALANCE_COLUMNS } from '#src/modules/users/user-columns.constants.js';
import { creditWallets } from '#src/modules/credit-wallets/credit-wallet.table.js';

function buildFilters({ search, role, status }) {
  const conditions = [];

  if (search) {
    const pattern = `%${escapeLikePatternUtil({ text: search })}%`;

    conditions.push(
      or(ilike(users.name, pattern), ilike(users.email, pattern)),
    );
  }

  if (role) conditions.push(eq(users.role, role));
  if (status) conditions.push(eq(users.status, status));

  return and(...conditions);
}

export async function listUsersRepository({ db, filters, limit, offset }) {
  const where = buildFilters(filters);

  const userList = await db
    .select(USER_WITH_BALANCE_COLUMNS)
    .from(users)
    .leftJoin(creditWallets, eq(creditWallets.userId, users.id))
    .where(where)
    .orderBy(desc(users.createdAt), desc(users.id))
    .limit(limit)
    .offset(offset);

  const [{ total }] = await db
    .select({ total: count() })
    .from(users)
    .where(where);

  return { users: userList, total };
}
