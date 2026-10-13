import { NotFoundError } from '#src/utils/index.js';
import { AI_MODEL_NOT_FOUND_MESSAGE } from '#src/modules/ai-models/ai-model.constants.js';
import { updateAiModelRepository } from '#src/modules/ai-models/shared/repositories/index.js';

export async function updateAiModelService({ db, id, data, adminId }) {
  const changes = { updatedBy: adminId };

  if (data.name !== undefined) changes.name = data.name.trim();
  if (data.description !== undefined) {
    changes.description = data.description?.trim() || null;
  }
  if (data.sortOrder !== undefined) changes.sortOrder = data.sortOrder;

  const model = await updateAiModelRepository({ db, id, data: changes });

  if (!model) {
    throw new NotFoundError(AI_MODEL_NOT_FOUND_MESSAGE);
  }

  return model;
}
