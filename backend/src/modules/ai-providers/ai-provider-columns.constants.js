import { aiProviders } from '#src/modules/ai-providers/ai-provider.table.js';

export const AI_PROVIDER_COLUMNS = {
  id: aiProviders.id,
  code: aiProviders.code,
  name: aiProviders.name,
  isActive: aiProviders.isActive,
  createdAt: aiProviders.createdAt,
  updatedAt: aiProviders.updatedAt,
};
