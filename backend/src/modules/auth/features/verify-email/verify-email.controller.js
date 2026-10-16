import { verifyEmailService } from '#src/modules/auth/features/verify-email/verify-email.service.js';
import { buildActionEmail } from '#src/modules/auth/shared/emails/index.js';

export async function verifyEmailController(request, reply) {
  const { server } = request;
  const { user, previousEmail } = await verifyEmailService({
    db: server.db,
    token: request.body.token,
  });

  if (previousEmail) {
    await server.mailer.sendEmail({
      to: previousEmail,
      ...buildActionEmail({
        subject: 'Your Mindcraft email was changed',
        name: user.name,
        intro: `The email of your Mindcraft Digital Studio account was changed from ${previousEmail} to ${user.email}.`,
        buttonLabel: 'This was not me, reset my password',
        link: `${server.config.APP_URL}/forgot-password`,
        outro:
          'If you made this change, you do not need to do anything. Log in with your new email from now on.',
      }),
    });
  }

  return reply.success({
    data: {
      email: user.email,
      emailVerifiedAt: user.emailVerifiedAt,
      emailChanged: Boolean(previousEmail),
    },
    message: previousEmail
      ? `Your email is now ${user.email}`
      : 'Your email is confirmed',
  });
}
