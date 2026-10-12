import { ForbiddenError, UnauthorizedError } from '#src/utils/index.js';
import { ACCOUNT_SUSPENDED_MESSAGE } from '#src/modules/auth/auth.constants.js';
import * as sessionRepositories from '#src/modules/sessions/shared/repositories/index.js';

const AUTH_REQUIRED_MESSAGE = 'Authentication required';

async function readAccessTokenPayload({ request }) {
  let payload;

  try {
    payload = await request.jwtVerify();
  } catch {
    throw new UnauthorizedError(AUTH_REQUIRED_MESSAGE);
  }

  if (typeof payload?.sub !== 'string' || typeof payload.sid !== 'string') {
    throw new UnauthorizedError(AUTH_REQUIRED_MESSAGE);
  }

  return payload;
}

export async function checkUserIsLoggedInHook(request) {
  const payload = await readAccessTokenPayload({ request });

  const activeSession =
    await sessionRepositories.findActiveSessionWithUserRepository({
      db: request.server.db,
      id: payload.sid,
      userId: payload.sub,
    });

  if (!activeSession) {
    throw new UnauthorizedError(AUTH_REQUIRED_MESSAGE);
  }

  if (activeSession.user.suspendedAt) {
    throw new ForbiddenError(ACCOUNT_SUSPENDED_MESSAGE);
  }

  request.user = activeSession.user;
  request.sessionId = activeSession.sessionId;
}
