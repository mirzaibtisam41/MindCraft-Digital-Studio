import { BadRequestError, NotFoundError } from '#src/utils/index.js';
import {
  GENERATION_TYPE_INACTIVE_MESSAGE,
  OPTIONS_REQUIRED_TO_ENABLE_MESSAGE,
  OPTIONS_SENT_TOGETHER_MESSAGE,
} from '#src/modules/ai-model-generation-types/ai-model-generation-type.constants.js';
import { AI_MODEL_NOT_FOUND_MESSAGE } from '#src/modules/ai-models/ai-model.constants.js';
import { GENERATION_TYPE_NOT_FOUND_MESSAGE } from '#src/modules/generation-types/generation-type.constants.js';
import { findAiModelByIdRepository } from '#src/modules/ai-models/shared/repositories/index.js';
import { findGenerationTypeByIdRepository } from '#src/modules/generation-types/shared/repositories/index.js';
import { saveModelGenerationTypeRepository } from '#src/modules/ai-model-generation-types/shared/repositories/index.js';
import { deleteWorkflowCreditPricesExceptRepository } from '#src/modules/ai-model-credit-prices/shared/repositories/index.js';

function findDefaultOutsideEnabledOptions({ enabledOptions, defaultOptions }) {
  if (!enabledOptions.sizes.includes(defaultOptions.size)) {
    return 'The default size must be one of the enabled sizes';
  }

  if (!enabledOptions.qualities.includes(defaultOptions.quality)) {
    return 'The default quality must be one of the enabled qualities';
  }

  if (!enabledOptions.outputFormats.includes(defaultOptions.outputFormat)) {
    return 'The default output format must be one of the enabled formats';
  }

  if (defaultOptions.n > enabledOptions.maxImagesPerRequest) {
    return 'The default number of images cannot be more than the maximum';
  }

  return null;
}

export async function saveModelWorkflowService({ db, modelId, typeId, data }) {
  const enabledOptions = data.enabledOptions ?? null;
  const defaultOptions = data.defaultOptions ?? null;

  const model = await findAiModelByIdRepository({ db, id: modelId });

  if (!model) {
    throw new NotFoundError(AI_MODEL_NOT_FOUND_MESSAGE);
  }

  const generationType = await findGenerationTypeByIdRepository({
    db,
    id: typeId,
  });

  if (!generationType) {
    throw new NotFoundError(GENERATION_TYPE_NOT_FOUND_MESSAGE);
  }

  if (Boolean(enabledOptions) !== Boolean(defaultOptions)) {
    throw new BadRequestError(OPTIONS_SENT_TOGETHER_MESSAGE);
  }

  if (enabledOptions) {
    const problem = findDefaultOutsideEnabledOptions({
      enabledOptions,
      defaultOptions,
    });

    if (problem) throw new BadRequestError(problem);
  }

  if (data.isEnabled && !enabledOptions) {
    throw new BadRequestError(OPTIONS_REQUIRED_TO_ENABLE_MESSAGE);
  }

  if (data.isEnabled && !generationType.isActive) {
    throw new BadRequestError(GENERATION_TYPE_INACTIVE_MESSAGE);
  }

  return db.transaction(async (tx) => {
    const workflow = await saveModelGenerationTypeRepository({
      db: tx,
      data: {
        modelId,
        generationTypeId: typeId,
        isEnabled: data.isEnabled,
        enabledOptions,
        defaultOptions,
      },
    });

    await deleteWorkflowCreditPricesExceptRepository({
      db: tx,
      modelGenerationTypeId: workflow.id,
      qualitiesToKeep: enabledOptions?.qualities ?? [],
    });

    return workflow;
  });
}
