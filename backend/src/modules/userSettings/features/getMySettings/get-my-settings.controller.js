import { getMySettingsService } from './get-my-settings.service.js';

export async function getMySettingsController(request, reply) {
  const settings = await getMySettingsService({
    db: request.server.db,
    userId: request.user.id,
  });

  return reply.success({ data: settings });
}
