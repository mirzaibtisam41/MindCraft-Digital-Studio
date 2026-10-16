import { generations } from '#src/modules/generations/generation.table.js';
import { GENERATION_COLUMNS } from '#src/modules/generations/generation-columns.constants.js';

export async function createGenerationRepository({ db, data }) {
  const [generation] = await db
    .insert(generations)
    .values(data)
    .returning(GENERATION_COLUMNS);

  return generation;
}
