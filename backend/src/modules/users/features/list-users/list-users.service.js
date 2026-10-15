import { listUsersRepository } from '#src/modules/users/shared/repositories/index.js';

export async function listUsersService({ db, query }) {
  const { page, limit } = query;

  const { users, total } = await listUsersRepository({
    db,
    filters: {
      search: query.search?.trim(),
      role: query.role,
      status: query.status,
    },
    limit,
    offset: (page - 1) * limit,
  });

  return {
    users,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}
