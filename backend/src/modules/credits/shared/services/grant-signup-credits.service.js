import { CREDIT_TRANSACTION_TYPE } from '#src/modules/credits/credit.constants.js';
import * as creditRepositories from '#src/modules/credits/shared/repositories/index.js';
import { SYSTEM_SETTING_KEY } from '#src/modules/system-settings/system-setting.constants.js';
import { getSystemSettingService } from '#src/modules/system-settings/shared/services/index.js';

export async function grantSignupCreditsService({ db, userId }) {
  const amount = await getSystemSettingService({
    db,
    key: SYSTEM_SETTING_KEY.SIGNUP_CREDITS,
  });

  if (amount <= 0) {
    return 0;
  }

  const transaction =
    await creditRepositories.insertCreditTransactionRepository({
      db,
      data: {
        userId,
        amount,
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
    amount,
  });

  return user.creditBalance;
}
