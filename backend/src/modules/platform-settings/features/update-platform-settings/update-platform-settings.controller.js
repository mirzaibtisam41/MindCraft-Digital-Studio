import { updatePlatformSettingsService } from './update-platform-settings.service.js';

export async function updatePlatformSettingsController(request, reply) {
  const settings = await updatePlatformSettingsService({
    db: request.server.db,
    data: request.body,
    adminId: request.user.id,
  });

  return reply.success({ data: { settings }, message: 'Settings saved' });
}
