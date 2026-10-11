import { ERROR_CODE } from '#src/constants/index.js';
import { getClientInfoUtil } from '#src/utils/index.js';
import {
  clearRefreshCookieUtil,
  readRefreshCookieUtil,
  setRefreshCookieUtil,
} from '#src/modules/auth/shared/utils/index.js';
import { refreshSessionService } from './refresh-session.service.js';

export async function refreshSessionController(request, reply) {
  const appConfig = request.server.config;

  try {
    const { accessToken, refreshToken } = await refreshSessionService({
      server: request.server,
      refreshToken: readRefreshCookieUtil({ request }),
      client: getClientInfoUtil({ request }),
    });

    setRefreshCookieUtil({ reply, appConfig, refreshToken });

    return reply.success({
      data: { accessToken },
      message: 'Session refreshed',
    });
  } catch (error) {
    if (error.code === ERROR_CODE.UNAUTHORIZED) {
      clearRefreshCookieUtil({ reply, appConfig });
    }

    throw error;
  }
}
