import { eq } from 'drizzle-orm';
import { generations } from '#src/modules/generations/generation.table.js';

export async function updateGenerationStatusRepository({ db, id, data }) {
  const [generation] = await db
    .update(generations)
    .set(data)
    .where(eq(generations.id, id))
    .returning();

  return generation ?? null;
}
