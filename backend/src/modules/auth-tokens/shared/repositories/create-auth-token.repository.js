import { authTokens } from '#src/modules/auth-tokens/auth-token.table.js';

export async function createAuthTokenRepository({ db, data }) {
  const [token] = await db
    .insert(authTokens)
    .values(data)
    .returning({ id: authTokens.id, expiresAt: authTokens.expiresAt });

  return token;
}
