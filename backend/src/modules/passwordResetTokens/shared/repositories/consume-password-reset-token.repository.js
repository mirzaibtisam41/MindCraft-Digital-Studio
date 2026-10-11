import { and, eq, gt, isNull } from 'drizzle-orm';
import { passwordResetTokens } from '#src/modules/passwordResetTokens/password-reset-token.table.js';

export async function consumePasswordResetTokenRepository({ db, tokenHash }) {
  const now = new Date();

  const [token] = await db
    .update(passwordResetTokens)
    .set({ usedAt: now })
    .where(
      and(
        eq(passwordResetTokens.tokenHash, tokenHash),
        isNull(passwordResetTokens.usedAt),
        gt(passwordResetTokens.expiresAt, now),
      ),
    )
    .returning({ userId: passwordResetTokens.userId });

  return token ?? null;
}
