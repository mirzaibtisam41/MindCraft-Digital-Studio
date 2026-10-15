import { NotFoundError } from '#src/utils/index.js';
import { AI_MODEL_NOT_FOUND_MESSAGE } from '#src/modules/ai-models/ai-model.constants.js';
import { GENERATION_OPTIONS } from '#src/modules/model-workflows/generation-options.constants.js';
import { findAiModelByIdRepository } from '#src/modules/ai-models/shared/repositories/index.js';
import { listModelWorkflowsRepository } from '#src/modules/model-workflows/shared/repositories/index.js';

export async function listModelWorkflowsService({ db, modelId }) {
  const model = await findAiModelByIdRepository({ db, id: modelId });

  if (!model) {
    throw new NotFoundError(AI_MODEL_NOT_FOUND_MESSAGE);
  }

  const workflows = await listModelWorkflowsRepository({ db, modelId });

  return { workflows, availableOptions: GENERATION_OPTIONS };
}
