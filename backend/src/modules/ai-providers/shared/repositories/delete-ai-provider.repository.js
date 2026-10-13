import { eq } from 'drizzle-orm';
import { aiProviders } from '#src/modules/ai-providers/ai-provider.table.js';

export async function deleteAiProviderRepository({ db, id }) {
  const [provider] = await db
    .delete(aiProviders)
    .where(eq(aiProviders.id, id))
    .returning({ id: aiProviders.id });

  return provider ?? null;
}
