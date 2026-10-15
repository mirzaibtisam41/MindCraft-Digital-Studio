import {
  ForbiddenError,
  UnauthorizedError,
  hashTokenUtil,
} from '#src/utils/index.js';
import { USER_STATUS } from '#src/modules/users/user.constants.js';
import {
  findAuthSessionByTokenHashRepository,
  markAuthSessionAsReplacedRepository,
  revokeAuthSessionFamilyRepository,
} from '#src/modules/auth-sessions/shared/repositories/index.js';
import { startAuthSessionService } from '#src/modules/auth/shared/services/index.js';

function wasReplacedJustNow({ session }) {
  return (
    session.replacedById && Date.now() - session.revokedAt.getTime() < 10000
  );
}

export async function refreshSessionService({ server, refreshToken, client }) {
  if (!refreshToken) {
    throw new UnauthorizedError(
      'Your session has expired, please log in again',
    );
  }

  const found = await findAuthSessionByTokenHashRepository({
    db: server.db,
    refreshTokenHash: hashTokenUtil({ token: refreshToken }),
  });

  if (!found) {
    throw new UnauthorizedError(
      'Your session has expired, please log in again',
    );
  }

  const { session, user } = found;

  if (session.revokedAt) {
    if (session.replacedById && !wasReplacedJustNow({ session })) {
      await revokeAuthSessionFamilyRepository({
        db: server.db,
        userId: user.id,
        familyId: session.familyId,
      });
    }

    throw new UnauthorizedError(
      'Your session has expired, please log in again',
    );
  }

  if (session.expiresAt < new Date()) {
    throw new UnauthorizedError(
      'Your session has expired, please log in again',
    );
  }

  if (user.status === USER_STATUS.SUSPENDED) {
    await revokeAuthSessionFamilyRepository({
      db: server.db,
      userId: user.id,
      familyId: session.familyId,
    });

    throw new ForbiddenError(
      'This account has been suspended, please contact support',
    );
  }

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
      throw new UnauthorizedError(
        'Your session has expired, please log in again',
      );
    }

    return newSession;
  });

  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user,
  };
}
