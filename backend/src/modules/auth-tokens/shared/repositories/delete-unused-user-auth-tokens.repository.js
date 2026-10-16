import { and, eq, isNull } from 'drizzle-orm';
import { authTokens } from '#src/modules/auth-tokens/auth-token.table.js';

export async function deleteUnusedUserAuthTokensRepository({
  db,
  userId,
  type,
}) {
  await db
    .delete(authTokens)
    .where(
      and(
        eq(authTokens.userId, userId),
        eq(authTokens.type, type),
        isNull(authTokens.usedAt),
      ),
    );
}
