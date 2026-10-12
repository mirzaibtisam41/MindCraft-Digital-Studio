import { and, eq } from 'drizzle-orm';
import { generations } from '#src/modules/generations/generation.table.js';

export async function findGenerationByIdAndUserIdRepository({
  db,
  id,
  userId,
}) {
  const [generation] = await db
    .select()
    .from(generations)
    .where(and(eq(generations.id, id), eq(generations.userId, userId)))
    .limit(1);

  return generation ?? null;
}
