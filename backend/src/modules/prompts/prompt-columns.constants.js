import { prompts } from '#src/modules/prompts/prompt.table.js';

export const PROMPT_COLUMNS = {
  id: prompts.id,
  title: prompts.title,
  text: prompts.text,
  category: prompts.category,
  style: prompts.style,
  usageCount: prompts.usageCount,
  lastUsedAt: prompts.lastUsedAt,
  createdAt: prompts.createdAt,
  updatedAt: prompts.updatedAt,
};
