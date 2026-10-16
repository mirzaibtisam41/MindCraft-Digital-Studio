import { and, eq, gt, isNull } from 'drizzle-orm';
import { authTokens } from '#src/modules/auth-tokens/auth-token.table.js';

export async function useAuthTokenRepository({ db, tokenHash, type }) {
  const [token] = await db
    .update(authTokens)
    .set({ usedAt: new Date() })
    .where(
      and(
        eq(authTokens.tokenHash, tokenHash),
        eq(authTokens.type, type),
        isNull(authTokens.usedAt),
        gt(authTokens.expiresAt, new Date()),
      ),
    )
    .returning({
      id: authTokens.id,
      userId: authTokens.userId,
      newEmail: authTokens.newEmail,
    });

  return token ?? null;
}
