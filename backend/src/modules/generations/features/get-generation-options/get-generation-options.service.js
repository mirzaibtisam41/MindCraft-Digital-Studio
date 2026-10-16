import { listAvailableModelWorkflowsRepository } from '#src/modules/model-workflows/shared/repositories/index.js';
import { listCreditPricesByWorkflowIdsRepository } from '#src/modules/ai-model-credit-prices/shared/repositories/index.js';
import { GENERATION_TYPE_CODE } from '#src/modules/generations/generation.constants.js';

export async function getGenerationOptionsService({
  db,
  generationTypeCode = GENERATION_TYPE_CODE.TEXT_TO_IMAGE,
}) {
  const workflows = await listAvailableModelWorkflowsRepository({
    db,
    generationTypeCode,
  });

  if (workflows.length === 0) return [];

  const prices = await listCreditPricesByWorkflowIdsRepository({
    db,
    modelWorkflowIds: workflows.map((workflow) => workflow.id),
  });

  return workflows.flatMap((workflow) => {
    const workflowPrices = Object.fromEntries(
      prices
        .filter((price) => price.modelWorkflowId === workflow.id)
        .map((price) => [price.quality, price.creditsPerImage]),
    );
    const pricedQualities = workflow.enabledOptions.qualities.filter(
      (quality) => quality in workflowPrices,
    );

    if (pricedQualities.length === 0) return [];

    return [
      {
        ...workflow.model,
        provider: workflow.provider,
        enabledOptions: {
          ...workflow.enabledOptions,
          qualities: pricedQualities,
        },
        defaultOptions: workflow.defaultOptions,
        prices: Object.fromEntries(
          pricedQualities.map((quality) => [quality, workflowPrices[quality]]),
        ),
      },
    ];
  });
}
