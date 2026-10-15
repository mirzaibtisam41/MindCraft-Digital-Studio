import { aiModelCreditPrices } from '#src/modules/ai-model-credit-prices/ai-model-credit-price.table.js';

export async function saveWorkflowCreditPriceRepository({
  db,
  modelWorkflowId,
  quality,
  creditsPerImage,
  updatedBy,
}) {
  await db
    .insert(aiModelCreditPrices)
    .values({ modelWorkflowId, quality, creditsPerImage, updatedBy })
    .onConflictDoUpdate({
      target: [
        aiModelCreditPrices.modelWorkflowId,
        aiModelCreditPrices.quality,
      ],
      set: { creditsPerImage, updatedBy, updatedAt: new Date() },
    });
}
