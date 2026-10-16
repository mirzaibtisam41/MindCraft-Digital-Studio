import { changeMyEmailService } from '#src/modules/users/features/change-my-email/change-my-email.service.js';

export async function changeMyEmailController(request, reply) {
  const result = await changeMyEmailService({
    server: request.server,
    user: request.user,
    newEmail: request.body.newEmail,
    currentPassword: request.body.currentPassword,
  });

  return reply.success({
    data: result,
    message: `We sent a confirmation link to ${result.newEmail}. Your email changes when you open it.`,
  });
}
