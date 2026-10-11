import {
  clearRefreshCookieUtil,
  readRefreshCookieUtil,
} from '#src/modules/auth/shared/utils/index.js';
import { logoutService } from './logout.service.js';

export async function logoutController(request, reply) {
  await logoutService({
    db: request.server.db,
    refreshToken: readRefreshCookieUtil({ request }),
  });

  clearRefreshCookieUtil({ reply, appConfig: request.server.config });

  return reply.success({ message: 'Logged out successfully' });
}
