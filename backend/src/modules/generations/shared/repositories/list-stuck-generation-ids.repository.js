import { and, asc, eq, lt } from 'drizzle-orm';
import { generations } from '#src/modules/generations/generation.table.js';
import { GENERATION_STATUS } from '#src/modules/generations/generation.constants.js';

export async function listStuckGenerationIdsRepository({ db, startedBefore }) {
  const stuckGenerations = await db
    .select({ id: generations.id })
    .from(generations)
    .where(
      and(
        eq(generations.status, GENERATION_STATUS.PROCESSING),
        lt(generations.createdAt, startedBefore),
      ),
    )
    .orderBy(asc(generations.createdAt))
    .limit(100);

  return stuckGenerations.map((generation) => generation.id);
}
