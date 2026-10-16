import { listImageAnalysesRepository } from '#src/modules/image-analyses/shared/repositories/index.js';
import { presentImageAnalysisService } from '#src/modules/image-analyses/shared/services/index.js';

export async function listImageAnalysesController(request, reply) {
  const analyses = await listImageAnalysesRepository({
    db: request.server.db,
    userId: request.user.id,
    imageId: request.query.imageId,
    limit: 50,
  });

  return reply.success({
    data: {
      analyses: analyses.map((analysis) =>
        presentImageAnalysisService({ analysis }),
      ),
    },
  });
}
