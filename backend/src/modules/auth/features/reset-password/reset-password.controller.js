import { resetPasswordService } from '#src/modules/auth/features/reset-password/reset-password.service.js';

export async function resetPasswordController(request, reply) {
  await resetPasswordService({
    db: request.server.db,
    token: request.body.token,
    newPassword: request.body.newPassword,
  });

  return reply.success({
    data: null,
    message: 'Password changed. Log in with your new password.',
  });
}
