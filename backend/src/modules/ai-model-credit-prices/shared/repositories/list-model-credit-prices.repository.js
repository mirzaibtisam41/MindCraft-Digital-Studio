import { eq } from 'drizzle-orm';
import { aiModelCreditPrices } from '#src/modules/ai-model-credit-prices/ai-model-credit-price.table.js';
import { modelWorkflows } from '#src/modules/model-workflows/model-workflow.table.js';

export function listModelCreditPricesRepository({ db, modelId }) {
  return db
    .select({
      modelWorkflowId: aiModelCreditPrices.modelWorkflowId,
      generationTypeId: modelWorkflows.generationTypeId,
      quality: aiModelCreditPrices.quality,
      creditsPerImage: aiModelCreditPrices.creditsPerImage,
      updatedAt: aiModelCreditPrices.updatedAt,
    })
    .from(aiModelCreditPrices)
    .innerJoin(
      modelWorkflows,
      eq(modelWorkflows.id, aiModelCreditPrices.modelWorkflowId),
    )
    .where(eq(modelWorkflows.modelId, modelId));
}
