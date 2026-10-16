import { BadRequestError } from '#src/utils/index.js';
import { GENERATION_STATUS } from '#src/modules/generations/generation.constants.js';
import { createImageAnalysisRepository } from '#src/modules/image-analyses/shared/repositories/index.js';
import { CREDIT_TRANSACTION_TYPE } from '#src/modules/credit-transactions/credit-transaction.constants.js';
import { findCreditWalletByUserIdRepository } from '#src/modules/credit-wallets/shared/repositories/index.js';
import { applyCreditChangeService } from '#src/modules/credit-wallets/shared/services/index.js';

export function startImageAnalysisService({
  db,
  userId,
  imageId,
  task,
  question,
  model,
  credits,
}) {
  return db.transaction(async (tx) => {
    const wallet = await findCreditWalletByUserIdRepository({
      db: tx,
      userId,
      lockForUpdate: true,
    });

    if (!wallet || wallet.balance < credits) {
      throw new BadRequestError(
        `This analysis costs ${credits} credits and you have ${wallet?.balance ?? 0}`,
      );
    }

    const analysis = await createImageAnalysisRepository({
      db: tx,
      data: {
        userId,
        imageId,
        task,
        question,
        model,
        credits,
        status: GENERATION_STATUS.PROCESSING,
      },
    });

    if (credits > 0) {
      await applyCreditChangeService({
        db: tx,
        userId,
        amount: -credits,
        type: CREDIT_TRANSACTION_TYPE.ANALYSIS_CHARGE,
        reason: `AI Vision · ${task}`,
        idempotencyKey: `analysis:${analysis.id}:charge`,
      });
    }

    return analysis;
  });
}
