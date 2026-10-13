import {
  ConflictError,
  hashPasswordUtil,
  isUniqueViolationErrorUtil,
} from '#src/utils/index.js';
import { EMAIL_ALREADY_REGISTERED_MESSAGE } from '#src/modules/auth/auth.constants.js';
import {
  createUserRepository,
  findUserByEmailRepository,
} from '#src/modules/users/shared/repositories/index.js';
import { createCreditWalletRepository } from '#src/modules/credit-wallets/shared/repositories/index.js';
import { applyCreditChangeService } from '#src/modules/credit-transactions/shared/services/index.js';
import { CREDIT_TRANSACTION_TYPE } from '#src/modules/credit-transactions/credit-transaction.constants.js';
import { PLATFORM_SETTING_KEY } from '#src/modules/platform-settings/platform-setting.constants.js';
import { findPlatformSettingRepository } from '#src/modules/platform-settings/shared/repositories/index.js';

export async function registerService({ db, data }) {
  const name = data.name.trim();
  const email = data.email.trim().toLowerCase();

  const existingUser = await findUserByEmailRepository({ db, email });

  if (existingUser) {
    throw new ConflictError(EMAIL_ALREADY_REGISTERED_MESSAGE);
  }

  const passwordHash = await hashPasswordUtil({ password: data.password });

  try {
    return await db.transaction(async (tx) => {
      const user = await createUserRepository({
        db: tx,
        data: { name, email, passwordHash },
      });

      await createCreditWalletRepository({ db: tx, userId: user.id });

      const signupCredits = await findPlatformSettingRepository({
        db: tx,
        key: PLATFORM_SETTING_KEY.SIGNUP_CREDITS,
      });

      if (signupCredits > 0) {
        await applyCreditChangeService({
          tx,
          userId: user.id,
          amount: signupCredits,
          type: CREDIT_TRANSACTION_TYPE.SIGNUP_GRANT,
          idempotencyKey: `signup:${user.id}`,
        });
      }

      return user;
    });
  } catch (error) {
    if (isUniqueViolationErrorUtil({ error })) {
      throw new ConflictError(EMAIL_ALREADY_REGISTERED_MESSAGE);
    }

    throw error;
  }
}
