import { BadRequestError } from '#src/utils/index.js';
import {
  QUALITY_NOT_ENABLED_MESSAGE,
  WORKFLOW_NOT_SAVED_MESSAGE,
} from '#src/modules/ai-model-credit-prices/ai-model-credit-price.constants.js';
import { findModelWorkflowRepository } from '#src/modules/model-workflows/shared/repositories/index.js';
import {
  deleteWorkflowCreditPricesExceptRepository,
  saveWorkflowCreditPriceRepository,
} from '#src/modules/ai-model-credit-prices/shared/repositories/index.js';

export async function saveWorkflowCreditPricesService({
  db,
  modelId,
  typeId,
  prices,
  adminId,
}) {
  const workflow = await findModelWorkflowRepository({
    db,
    modelId,
    generationTypeId: typeId,
  });

  if (!workflow?.enabledOptions) {
    throw new BadRequestError(WORKFLOW_NOT_SAVED_MESSAGE);
  }

  const enabledQualities = workflow.enabledOptions.qualities;
  const qualities = Object.keys(prices);
  const qualityNotEnabled = qualities.find(
    (quality) => !enabledQualities.includes(quality),
  );

  if (qualityNotEnabled) {
    throw new BadRequestError(
      `${QUALITY_NOT_ENABLED_MESSAGE}: ${qualityNotEnabled}`,
    );
  }

  await db.transaction(async (tx) => {
    await deleteWorkflowCreditPricesExceptRepository({
      db: tx,
      modelWorkflowId: workflow.id,
      qualitiesToKeep: qualities,
    });

    for (const quality of qualities) {
      await saveWorkflowCreditPriceRepository({
        db: tx,
        modelWorkflowId: workflow.id,
        quality,
        creditsPerImage: prices[quality],
        updatedBy: adminId,
      });
    }
  });

  return prices;
}
