import {
  getDefaultImageModelService,
  listImageCapabilitiesService,
} from '#src/modules/ai-providers/shared/services/index.js';
import * as userSettingsRepositories from '#src/modules/user-settings/shared/repositories/index.js';
import { presentImageOptionsService } from '#src/modules/generations/shared/services/index.js';

function resolveDefaultModel({
  models,
  userDefaultModel,
  configuredDefaultModel,
}) {
  const ids = models.map(({ model }) => model);

  if (ids.includes(userDefaultModel)) return userDefaultModel;
  if (ids.includes(configuredDefaultModel)) return configuredDefaultModel;

  return ids[0] ?? null;
}

export async function getImageOptionsService({ fastify, userId }) {
  const models = await listImageCapabilitiesService({ fastify });
  const userSettings =
    await userSettingsRepositories.findUserSettingsByUserIdRepository({
      db: fastify.db,
      userId,
    });
  const userDefaultModel = models.find(
    ({ model }) => model === userSettings?.defaultModel,
  )?.model;

  return presentImageOptionsService({
    defaultModel: resolveDefaultModel({
      models,
      userDefaultModel,
      configuredDefaultModel: getDefaultImageModelService({ fastify }),
    }),
    models,
  });
}
