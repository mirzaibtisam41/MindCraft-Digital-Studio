import { and, eq, gt, sql } from 'drizzle-orm';
import { authTokens } from '#src/modules/auth-tokens/auth-token.table.js';

export async function hasRecentUserAuthTokenRepository({
  db,
  userId,
  type,
  withinSeconds,
}) {
  const [token] = await db
    .select({ id: authTokens.id })
    .from(authTokens)
    .where(
      and(
        eq(authTokens.userId, userId),
        eq(authTokens.type, type),
        gt(
          authTokens.createdAt,
          sql`now() - make_interval(secs => ${withinSeconds})`,
        ),
      ),
    )
    .limit(1);

  return Boolean(token);
}
