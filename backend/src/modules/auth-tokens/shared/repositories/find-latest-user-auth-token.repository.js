import { and, desc, eq } from 'drizzle-orm';
import { authTokens } from '#src/modules/auth-tokens/auth-token.table.js';

export async function findLatestUserAuthTokenRepository({ db, userId, type }) {
  const [token] = await db
    .select({ id: authTokens.id, createdAt: authTokens.createdAt })
    .from(authTokens)
    .where(and(eq(authTokens.userId, userId), eq(authTokens.type, type)))
    .orderBy(desc(authTokens.createdAt))
    .limit(1);

  return token ?? null;
}
