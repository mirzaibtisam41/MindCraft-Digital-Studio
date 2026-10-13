import { aiProviders } from '#src/modules/ai-providers/ai-provider.table.js';
import { AI_MODEL_COLUMNS } from '#src/modules/ai-models/ai-model-columns.constants.js';

export const AI_MODEL_WITH_PROVIDER_COLUMNS = {
  ...AI_MODEL_COLUMNS,
  provider: {
    id: aiProviders.id,
    code: aiProviders.code,
    name: aiProviders.name,
    isActive: aiProviders.isActive,
  },
};
