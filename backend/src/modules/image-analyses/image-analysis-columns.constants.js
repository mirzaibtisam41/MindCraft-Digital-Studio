import { imageAnalyses } from '#src/modules/image-analyses/image-analysis.table.js';

export const IMAGE_ANALYSIS_COLUMNS = {
  id: imageAnalyses.id,
  userId: imageAnalyses.userId,
  imageId: imageAnalyses.imageId,
  task: imageAnalyses.task,
  question: imageAnalyses.question,
  result: imageAnalyses.result,
  status: imageAnalyses.status,
  credits: imageAnalyses.credits,
  model: imageAnalyses.model,
  errorCategory: imageAnalyses.errorCategory,
  completedAt: imageAnalyses.completedAt,
  createdAt: imageAnalyses.createdAt,
};
