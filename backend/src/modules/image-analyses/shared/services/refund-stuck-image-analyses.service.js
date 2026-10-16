import { PROVIDER_ERROR_CATEGORY } from '#src/constants/index.js';
import { listStuckImageAnalysisIdsRepository } from '#src/modules/image-analyses/shared/repositories/index.js';
import { failImageAnalysisService } from '#src/modules/image-analyses/shared/services/fail-image-analysis.service.js';

export async function refundStuckImageAnalysesService({ db }) {
  const analysisIds = await listStuckImageAnalysisIdsRepository({
    db,
    startedBefore: new Date(Date.now() - 10 * 60 * 1000),
  });

  let refundedCount = 0;

  for (const analysisId of analysisIds) {
    const failed = await failImageAnalysisService({
      db,
      analysisId,
      errorCategory: PROVIDER_ERROR_CATEGORY.TIMEOUT,
    });

    if (failed) refundedCount += 1;
  }

  return refundedCount;
}
