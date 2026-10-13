import { eq } from 'drizzle-orm';
import { aiProviders } from '#src/modules/ai-providers/ai-provider.table.js';
import { AI_PROVIDER_COLUMNS } from '#src/modules/ai-providers/ai-provider-columns.constants.js';

export async function findAiProviderByIdRepository({ db, id }) {
  const [provider] = await db
    .select(AI_PROVIDER_COLUMNS)
    .from(aiProviders)
    .where(eq(aiProviders.id, id))
    .limit(1);

  return provider ?? null;
}
