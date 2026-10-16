import { prompts } from '#src/modules/prompts/prompt.table.js';
import { PROMPT_COLUMNS } from '#src/modules/prompts/prompt-columns.constants.js';

export async function createPromptRepository({ db, data }) {
  const [prompt] = await db
    .insert(prompts)
    .values(data)
    .returning(PROMPT_COLUMNS);

  return prompt;
}
