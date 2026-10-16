import { CHAT_MODELS } from '#src/modules/platform-settings/platform-setting.constants.js';
import { readPlatformSettingsService } from '#src/modules/platform-settings/shared/services/index.js';

export async function getPlatformSettingsController(request, reply) {
  const settings = await readPlatformSettingsService({ db: request.server.db });

  return reply.success({ data: { settings, chatModels: CHAT_MODELS } });
}
