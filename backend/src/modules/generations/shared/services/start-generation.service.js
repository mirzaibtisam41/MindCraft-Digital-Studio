import { BadRequestError } from '#src/utils/index.js';
import { GENERATION_STATUS } from '#src/modules/generations/generation.constants.js';
import { createGenerationRepository } from '#src/modules/generations/shared/repositories/index.js';
import { CREDIT_TRANSACTION_TYPE } from '#src/modules/credit-transactions/credit-transaction.constants.js';
import { findCreditWalletByUserIdRepository } from '#src/modules/credit-wallets/shared/repositories/index.js';
import { applyCreditChangeService } from '#src/modules/credit-wallets/shared/services/index.js';

export function startGenerationService({
  db,
  userId,
  estimate,
  prompt,
  options,
  sourceImageId = null,
}) {
  return db.transaction(async (tx) => {
    const wallet = await findCreditWalletByUserIdRepository({
      db: tx,
      userId,
      lockForUpdate: true,
    });

    if (!wallet || wallet.balance < estimate.totalCredits) {
      throw new BadRequestError(
        `This generation costs ${estimate.totalCredits} credits and you have ${wallet?.balance ?? 0}`,
      );
    }

    const generation = await createGenerationRepository({
      db: tx,
      data: {
        userId,
        modelId: estimate.model.id,
        modelWorkflowId: estimate.modelWorkflowId,
        sourceImageId,
        prompt,
        options,
        status: GENERATION_STATUS.PROCESSING,
        creditsPerImage: estimate.creditsPerImage,
        totalCredits: estimate.totalCredits,
      },
    });

    await applyCreditChangeService({
      db: tx,
      userId,
      amount: -estimate.totalCredits,
      type: CREDIT_TRANSACTION_TYPE.GENERATION_HOLD,
      reason: `${estimate.model.name} · ${options.n} × ${estimate.creditsPerImage} credits`,
      idempotencyKey: `generation:${generation.id}:hold`,
    });

    return generation;
  });
}
