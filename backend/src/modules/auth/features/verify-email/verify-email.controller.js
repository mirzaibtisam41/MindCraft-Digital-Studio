import { verifyEmailService } from '#src/modules/auth/features/verify-email/verify-email.service.js';

export async function verifyEmailController(request, reply) {
  const user = await verifyEmailService({
    db: request.server.db,
    token: request.body.token,
  });

  return reply.success({
    data: { email: user.email, emailVerifiedAt: user.emailVerifiedAt },
    message: 'Your email is confirmed',
  });
}
