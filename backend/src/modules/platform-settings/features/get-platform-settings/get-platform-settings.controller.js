import { getPlatformSettingsService } from './get-platform-settings.service.js';

export async function getPlatformSettingsController(request, reply) {
  const settings = await getPlatformSettingsService({ db: request.server.db });

  return reply.success({ data: { settings } });
}
