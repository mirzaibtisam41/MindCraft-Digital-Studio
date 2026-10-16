import { generations } from '#src/modules/generations/generation.table.js';
import { aiModels } from '#src/modules/ai-models/ai-model.table.js';
import { generationTypes } from '#src/modules/generation-types/generation-type.table.js';

export const GENERATION_COLUMNS = {
  id: generations.id,
  userId: generations.userId,
  modelId: generations.modelId,
  modelWorkflowId: generations.modelWorkflowId,
  sourceImageId: generations.sourceImageId,
  prompt: generations.prompt,
  options: generations.options,
  status: generations.status,
  creditsPerImage: generations.creditsPerImage,
  totalCredits: generations.totalCredits,
  errorCategory: generations.errorCategory,
  completedAt: generations.completedAt,
  createdAt: generations.createdAt,
};

export const GENERATION_WITH_MODEL_COLUMNS = {
  id: generations.id,
  type: generationTypes.code,
  sourceImageId: generations.sourceImageId,
  prompt: generations.prompt,
  options: generations.options,
  status: generations.status,
  creditsPerImage: generations.creditsPerImage,
  totalCredits: generations.totalCredits,
  errorCategory: generations.errorCategory,
  completedAt: generations.completedAt,
  createdAt: generations.createdAt,
  model: { id: aiModels.id, name: aiModels.name },
};
