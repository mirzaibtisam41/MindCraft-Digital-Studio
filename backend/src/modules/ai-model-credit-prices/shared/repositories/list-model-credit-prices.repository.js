import { eq } from 'drizzle-orm';
import { aiModelCreditPrices } from '#src/modules/ai-model-credit-prices/ai-model-credit-price.table.js';
import { aiModelGenerationTypes } from '#src/modules/ai-model-generation-types/ai-model-generation-type.table.js';

export function listModelCreditPricesRepository({ db, modelId }) {
  return db
    .select({
      modelGenerationTypeId: aiModelCreditPrices.modelGenerationTypeId,
      generationTypeId: aiModelGenerationTypes.generationTypeId,
      quality: aiModelCreditPrices.quality,
      creditsPerImage: aiModelCreditPrices.creditsPerImage,
      updatedAt: aiModelCreditPrices.updatedAt,
    })
    .from(aiModelCreditPrices)
    .innerJoin(
      aiModelGenerationTypes,
      eq(aiModelGenerationTypes.id, aiModelCreditPrices.modelGenerationTypeId),
    )
    .where(eq(aiModelGenerationTypes.modelId, modelId));
}
