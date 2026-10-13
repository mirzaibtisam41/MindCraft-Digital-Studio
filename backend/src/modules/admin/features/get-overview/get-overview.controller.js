import { getOverviewService } from './get-overview.service.js';

export async function getOverviewController(request, reply) {
  const overview = await getOverviewService({
    db: request.server.db,
    appConfig: request.server.config,
    range: request.query.range,
    timezone: request.query.timezone,
  });

  return reply.success({ data: overview });
}
