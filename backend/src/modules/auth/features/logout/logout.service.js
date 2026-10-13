import { hashTokenUtil } from '#src/utils/index.js';
import {
  findAuthSessionByTokenHashRepository,
  revokeAuthSessionFamilyRepository,
} from '#src/modules/auth-sessions/shared/repositories/index.js';

export async function logoutService({ db, refreshToken }) {
  if (!refreshToken) {
    return;
  }

  const found = await findAuthSessionByTokenHashRepository({
    db,
    refreshTokenHash: hashTokenUtil({ token: refreshToken }),
  });

  if (!found) {
    return;
  }

  await revokeAuthSessionFamilyRepository({
    db,
    familyId: found.session.familyId,
  });
}
