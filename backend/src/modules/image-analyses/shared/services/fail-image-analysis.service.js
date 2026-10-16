import { GENERATION_STATUS } from '#src/modules/generations/generation.constants.js';
import { finishProcessingImageAnalysisRepository } from '#src/modules/image-analyses/shared/repositories/index.js';
import { CREDIT_TRANSACTION_TYPE } from '#src/modules/credit-transactions/credit-transaction.constants.js';
import { applyCreditChangeService } from '#src/modules/credit-wallets/shared/services/index.js';

export function failImageAnalysisService({ db, analysisId, errorCategory }) {
  return db.transaction(async (tx) => {
    const analysis = await finishProcessingImageAnalysisRepository({
      db: tx,
      id: analysisId,
      data: { status: GENERATION_STATUS.FAILED, errorCategory },
    });

    if (!analysis) return null;

    if (analysis.credits > 0) {
      await applyCreditChangeService({
        db: tx,
        userId: analysis.userId,
        amount: analysis.credits,
        type: CREDIT_TRANSACTION_TYPE.ANALYSIS_REFUND,
        reason: 'Refund for a failed analysis',
        idempotencyKey: `analysis:${analysis.id}:refund`,
      });
    }

    return analysis;
  });
}
