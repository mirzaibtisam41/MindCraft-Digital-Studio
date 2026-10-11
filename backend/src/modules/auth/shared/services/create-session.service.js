import { generateTokenUtil, hashTokenUtil } from '#src/utils/index.js';
import * as sessionRepositories from '#src/modules/sessions/shared/repositories/index.js';

const DAY_MS = 24 * 60 * 60 * 1000;

export async function createSessionService({
  server,
  db = server.db,
  userId,
  client,
}) {
  const refreshToken = generateTokenUtil();

  const session = await sessionRepositories.insertSessionRepository({
    db,
    data: {
      userId,
      refreshTokenHash: hashTokenUtil({ token: refreshToken }),
      userAgent: client.userAgent,
      ipAddress: client.ipAddress,
      expiresAt: new Date(
        Date.now() + server.config.REFRESH_TOKEN_TTL_DAYS * DAY_MS,
      ),
    },
  });

  const accessToken = server.jwt.sign({ sub: userId, sid: session.id });

  return { accessToken, refreshToken };
}
