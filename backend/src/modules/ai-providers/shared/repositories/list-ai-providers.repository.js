import { asc } from 'drizzle-orm';
import { aiProviders } from '#src/modules/ai-providers/ai-provider.table.js';
import { AI_PROVIDER_COLUMNS } from '#src/modules/ai-providers/ai-provider-columns.constants.js';

export function listAiProvidersRepository({ db }) {
  return db
    .select(AI_PROVIDER_COLUMNS)
    .from(aiProviders)
    .orderBy(asc(aiProviders.name));
}
