import { getAdminSettingsService } from '#src/modules/admin/shared/services/index.js';

export async function getSettingsController(request, reply) {
  const settings = await getAdminSettingsService({ db: request.server.db });

  return reply.success({ data: settings });
}
