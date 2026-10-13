import { generationTypes } from '#src/modules/generation-types/generation-type.table.js';
import { GENERATION_TYPE_COLUMNS } from '#src/modules/generation-types/generation-type-columns.constants.js';

export async function createGenerationTypeRepository({ db, data }) {
  const [generationType] = await db
    .insert(generationTypes)
    .values(data)
    .returning(GENERATION_TYPE_COLUMNS);

  return generationType;
}
