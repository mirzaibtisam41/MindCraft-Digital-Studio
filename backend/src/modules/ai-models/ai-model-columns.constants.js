import { aiModels } from '#src/modules/ai-models/ai-model.table.js';
import { aiProviders } from '#src/modules/ai-providers/ai-provider.table.js';

export const AI_MODEL_COLUMNS = {
  id: aiModels.id,
  providerId: aiModels.providerId,
  name: aiModels.name,
  slug: aiModels.slug,
  providerModelId: aiModels.providerModelId,
  description: aiModels.description,
  status: aiModels.status,
  sortOrder: aiModels.sortOrder,
  createdBy: aiModels.createdBy,
  updatedBy: aiModels.updatedBy,
  createdAt: aiModels.createdAt,
  updatedAt: aiModels.updatedAt,
};

export const AI_MODEL_WITH_PROVIDER_COLUMNS = {
  ...AI_MODEL_COLUMNS,
  provider: {
    id: aiProviders.id,
    code: aiProviders.code,
    name: aiProviders.name,
    isActive: aiProviders.isActive,
  },
};
