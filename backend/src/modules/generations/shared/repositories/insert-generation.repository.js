import { generations } from '#src/modules/generations/generation.table.js';

export async function insertGenerationRepository({ db, data }) {
  const [generation] = await db.insert(generations).values(data).returning();

  return generation;
}
