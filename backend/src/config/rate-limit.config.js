import { TooManyRequestsError } from '#src/utils/index.js';

export function buildRateLimitConfig({ appConfig }) {
  return {
    global: true,
    max: appConfig.RATE_LIMIT_MAX,
    timeWindow: appConfig.RATE_LIMIT_WINDOW_MS,
    errorResponseBuilder: (_request, context) =>
      new TooManyRequestsError(
        `Too many requests, please try again in ${context.after}`,
      ),
  };
}
