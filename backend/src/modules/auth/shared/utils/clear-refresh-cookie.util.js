import {
  REFRESH_COOKIE_NAME,
  buildRefreshCookieConfig,
} from '#src/config/index.js';

export function clearRefreshCookieUtil({ reply, appConfig }) {
  reply.clearCookie(
    REFRESH_COOKIE_NAME,
    buildRefreshCookieConfig({ appConfig }),
  );
}
