import { getAdminOverviewRepository } from '#src/modules/admin/shared/repositories/index.js';

export async function getOverviewController(request, reply) {
  const overview = await getAdminOverviewRepository({ db: request.server.db });

  return reply.success({ data: overview });
}
