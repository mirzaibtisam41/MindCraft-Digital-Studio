import { updateSettingsService } from './update-settings.service.js';

export async function updateSettingsController(request, reply) {
  const settings = await updateSettingsService({
    db: request.server.db,
    actorId: request.user.id,
    input: request.body,
  });

  return reply.success({ data: settings, message: 'Settings updated' });
}
