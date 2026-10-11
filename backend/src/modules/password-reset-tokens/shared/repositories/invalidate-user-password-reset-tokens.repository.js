import { and, eq, isNull } from 'drizzle-orm';
import { passwordResetTokens } from '#src/modules/password-reset-tokens/password-reset-token.table.js';

export async function invalidateUserPasswordResetTokensRepository({
  db,
  userId,
}) {
  await db
    .update(passwordResetTokens)
    .set({ usedAt: new Date() })
    .where(
      and(
        eq(passwordResetTokens.userId, userId),
        isNull(passwordResetTokens.usedAt),
      ),
    );
}
