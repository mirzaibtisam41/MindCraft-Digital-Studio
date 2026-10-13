import { eq } from 'drizzle-orm';
import { aiProviders } from '#src/modules/ai-providers/ai-provider.table.js';
import { AI_PROVIDER_COLUMNS } from '#src/modules/ai-providers/ai-provider-columns.constants.js';

export async function updateAiProviderRepository({ db, id, data }) {
  const [provider] = await db
    .update(aiProviders)
    .set(data)
    .where(eq(aiProviders.id, id))
    .returning(AI_PROVIDER_COLUMNS);

  return provider ?? null;
}
