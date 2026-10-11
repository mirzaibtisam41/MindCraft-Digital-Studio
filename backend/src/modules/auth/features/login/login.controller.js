import { getClientInfoUtil } from '#src/utils/index.js';
import { setRefreshCookieUtil } from '#src/modules/auth/shared/utils/index.js';
import { loginService } from './login.service.js';

export async function loginController(request, reply) {
  const { accessToken, refreshToken, user } = await loginService({
    server: request.server,
    email: request.body.email,
    password: request.body.password,
    client: getClientInfoUtil({ request }),
  });

  setRefreshCookieUtil({
    reply,
    appConfig: request.server.config,
    refreshToken,
  });

  return reply.success({
    data: { accessToken, user },
    message: 'Logged in successfully',
  });
}
