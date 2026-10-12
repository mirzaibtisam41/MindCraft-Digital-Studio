import {
  ADMIN_EDITABLE_IMAGE_BACKGROUNDS,
  ADMIN_EDITABLE_IMAGE_MODERATIONS,
  ADMIN_EDITABLE_IMAGE_QUALITIES,
  ADMIN_EDITABLE_IMAGE_SIZES,
  ADMIN_MAX_IMAGES_PER_REQUEST,
  IMAGE_MODEL_CREDITS_MAX,
  IMAGE_MODEL_CREDITS_MIN,
  IMAGE_MODEL_SORT_ORDER_MAX,
} from '#src/modules/admin/admin.constants.js';
import { presentImageModelService } from '#src/modules/admin/shared/services/index.js';
import { findAllImageModelsRepository } from '#src/modules/image-models/shared/repositories/index.js';

const EDITABLE_LIMITS = {
  sizes: ADMIN_EDITABLE_IMAGE_SIZES,
  qualities: ADMIN_EDITABLE_IMAGE_QUALITIES,
  backgrounds: ADMIN_EDITABLE_IMAGE_BACKGROUNDS,
  moderations: ADMIN_EDITABLE_IMAGE_MODERATIONS,
  maxImagesPerRequest: ADMIN_MAX_IMAGES_PER_REQUEST,
  creditsPerImage: {
    min: IMAGE_MODEL_CREDITS_MIN,
    max: IMAGE_MODEL_CREDITS_MAX,
  },
  sortOrderMax: IMAGE_MODEL_SORT_ORDER_MAX,
};

export async function listImageModelsController(request, reply) {
  const imageModels = await findAllImageModelsRepository({
    db: request.server.db,
  });

  return reply.success({
    data: {
      models: imageModels.map(presentImageModelService),
      editable: EDITABLE_LIMITS,
    },
  });
}
