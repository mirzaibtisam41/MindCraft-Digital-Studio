import { generateTokenUtil, hashTokenUtil } from '#src/utils/index.js';
import { createAuthSessionRepository } from '#src/modules/auth-sessions/shared/repositories/index.js';
import { REFRESH_TOKEN_TTL_DAYS } from '#src/modules/auth/auth.constants.js';

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
        Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
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
