import { resetPasswordService } from './reset-password.service.js';

export async function resetPasswordController(request, reply) {
  await resetPasswordService({
    server: request.server,
    token: request.body.token,
    password: request.body.password,
  });

  return reply.success({
    message: 'Password reset successfully, please log in again',
  });
}
