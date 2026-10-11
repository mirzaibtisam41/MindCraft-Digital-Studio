import { StatusCodes } from 'http-status-codes';
import { getClientInfoUtil } from '#src/utils/index.js';
import { setRefreshCookieUtil } from '#src/modules/auth/shared/utils/index.js';
import { registerService } from './register.service.js';

export async function registerController(request, reply) {
  const { accessToken, refreshToken, user } = await registerService({
    server: request.server,
    data: request.body,
    client: getClientInfoUtil({ request }),
  });

  setRefreshCookieUtil({
    reply,
    appConfig: request.server.config,
    refreshToken,
  });

  return reply.success({
    data: { accessToken, user },
    message: 'Account created successfully',
    statusCode: StatusCodes.CREATED,
  });
}
