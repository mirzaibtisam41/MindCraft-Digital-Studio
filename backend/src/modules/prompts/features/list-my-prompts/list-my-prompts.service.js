import { PROMPT_CATEGORIES } from '#src/modules/prompts/prompt.constants.js';
import { listUserPromptsRepository } from '#src/modules/prompts/shared/repositories/index.js';

export async function listMyPromptsService({ db, userId, query }) {
  const { prompts, categoryRows } = await listUserPromptsRepository({
    db,
    userId,
    category: query.category,
    search: query.search?.trim(),
    limit: 200,
  });

  const counts = Object.fromEntries(
    PROMPT_CATEGORIES.map((category) => [
      category,
      categoryRows.find((row) => row.category === category)?.total ?? 0,
    ]),
  );

  return {
    prompts,
    categoryCounts: {
      all: Object.values(counts).reduce((sum, value) => sum + value, 0),
      ...counts,
    },
  };
}
