import {
  getDefaultImageModelService,
  listImageCapabilitiesService,
} from '#src/modules/ai-providers/shared/services/index.js';
import * as userSettingsRepositories from '#src/modules/user-settings/shared/repositories/index.js';
import { presentImageOptionsService } from '#src/modules/generations/shared/services/index.js';

export async function getImageOptionsService({ fastify, userId }) {
  const models = listImageCapabilitiesService();
  const userSettings =
    await userSettingsRepositories.findUserSettingsByUserIdRepository({
      db: fastify.db,
      userId,
    });
  const userDefaultModel = models.find(
    ({ model }) => model === userSettings?.defaultModel,
  )?.model;

  return presentImageOptionsService({
    defaultModel: userDefaultModel ?? getDefaultImageModelService({ fastify }),
    models,
  });
}
