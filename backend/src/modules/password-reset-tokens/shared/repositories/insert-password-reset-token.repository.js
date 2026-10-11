import { passwordResetTokens } from '#src/modules/password-reset-tokens/password-reset-token.table.js';

export async function insertPasswordResetTokenRepository({ db, data }) {
  const [token] = await db
    .insert(passwordResetTokens)
    .values(data)
    .returning({ id: passwordResetTokens.id });

  return token;
}
