import { BadRequestError } from '#src/utils/index.js';
import { AI_MODEL_STATUS } from '#src/modules/ai-models/ai-model.constants.js';
import { findAiModelByIdRepository } from '#src/modules/ai-models/shared/repositories/index.js';
import { findEnabledModelWorkflowByTypeCodeRepository } from '#src/modules/model-workflows/shared/repositories/index.js';
import { findWorkflowCreditPriceRepository } from '#src/modules/ai-model-credit-prices/shared/repositories/index.js';

function findOptionOutsideWorkflow({ enabledOptions, options }) {
  if (!enabledOptions.sizes.includes(options.size)) {
    return 'This size is not available for this model';
  }

  if (!enabledOptions.qualities.includes(options.quality)) {
    return 'This quality is not available for this model';
  }

  if (!enabledOptions.outputFormats.includes(options.outputFormat)) {
    return 'This output format is not available for this model';
  }

  if (options.n < 1 || options.n > enabledOptions.maxImagesPerRequest) {
    return `This model makes 1 to ${enabledOptions.maxImagesPerRequest} images per request`;
  }

  return null;
}

export async function estimateGenerationCostService({
  db,
  modelId,
  generationTypeCode,
  options,
}) {
  const model = await findAiModelByIdRepository({ db, id: modelId });

  if (
    !model ||
    model.status !== AI_MODEL_STATUS.ACTIVE ||
    !model.provider.isActive
  ) {
    throw new BadRequestError('This model is not available right now');
  }

  const workflow = await findEnabledModelWorkflowByTypeCodeRepository({
    db,
    modelId,
    generationTypeCode,
  });

  if (!workflow) {
    throw new BadRequestError(
      'This model does not offer this kind of generation',
    );
  }

  const problem = findOptionOutsideWorkflow({
    enabledOptions: workflow.enabledOptions,
    options,
  });

  if (problem) throw new BadRequestError(problem);

  const price = await findWorkflowCreditPriceRepository({
    db,
    modelWorkflowId: workflow.id,
    quality: options.quality,
  });

  if (!price) {
    throw new BadRequestError(
      'This quality has no price yet, please choose another one',
    );
  }

  return {
    model,
    modelWorkflowId: workflow.id,
    creditsPerImage: price.creditsPerImage,
    totalCredits: price.creditsPerImage * options.n,
  };
}
