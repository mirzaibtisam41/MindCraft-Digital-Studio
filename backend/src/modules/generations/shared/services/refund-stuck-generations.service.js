import { PROVIDER_ERROR_CATEGORY } from '#src/constants/index.js';
import { listStuckGenerationIdsRepository } from '#src/modules/generations/shared/repositories/index.js';
import { failGenerationService } from '#src/modules/generations/shared/services/fail-generation.service.js';

export async function refundStuckGenerationsService({ db }) {
  const generationIds = await listStuckGenerationIdsRepository({
    db,
    startedBefore: new Date(Date.now() - 10 * 60 * 1000),
  });

  let refundedCount = 0;

  for (const generationId of generationIds) {
    const failed = await failGenerationService({
      db,
      generationId,
      errorCategory: PROVIDER_ERROR_CATEGORY.TIMEOUT,
    });

    if (failed) refundedCount += 1;
  }

  return refundedCount;
}
