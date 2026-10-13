import { eq } from 'drizzle-orm';
import { generationTypes } from '#src/modules/generation-types/generation-type.table.js';
import { GENERATION_TYPE_COLUMNS } from '#src/modules/generation-types/generation-type-columns.constants.js';

export async function findGenerationTypeByIdRepository({ db, id }) {
  const [generationType] = await db
    .select(GENERATION_TYPE_COLUMNS)
    .from(generationTypes)
    .where(eq(generationTypes.id, id))
    .limit(1);

  return generationType ?? null;
}
