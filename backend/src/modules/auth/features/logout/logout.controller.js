import {
  REFRESH_COOKIE_NAME,
  buildRefreshCookieConfig,
} from '#src/config/index.js';
import { logoutService } from './logout.service.js';

export async function logoutController(request, reply) {
  await logoutService({
    db: request.server.db,
    refreshToken: request.cookies[REFRESH_COOKIE_NAME],
  });

  reply.clearCookie(
    REFRESH_COOKIE_NAME,
    buildRefreshCookieConfig({ appConfig: request.server.config }),
  );

  return reply.success({ message: 'Logged out successfully' });
}
