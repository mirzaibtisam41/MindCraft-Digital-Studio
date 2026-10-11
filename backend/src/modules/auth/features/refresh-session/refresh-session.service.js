import { UnauthorizedError, hashTokenUtil } from '#src/utils/index.js';
import {
  REFRESH_TOKEN_REUSE_GRACE_MS,
  SESSION_EXPIRED_MESSAGE,
} from '#src/modules/auth/auth.constants.js';
import * as authServices from '#src/modules/auth/shared/services/index.js';
import * as sessionRepositories from '#src/modules/sessions/shared/repositories/index.js';

async function revokeAllSessionsOnReuse({ server, session }) {
  const revokedForMs = Date.now() - session.revokedAt.getTime();

  if (revokedForMs < REFRESH_TOKEN_REUSE_GRACE_MS) return;

  server.log.warn(
    { userId: session.userId, sessionId: session.id },
    'Revoked refresh token was reused, revoking all sessions of the user',
  );

  await sessionRepositories.revokeUserSessionsRepository({
    db: server.db,
    userId: session.userId,
  });
}

async function findUsableSession({ server, refreshToken }) {
  if (!refreshToken) {
    throw new UnauthorizedError(SESSION_EXPIRED_MESSAGE);
  }

  const session =
    await sessionRepositories.findSessionByRefreshTokenHashRepository({
      db: server.db,
      refreshTokenHash: hashTokenUtil({ token: refreshToken }),
    });

  if (!session) {
    throw new UnauthorizedError(SESSION_EXPIRED_MESSAGE);
  }

  if (session.revokedAt) {
    await revokeAllSessionsOnReuse({ server, session });

    throw new UnauthorizedError(SESSION_EXPIRED_MESSAGE);
  }

  if (session.expiresAt <= new Date()) {
    throw new UnauthorizedError(SESSION_EXPIRED_MESSAGE);
  }

  return session;
}

export async function refreshSessionService({ server, refreshToken, client }) {
  const session = await findUsableSession({ server, refreshToken });

  return server.db.transaction(async (tx) => {
    const revokedSession = await sessionRepositories.revokeSessionRepository({
      db: tx,
      id: session.id,
    });

    if (!revokedSession) {
      throw new UnauthorizedError(SESSION_EXPIRED_MESSAGE);
    }

    return authServices.createSessionService({
      server,
      db: tx,
      userId: session.userId,
      client,
    });
  });
}
