import { asc } from 'drizzle-orm';
import { generationTypes } from '#src/modules/generation-types/generation-type.table.js';
import { GENERATION_TYPE_COLUMNS } from '#src/modules/generation-types/generation-type-columns.constants.js';

export function listGenerationTypesRepository({ db }) {
  return db
    .select(GENERATION_TYPE_COLUMNS)
    .from(generationTypes)
    .orderBy(asc(generationTypes.name));
}
