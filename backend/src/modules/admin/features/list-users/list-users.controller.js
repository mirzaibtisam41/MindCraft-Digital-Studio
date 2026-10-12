import * as userRepositories from '#src/modules/users/shared/repositories/index.js';
import {
  buildPageMetaUtil,
  buildPaginationUtil,
} from '#src/modules/admin/shared/utils/index.js';

export async function listUsersController(request, reply) {
  const { page, pageSize, search, role, status } = request.query;
  const { items, total } = await userRepositories.listUsersForAdminRepository({
    db: request.server.db,
    search: search?.trim(),
    role,
    status,
    ...buildPaginationUtil({ page, pageSize }),
  });

  return reply.success({
    data: items,
    meta: buildPageMetaUtil({ page, pageSize, total }),
  });
}
