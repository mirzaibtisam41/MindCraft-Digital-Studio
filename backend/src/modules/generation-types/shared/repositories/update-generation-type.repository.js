import { eq } from 'drizzle-orm';
import { generationTypes } from '#src/modules/generation-types/generation-type.table.js';
import { GENERATION_TYPE_COLUMNS } from '#src/modules/generation-types/generation-type-columns.constants.js';

export async function updateGenerationTypeRepository({ db, id, data }) {
  const [generationType] = await db
    .update(generationTypes)
    .set(data)
    .where(eq(generationTypes.id, id))
    .returning(GENERATION_TYPE_COLUMNS);

  return generationType ?? null;
}
