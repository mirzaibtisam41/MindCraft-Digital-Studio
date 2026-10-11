import {
  REFRESH_COOKIE_NAME,
  buildRefreshCookieConfig,
} from '#src/config/index.js';

const DAY_SECONDS = 24 * 60 * 60;

export function setRefreshCookieUtil({ reply, appConfig, refreshToken }) {
  reply.setCookie(REFRESH_COOKIE_NAME, refreshToken, {
    ...buildRefreshCookieConfig({ appConfig }),
    maxAge: appConfig.REFRESH_TOKEN_TTL_DAYS * DAY_SECONDS,
  });
}
