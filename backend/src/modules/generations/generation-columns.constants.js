import { generations } from '#src/modules/generations/generation.table.js';

export const GENERATION_COLUMNS = {
  id: generations.id,
  userId: generations.userId,
  modelId: generations.modelId,
  modelWorkflowId: generations.modelWorkflowId,
  prompt: generations.prompt,
  options: generations.options,
  status: generations.status,
  creditsPerImage: generations.creditsPerImage,
  totalCredits: generations.totalCredits,
  errorCategory: generations.errorCategory,
  completedAt: generations.completedAt,
  createdAt: generations.createdAt,
};
