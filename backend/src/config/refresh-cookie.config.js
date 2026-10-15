import { ENVIRONMENT } from '#src/constants/index.js';
import { REFRESH_TOKEN_TTL_DAYS } from '#src/modules/auth/auth.constants.js';

export const REFRESH_COOKIE_NAME = 'mds_refresh';

export function buildRefreshCookieConfig({ appConfig }) {
  return {
    httpOnly: true,
    secure: appConfig.NODE_ENV === ENVIRONMENT.PRODUCTION,
    sameSite: appConfig.COOKIE_SAME_SITE,
    path: '/api/auth',
    maxAge: REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60,
  };
}
