import {
  REFRESH_COOKIE_NAME,
  buildRefreshCookieConfig,
} from '#src/config/index.js';
import { loginService } from '#src/modules/auth/features/login/login.service.js';

export async function loginController(request, reply) {
  const { accessToken, refreshToken, user } = await loginService({
    server: request.server,
    data: request.body,
    client: {
      userAgent: request.headers['user-agent'] ?? null,
      ipAddress: request.ip ?? null,
    },
  });

  reply.setCookie(
    REFRESH_COOKIE_NAME,
    refreshToken,
    buildRefreshCookieConfig({ appConfig: request.server.config }),
  );

  return reply.success({
    data: { accessToken, user },
    message: 'Logged in successfully',
  });
}
