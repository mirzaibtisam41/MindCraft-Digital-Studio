import { GENERATION_STATUS } from '#src/modules/generations/generation.constants.js';
import { finishProcessingGenerationRepository } from '#src/modules/generations/shared/repositories/index.js';

export function completeGenerationService({ db, generationId }) {
  return finishProcessingGenerationRepository({
    db,
    id: generationId,
    data: { status: GENERATION_STATUS.SUCCEEDED },
  });
}
