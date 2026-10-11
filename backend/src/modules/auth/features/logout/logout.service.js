import { hashTokenUtil } from '#src/utils/index.js';
import * as sessionRepositories from '#src/modules/sessions/shared/repositories/index.js';

export async function logoutService({ db, refreshToken }) {
  if (!refreshToken) return;

  const session =
    await sessionRepositories.findSessionByRefreshTokenHashRepository({
      db,
      refreshTokenHash: hashTokenUtil({ token: refreshToken }),
    });

  if (!session) return;

  await sessionRepositories.revokeSessionRepository({ db, id: session.id });
}
