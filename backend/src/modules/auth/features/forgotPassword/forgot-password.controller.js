import { forgotPasswordService } from './forgot-password.service.js';

export async function forgotPasswordController(request, reply) {
  await forgotPasswordService({
    server: request.server,
    email: request.body.email,
  });

  return reply.success({
    message:
      'If an account exists for this email, a password reset link has been sent',
  });
}
