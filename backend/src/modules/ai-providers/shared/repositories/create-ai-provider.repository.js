import { aiProviders } from '#src/modules/ai-providers/ai-provider.table.js';
import { AI_PROVIDER_COLUMNS } from '#src/modules/ai-providers/ai-provider-columns.constants.js';

export async function createAiProviderRepository({ db, data }) {
  const [provider] = await db
    .insert(aiProviders)
    .values(data)
    .returning(AI_PROVIDER_COLUMNS);

  return provider;
}
