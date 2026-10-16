import { readUserSettingsService } from '#src/modules/user-settings/shared/services/index.js';

export async function getMySettingsController(request, reply) {
  const settings = await readUserSettingsService({
    db: request.server.db,
    userId: request.user.id,
  });

  return reply.success({ data: { settings } });
}
