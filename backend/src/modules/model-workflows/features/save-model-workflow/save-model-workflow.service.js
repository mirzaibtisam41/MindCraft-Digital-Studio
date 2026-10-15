import { BadRequestError, NotFoundError } from '#src/utils/index.js';
import { findAiModelByIdRepository } from '#src/modules/ai-models/shared/repositories/index.js';
import { findGenerationTypeByIdRepository } from '#src/modules/generation-types/shared/repositories/index.js';
import { saveModelWorkflowRepository } from '#src/modules/model-workflows/shared/repositories/index.js';
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
    throw new NotFoundError('Model not found');
  }

  const generationType = await findGenerationTypeByIdRepository({
    db,
    id: typeId,
  });

  if (!generationType) {
    throw new NotFoundError('Generation type not found');
  }

  if (Boolean(enabledOptions) !== Boolean(defaultOptions)) {
    throw new BadRequestError(
      'Send enabled options and default options together',
    );
  }

  if (enabledOptions) {
    const problem = findDefaultOutsideEnabledOptions({
      enabledOptions,
      defaultOptions,
    });

    if (problem) throw new BadRequestError(problem);
  }

  if (data.isEnabled && !enabledOptions) {
    throw new BadRequestError(
      'Choose the enabled options and defaults before enabling this workflow',
    );
  }

  if (data.isEnabled && !generationType.isActive) {
    throw new BadRequestError(
      'This generation type is turned off, so the workflow cannot be enabled',
    );
  }

  return db.transaction(async (tx) => {
    const workflow = await saveModelWorkflowRepository({
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
      modelWorkflowId: workflow.id,
      qualitiesToKeep: enabledOptions?.qualities ?? [],
    });

    return workflow;
  });
}
