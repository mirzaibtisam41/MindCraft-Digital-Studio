import { ENVIRONMENT } from '#src/constants/index.js';

export const REFRESH_COOKIE_NAME = 'mds_refresh';

const REFRESH_COOKIE_PATH = '/api/auth';

const SECONDS_IN_A_DAY = 24 * 60 * 60;

export function buildRefreshCookieConfig({ appConfig }) {
  return {
    httpOnly: true,
    secure: appConfig.NODE_ENV === ENVIRONMENT.PRODUCTION,
    sameSite: appConfig.COOKIE_SAME_SITE,
    path: REFRESH_COOKIE_PATH,
    maxAge: appConfig.REFRESH_TOKEN_TTL_DAYS * SECONDS_IN_A_DAY,
  };
}
