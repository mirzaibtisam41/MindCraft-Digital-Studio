import {
  ForbiddenError,
  UnauthorizedError,
  hashTokenUtil,
} from '#src/utils/index.js';
import {
  ACCOUNT_SUSPENDED_MESSAGE,
  REFRESH_TOKEN_REUSE_GRACE_MS,
  SESSION_EXPIRED_MESSAGE,
} from '#src/modules/auth/auth.constants.js';
import { USER_STATUS } from '#src/modules/users/user.constants.js';
import {
  findAuthSessionByTokenHashRepository,
  markAuthSessionAsReplacedRepository,
  revokeAuthSessionFamilyRepository,
} from '#src/modules/auth-sessions/shared/repositories/index.js';
import { startAuthSessionService } from '#src/modules/auth/shared/services/index.js';

class TokenAlreadyUsedError extends Error {}

function wasReplacedJustNow({ session }) {
  return (
    session.replacedById &&
    Date.now() - session.revokedAt.getTime() < REFRESH_TOKEN_REUSE_GRACE_MS
  );
}

export async function refreshSessionService({ server, refreshToken, client }) {
  if (!refreshToken) {
    throw new UnauthorizedError(SESSION_EXPIRED_MESSAGE);
  }

  const found = await findAuthSessionByTokenHashRepository({
    db: server.db,
    refreshTokenHash: hashTokenUtil({ token: refreshToken }),
  });

  if (!found) {
    throw new UnauthorizedError(SESSION_EXPIRED_MESSAGE);
  }

  const { session, user } = found;

  if (session.revokedAt) {
    if (session.replacedById && !wasReplacedJustNow({ session })) {
      await revokeAuthSessionFamilyRepository({
        db: server.db,
        familyId: session.familyId,
      });
    }

    throw new UnauthorizedError(SESSION_EXPIRED_MESSAGE);
  }

  if (session.expiresAt < new Date()) {
    throw new UnauthorizedError(SESSION_EXPIRED_MESSAGE);
  }

  if (user.status === USER_STATUS.SUSPENDED) {
    await revokeAuthSessionFamilyRepository({
      db: server.db,
      familyId: session.familyId,
    });

    throw new ForbiddenError(ACCOUNT_SUSPENDED_MESSAGE);
  }

  try {
    const tokens = await server.db.transaction(async (tx) => {
      const newSession = await startAuthSessionService({
        server,
        db: tx,
        userId: user.id,
        familyId: session.familyId,
        client,
      });

      const replacedSession = await markAuthSessionAsReplacedRepository({
        db: tx,
        sessionId: session.id,
        replacedById: newSession.session.id,
      });

      if (!replacedSession) {
        throw new TokenAlreadyUsedError();
      }

      return newSession;
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user,
    };
  } catch (error) {
    if (error instanceof TokenAlreadyUsedError) {
      throw new UnauthorizedError(SESSION_EXPIRED_MESSAGE);
    }

    throw error;
  }
}
