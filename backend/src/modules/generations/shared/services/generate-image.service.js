import {
  GENERATION_STATUS,
  GENERATION_TYPE,
} from '#src/modules/generations/generation.constants.js';
import {
  generateImageService as callImageProviderService,
  getDefaultImageModelService,
  listImageCapabilitiesService,
} from '#src/modules/ai-providers/shared/services/index.js';
import * as userSettingsRepositories from '#src/modules/user-settings/shared/repositories/index.js';
import * as generationRepositories from '#src/modules/generations/shared/repositories/index.js';
import {
  estimateGenerationCostService,
  refundGenerationCreditsService,
  reserveGenerationCreditsService,
} from '#src/modules/credits/shared/services/index.js';
import {
  estimateProviderCostUtil,
  mapGenerationErrorUtil,
} from '#src/modules/generations/shared/utils/index.js';
import { IMAGE_MODEL_TOOL } from '#src/modules/image-models/image-model.constants.js';
import { validatePromptService } from './validate-prompt.service.js';
import { validateModelService } from './validate-model.service.js';
import { validateSettingsService } from './validate-settings.service.js';
import { validateUnsupportedParamsService } from './validate-unsupported-params.service.js';
import { normalizeOptionsService } from './normalize-options.service.js';
import { buildProviderRequestService } from './build-provider-request.service.js';
import { saveGeneratedImagesService } from './save-generated-images.service.js';

async function markGenerationFailed({ fastify, generationId, error }) {
  const { category, message } = mapGenerationErrorUtil(error);

  await generationRepositories.updateGenerationStatusRepository({
    db: fastify.db,
    id: generationId,
    data: {
      status: GENERATION_STATUS.FAILED,
      errorCategory: category,
      errorMessage: message,
      completedAt: new Date(),
    },
  });
}

export async function generateImagesService({ fastify, userId, input }) {
  const { prompt, model, seed, negativePrompt, strength, ...rawSettings } =
    input;
  const userSettings =
    await userSettingsRepositories.findUserSettingsByUserIdRepository({
      db: fastify.db,
      userId,
    });
  const availableModels = await listImageCapabilitiesService({
    fastify,
    tool: IMAGE_MODEL_TOOL.TEXT_TO_IMAGE,
  });
  const validModel = validateModelService({
    model,
    userDefaultModel: userSettings?.defaultModel,
    defaultModel: getDefaultImageModelService({ models: availableModels }),
    supportedModels: availableModels.map(({ model: id }) => id),
  });
  const capabilities = availableModels.find(
    ({ model: id }) => id === validModel,
  );

  validateUnsupportedParamsService({
    params: { seed, negativePrompt, strength },
    capabilities,
  });
  const validPrompt = validatePromptService({ prompt, capabilities });
  const settings = validateSettingsService({
    settings: rawSettings,
    capabilities,
  });
  const options = normalizeOptionsService({
    settings,
    userSettings,
    capabilities,
  });

  const creditCost = estimateGenerationCostService({
    capabilities,
    options,
  });

  const generation = await fastify.db.transaction(async (tx) => {
    const created = await generationRepositories.insertGenerationRepository({
      db: tx,
      data: {
        userId,
        type: GENERATION_TYPE.TEXT_TO_IMAGE,
        status: GENERATION_STATUS.PROCESSING,
        prompt: validPrompt,
        provider: capabilities.provider,
        model: validModel,
        settings: options,
        imageCount: options.n,
        startedAt: new Date(),
      },
    });

    await reserveGenerationCreditsService({
      db: tx,
      userId,
      generationId: created.id,
      amount: creditCost,
    });

    return created;
  });

  try {
    const result = await callImageProviderService({
      fastify,
      ...buildProviderRequestService({
        model: validModel,
        prompt: validPrompt,
        options,
      }),
    });

    const images = await saveGeneratedImagesService({
      fastify,
      userId,
      generationId: generation.id,
      images: result.images,
      size: options.size,
      outputFormat: options.outputFormat,
    });

    const completed =
      await generationRepositories.updateGenerationStatusRepository({
        db: fastify.db,
        id: generation.id,
        data: {
          status: GENERATION_STATUS.COMPLETED,
          imageCount: images.length,
          providerCostUsd: estimateProviderCostUtil({
            capabilities,
            quality: options.quality,
            imageCount: images.length,
          }),
          completedAt: new Date(),
        },
      });

    return { generation: completed, images };
  } catch (error) {
    await refundGenerationCreditsService({
      db: fastify.db,
      userId,
      generationId: generation.id,
      amount: creditCost,
    });
    await markGenerationFailed({ fastify, generationId: generation.id, error });
    throw error;
  }
}
