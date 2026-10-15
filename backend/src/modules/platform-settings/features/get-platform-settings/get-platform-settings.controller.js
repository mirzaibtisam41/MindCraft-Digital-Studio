import { getPlatformSettingsService } from '#src/modules/platform-settings/features/get-platform-settings/get-platform-settings.service.js';

export async function getPlatformSettingsController(request, reply) {
  const settings = await getPlatformSettingsService({ db: request.server.db });

  return reply.success({ data: { settings } });
}
