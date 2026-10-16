import { and, eq } from 'drizzle-orm';
import { generations } from '#src/modules/generations/generation.table.js';
import { GENERATION_COLUMNS } from '#src/modules/generations/generation-columns.constants.js';
import { GENERATION_STATUS } from '#src/modules/generations/generation.constants.js';

export async function finishProcessingGenerationRepository({ db, id, data }) {
  const [generation] = await db
    .update(generations)
    .set({ ...data, completedAt: new Date() })
    .where(
      and(
        eq(generations.id, id),
        eq(generations.status, GENERATION_STATUS.PROCESSING),
      ),
    )
    .returning(GENERATION_COLUMNS);

  return generation ?? null;
}
