import { InsufficientCreditsError } from '#src/utils/index.js';
import {
  CREDIT_TRANSACTION_TYPE,
  INSUFFICIENT_CREDITS_MESSAGE,
} from '#src/modules/credits/credit.constants.js';
import * as creditRepositories from '#src/modules/credits/shared/repositories/index.js';

export async function reserveGenerationCreditsService({
  db,
  userId,
  generationId,
  amount,
}) {
  const transaction =
    await creditRepositories.insertCreditTransactionRepository({
      db,
      data: {
        userId,
        amount: -amount,
        type: CREDIT_TRANSACTION_TYPE.GENERATION_HOLD,
        generationId,
        idempotencyKey: `generation:${generationId}:hold`,
      },
    });

  if (!transaction) {
    return;
  }

  const user = await creditRepositories.deductUserCreditsRepository({
    db,
    userId,
    amount,
  });

  if (!user) {
    throw new InsufficientCreditsError(INSUFFICIENT_CREDITS_MESSAGE);
  }
}
