import { updateMyProfileService } from './update-my-profile.service.js';

export async function updateMyProfileController(request, reply) {
  const user = await updateMyProfileService({
    db: request.server.db,
    userId: request.user.id,
    data: request.body,
  });

  return reply.success({ data: user, message: 'Profile updated' });
}
