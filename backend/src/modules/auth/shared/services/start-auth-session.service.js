import { generateTokenUtil, hashTokenUtil } from '#src/utils/index.js';
import { createAuthSessionRepository } from '#src/modules/auth-sessions/shared/repositories/index.js';

const MILLISECONDS_IN_A_DAY = 24 * 60 * 60 * 1000;

export async function startAuthSessionService({
  server,
  db,
  userId,
  familyId,
  client,
}) {
  const refreshToken = generateTokenUtil();

  const session = await createAuthSessionRepository({
    db,
    data: {
      userId,
      familyId,
      refreshTokenHash: hashTokenUtil({ token: refreshToken }),
      userAgent: client.userAgent,
      ipAddress: client.ipAddress,
      expiresAt: new Date(
        Date.now() +
          server.config.REFRESH_TOKEN_TTL_DAYS * MILLISECONDS_IN_A_DAY,
      ),
    },
  });

  const accessToken = server.jwt.sign({
    sub: userId,
    sid: session.id,
    fid: familyId,
  });

  return { session, accessToken, refreshToken };
}
