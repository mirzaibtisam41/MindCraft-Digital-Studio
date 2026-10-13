import { StatusCodes } from 'http-status-codes';
import { registerService } from './register.service.js';

export async function registerController(request, reply) {
  const user = await registerService({
    db: request.server.db,
    data: request.body,
  });

  return reply.success({
    data: { user },
    message: 'Account created successfully',
    statusCode: StatusCodes.CREATED,
  });
}
