import { passwordResetTokens } from '#src/modules/passwordResetTokens/password-reset-token.table.js';

export async function insertPasswordResetTokenRepository({ db, data }) {
  const [token] = await db
    .insert(passwordResetTokens)
    .values(data)
    .returning({ id: passwordResetTokens.id });

  return token;
}
