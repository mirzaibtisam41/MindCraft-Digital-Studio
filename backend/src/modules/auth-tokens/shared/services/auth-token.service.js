import { generateTokenUtil, hashTokenUtil } from '#src/utils/index.js';
import {
  createAuthTokenRepository,
  deleteUnusedUserAuthTokensRepository,
  findLatestUserAuthTokenRepository,
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

export async function wasAuthTokenSentRecentlyService({
  db,
  userId,
  type,
  withinSeconds,
}) {
  const latest = await findLatestUserAuthTokenRepository({ db, userId, type });

  return Boolean(
    latest && Date.now() - latest.createdAt.getTime() < withinSeconds * 1000,
  );
}
