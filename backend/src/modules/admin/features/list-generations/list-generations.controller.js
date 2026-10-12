import * as generationRepositories from '#src/modules/generations/shared/repositories/index.js';
import {
  buildPageMetaUtil,
  buildPaginationUtil,
} from '#src/modules/admin/shared/utils/index.js';

export async function listGenerationsController(request, reply) {
  const { page, pageSize, status, userId, model } = request.query;
  const { items, total } =
    await generationRepositories.listGenerationsForAdminRepository({
      db: request.server.db,
      status,
      userId,
      model,
      ...buildPaginationUtil({ page, pageSize }),
    });

  return reply.success({
    data: items,
    meta: buildPageMetaUtil({ page, pageSize, total }),
  });
}
