import {
  REFRESH_COOKIE_NAME,
  buildRefreshCookieConfig,
} from '#src/config/index.js';
import { refreshSessionService } from '#src/modules/auth/features/refresh-session/refresh-session.service.js';

export async function refreshSessionController(request, reply) {
  const { accessToken, refreshToken, user } = await refreshSessionService({
    server: request.server,
    refreshToken: request.cookies[REFRESH_COOKIE_NAME],
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
    message: 'Session refreshed',
  });
}
