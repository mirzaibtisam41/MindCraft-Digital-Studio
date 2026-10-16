export function presentImageAnalysisService({ analysis }) {
  return {
    id: analysis.id,
    imageId: analysis.imageId,
    task: analysis.task,
    question: analysis.question,
    result: analysis.result,
    status: analysis.status,
    credits: analysis.credits,
    model: analysis.model,
    errorCategory: analysis.errorCategory,
    completedAt: analysis.completedAt,
    createdAt: analysis.createdAt,
  };
}
