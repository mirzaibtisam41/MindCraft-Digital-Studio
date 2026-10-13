import { IMAGE_MODEL_EDITABLE_LIMITS } from '#src/modules/admin/admin.constants.js';
import { presentImageModelService } from '#src/modules/admin/shared/services/index.js';
import { findAllImageModelsRepository } from '#src/modules/image-models/shared/repositories/index.js';

export async function listImageModelsController(request, reply) {
  const imageModels = await findAllImageModelsRepository({
    db: request.server.db,
  });

  return reply.success({
    data: {
      models: imageModels.map(presentImageModelService),
      editable: IMAGE_MODEL_EDITABLE_LIMITS,
    },
  });
}
