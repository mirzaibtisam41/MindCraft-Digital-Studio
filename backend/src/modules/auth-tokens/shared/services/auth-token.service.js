import { generateTokenUtil, hashTokenUtil } from '#src/utils/index.js';
import {
  createAuthTokenRepository,
  deleteUnusedUserAuthTokensRepository,
  hasRecentUserAuthTokenRepository,
  useAuthTokenRepository,
} from '#src/modules/auth-tokens/shared/repositories/index.js';

export async function issueAuthTokenService({
  db,
  userId,
  type,
  validForMinutes,
  data = {},
}) {
  const token = generateTokenUtil();

  await db.transaction(async (tx) => {
    await deleteUnusedUserAuthTokensRepository({ db: tx, userId, type });
    await createAuthTokenRepository({
      db: tx,
      data: {
        userId,
        type,
        tokenHash: hashTokenUtil({ token }),
        expiresAt: new Date(Date.now() + validForMinutes * 60 * 1000),
        ...data,
      },
    });
  });

  return token;
}

export function useAuthTokenService({ db, token, type }) {
  return useAuthTokenRepository({
    db,
    tokenHash: hashTokenUtil({ token }),
    type,
  });
}

export function wasAuthTokenSentRecentlyService({
  db,
  userId,
  type,
  withinSeconds,
}) {
  return hasRecentUserAuthTokenRepository({ db, userId, type, withinSeconds });
}
