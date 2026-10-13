import { NotFoundError } from '#src/utils/index.js';
import {
  IMAGE_MODEL_EDITABLE_LIMITS,
  IMAGE_MODEL_RECENT_USAGE_DAYS,
} from '#src/modules/admin/admin.constants.js';
import { getImageModelUsageRepository } from '#src/modules/admin/shared/repositories/index.js';
import { presentImageModelService } from '#src/modules/admin/shared/services/index.js';
import { findImageModelByIdRepository } from '#src/modules/image-models/shared/repositories/index.js';

const DAY_MS = 24 * 60 * 60 * 1000;

export async function getImageModelService({ db, id }) {
  const imageModel = await findImageModelByIdRepository({ db, id });

  if (!imageModel) {
    throw new NotFoundError('Image model not found');
  }

  const usage = await getImageModelUsageRepository({
    db,
    modelId: id,
    since: new Date(Date.now() - IMAGE_MODEL_RECENT_USAGE_DAYS * DAY_MS),
  });

  return {
    model: presentImageModelService(imageModel),
    editable: IMAGE_MODEL_EDITABLE_LIMITS,
    usage: { ...usage, recentDays: IMAGE_MODEL_RECENT_USAGE_DAYS },
  };
}
