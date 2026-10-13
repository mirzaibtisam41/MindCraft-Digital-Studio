import { aiModelCreditPrices } from '#src/modules/ai-model-credit-prices/ai-model-credit-price.table.js';

export async function saveWorkflowCreditPriceRepository({
  db,
  modelGenerationTypeId,
  quality,
  creditsPerImage,
  updatedBy,
}) {
  await db
    .insert(aiModelCreditPrices)
    .values({ modelGenerationTypeId, quality, creditsPerImage, updatedBy })
    .onConflictDoUpdate({
      target: [
        aiModelCreditPrices.modelGenerationTypeId,
        aiModelCreditPrices.quality,
      ],
      set: { creditsPerImage, updatedBy, updatedAt: new Date() },
    });
}
