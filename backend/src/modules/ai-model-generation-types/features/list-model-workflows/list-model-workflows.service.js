import { NotFoundError } from '#src/utils/index.js';
import { MODEL_NOT_FOUND_MESSAGE } from '#src/modules/ai-model-generation-types/ai-model-generation-type.constants.js';
import { GENERATION_OPTIONS } from '#src/modules/ai-model-generation-types/generation-options.constants.js';
import { findAiModelByIdRepository } from '#src/modules/ai-models/shared/repositories/index.js';
import { listModelGenerationTypesRepository } from '#src/modules/ai-model-generation-types/shared/repositories/index.js';

export async function listModelWorkflowsService({ db, modelId }) {
  const model = await findAiModelByIdRepository({ db, id: modelId });

  if (!model) {
    throw new NotFoundError(MODEL_NOT_FOUND_MESSAGE);
  }

  const workflows = await listModelGenerationTypesRepository({ db, modelId });

  return { workflows, availableOptions: GENERATION_OPTIONS };
}
