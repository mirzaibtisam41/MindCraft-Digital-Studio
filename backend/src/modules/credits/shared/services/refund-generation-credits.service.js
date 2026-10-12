import { CREDIT_TRANSACTION_TYPE } from '#src/modules/credits/credit.constants.js';
import * as creditRepositories from '#src/modules/credits/shared/repositories/index.js';

export async function refundGenerationCreditsService({
  db,
  userId,
  generationId,
  amount,
}) {
  await db.transaction(async (tx) => {
    const transaction =
      await creditRepositories.insertCreditTransactionRepository({
        db: tx,
        data: {
          userId,
          amount,
          type: CREDIT_TRANSACTION_TYPE.GENERATION_REFUND,
          generationId,
          idempotencyKey: `generation:${generationId}:refund`,
        },
      });

    if (!transaction) {
      return;
    }

    await creditRepositories.addUserCreditsRepository({
      db: tx,
      userId,
      amount,
    });
  });
}
