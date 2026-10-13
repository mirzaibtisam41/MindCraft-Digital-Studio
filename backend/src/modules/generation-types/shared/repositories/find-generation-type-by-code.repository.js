import { eq } from 'drizzle-orm';
import { generationTypes } from '#src/modules/generation-types/generation-type.table.js';

export async function findGenerationTypeByCodeRepository({ db, code }) {
  const [generationType] = await db
    .select({ id: generationTypes.id })
    .from(generationTypes)
    .where(eq(generationTypes.code, code))
    .limit(1);

  return generationType ?? null;
}
