import { eq } from 'drizzle-orm';
import { aiProviders } from '#src/modules/ai-providers/ai-provider.table.js';

export async function findAiProviderByCodeRepository({ db, code }) {
  const [provider] = await db
    .select({ id: aiProviders.id })
    .from(aiProviders)
    .where(eq(aiProviders.code, code))
    .limit(1);

  return provider ?? null;
}
