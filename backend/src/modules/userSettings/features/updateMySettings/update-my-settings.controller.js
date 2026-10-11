import { updateMySettingsService } from './update-my-settings.service.js';

export async function updateMySettingsController(request, reply) {
  const settings = await updateMySettingsService({
    db: request.server.db,
    userId: request.user.id,
    data: request.body,
  });

  return reply.success({ data: settings, message: 'Settings updated' });
}
