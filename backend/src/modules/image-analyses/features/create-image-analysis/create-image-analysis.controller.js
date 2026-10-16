import { StatusCodes } from 'http-status-codes';
import { createImageAnalysisService } from '#src/modules/image-analyses/features/create-image-analysis/create-image-analysis.service.js';

export async function createImageAnalysisController(request, reply) {
  const analysis = await createImageAnalysisService({
    server: request.server,
    log: request.log,
    userId: request.user.id,
    data: request.body,
  });

  return reply.success({
    data: { analysis },
    message: 'Analysis ready',
    statusCode: StatusCodes.CREATED,
  });
}
