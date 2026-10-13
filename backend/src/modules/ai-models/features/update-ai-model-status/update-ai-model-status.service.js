import { NotFoundError } from '#src/utils/index.js';
import { AI_MODEL_NOT_FOUND_MESSAGE } from '#src/modules/ai-models/ai-model.constants.js';
import { updateAiModelRepository } from '#src/modules/ai-models/shared/repositories/index.js';

export async function updateAiModelStatusService({ db, id, status, adminId }) {
  const model = await updateAiModelRepository({
    db,
    id,
    data: { status, updatedBy: adminId },
  });

  if (!model) {
    throw new NotFoundError(AI_MODEL_NOT_FOUND_MESSAGE);
  }

  return model;
}
