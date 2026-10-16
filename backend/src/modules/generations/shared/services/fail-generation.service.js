import { GENERATION_STATUS } from '#src/modules/generations/generation.constants.js';
import { finishProcessingGenerationRepository } from '#src/modules/generations/shared/repositories/index.js';
import { CREDIT_TRANSACTION_TYPE } from '#src/modules/credit-transactions/credit-transaction.constants.js';
import { applyCreditChangeService } from '#src/modules/credit-wallets/shared/services/index.js';

export function failGenerationService({ db, generationId, errorCategory }) {
  return db.transaction(async (tx) => {
    const generation = await finishProcessingGenerationRepository({
      db: tx,
      id: generationId,
      data: { status: GENERATION_STATUS.FAILED, errorCategory },
    });

    if (!generation) return null;

    await applyCreditChangeService({
      db: tx,
      userId: generation.userId,
      amount: generation.totalCredits,
      type: CREDIT_TRANSACTION_TYPE.GENERATION_REFUND,
      reason: 'Refund for a failed generation',
      idempotencyKey: `generation:${generation.id}:refund`,
    });

    return generation;
  });
}
