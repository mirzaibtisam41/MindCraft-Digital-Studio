import { changePasswordService } from './change-password.service.js';

export async function changePasswordController(request, reply) {
  await changePasswordService({
    db: request.server.db,
    userId: request.user.id,
    sessionId: request.sessionId,
    currentPassword: request.body.currentPassword,
    newPassword: request.body.newPassword,
  });

  return reply.success({
    message: 'Password changed, other devices have been logged out',
  });
}
