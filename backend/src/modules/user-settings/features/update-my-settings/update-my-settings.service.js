import { BadRequestError } from '#src/utils/index.js';
import { AI_MODEL_STATUS } from '#src/modules/ai-models/ai-model.constants.js';
import { findAiModelByIdRepository } from '#src/modules/ai-models/shared/repositories/index.js';
import { saveUserSettingsRepository } from '#src/modules/user-settings/shared/repositories/index.js';

export async function updateMySettingsService({ db, userId, data }) {
  if (data.defaultModelId) {
    const model = await findAiModelByIdRepository({
      db,
      id: data.defaultModelId,
    });

    if (!model || model.status !== AI_MODEL_STATUS.ACTIVE) {
      throw new BadRequestError('Choose a model that is available right now');
    }
  }

  return saveUserSettingsRepository({ db, userId, data });
}
