import { StatusCodes } from 'http-status-codes';
import { registerService } from '#src/modules/auth/features/register/register.service.js';
import { sendVerificationEmailService } from '#src/modules/auth/shared/services/index.js';

export async function registerController(request, reply) {
  const user = await registerService({
    db: request.server.db,
    data: request.body,
  });

  await sendVerificationEmailService({ server: request.server, user });

  return reply.success({
    data: { user },
    message: 'Account created successfully',
    statusCode: StatusCodes.CREATED,
  });
}
