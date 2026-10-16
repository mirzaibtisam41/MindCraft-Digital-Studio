import { IMAGE_ANALYSIS_TASKS } from '#src/modules/image-analyses/image-analysis.constants.js';
import { getVisionSettingsService } from '#src/modules/platform-settings/shared/services/index.js';

export async function getVisionOptionsController(request, reply) {
  const settings = await getVisionSettingsService({ db: request.server.db });

  return reply.success({
    data: {
      model: settings.model,
      creditsPerAnalysis: settings.credits,
      tasks: IMAGE_ANALYSIS_TASKS,
    },
  });
}
