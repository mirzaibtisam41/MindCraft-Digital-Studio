import { ENVIRONMENT } from '#src/constants/index.js';

export const REFRESH_COOKIE_NAME = 'mds_refresh';

const REFRESH_COOKIE_PATH = '/api/auth';

export function buildRefreshCookieConfig({ appConfig }) {
  return {
    httpOnly: true,
    secure: appConfig.NODE_ENV === ENVIRONMENT.PRODUCTION,
    sameSite: appConfig.COOKIE_SAME_SITE,
    path: REFRESH_COOKIE_PATH,
  };
}
