import {
  CREDIT_TRANSACTION_TYPE,
  SIGNUP_CREDITS,
} from '#src/modules/credits/credit.constants.js';
import * as creditRepositories from '#src/modules/credits/shared/repositories/index.js';

export async function grantSignupCreditsService({ db, userId }) {
  const transaction =
    await creditRepositories.insertCreditTransactionRepository({
      db,
      data: {
        userId,
        amount: SIGNUP_CREDITS,
        type: CREDIT_TRANSACTION_TYPE.SIGNUP_GRANT,
        idempotencyKey: `user:${userId}:signup-grant`,
      },
    });

  if (!transaction) {
    return null;
  }

  const user = await creditRepositories.addUserCreditsRepository({
    db,
    userId,
    amount: SIGNUP_CREDITS,
  });

  return user.creditBalance;
}
