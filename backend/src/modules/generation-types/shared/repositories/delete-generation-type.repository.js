import { eq } from 'drizzle-orm';
import { generationTypes } from '#src/modules/generation-types/generation-type.table.js';

export async function deleteGenerationTypeRepository({ db, id }) {
  const [generationType] = await db
    .delete(generationTypes)
    .where(eq(generationTypes.id, id))
    .returning({ id: generationTypes.id });

  return generationType ?? null;
}
