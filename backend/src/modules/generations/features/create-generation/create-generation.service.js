import { randomUUID } from 'node:crypto';
import { PROVIDER_ERROR_CATEGORY } from '#src/constants/index.js';
import {
  BadRequestError,
  NotFoundError,
  ProviderError,
  ServiceUnavailableError,
} from '#src/utils/index.js';
import { IMAGE_SOURCE } from '#src/modules/images/image.constants.js';
import { createImageRepository } from '#src/modules/images/shared/repositories/index.js';
import {
  buildImageStorageKeyUtil,
  readImageDetailsUtil,
} from '#src/modules/images/shared/utils/index.js';
import { findUserGenerationByIdRepository } from '#src/modules/generations/shared/repositories/index.js';
import {
  completeGenerationService,
  estimateGenerationCostService,
  failGenerationService,
  presentGenerationsService,
  startGenerationService,
} from '#src/modules/generations/shared/services/index.js';

const CATEGORIES_THAT_NEED_AN_ADMIN = [
  PROVIDER_ERROR_CATEGORY.QUOTA_EXCEEDED,
  PROVIDER_ERROR_CATEGORY.PROVIDER_AUTH_FAILED,
  PROVIDER_ERROR_CATEGORY.UNKNOWN,
];

function buildFailureError({ category, refundedCredits }) {
  const refund = `Your ${refundedCredits} credits were refunded.`;

  if (category === PROVIDER_ERROR_CATEGORY.SAFETY_REJECTED) {
    return new BadRequestError(
      `The safety filter blocked this prompt. Try different wording. ${refund}`,
    );
  }

  if (category === PROVIDER_ERROR_CATEGORY.INVALID_REQUEST) {
    return new BadRequestError(
      `The image provider could not process this request. ${refund}`,
    );
  }

  if (category === PROVIDER_ERROR_CATEGORY.RATE_LIMITED) {
    return new ServiceUnavailableError(
      `The image provider is busy right now, please try again in a minute. ${refund}`,
    );
  }

  if (category === PROVIDER_ERROR_CATEGORY.TIMEOUT) {
    return new ServiceUnavailableError(
      `The image provider took too long to answer. ${refund}`,
    );
  }

  return new ServiceUnavailableError(
    `Image generation is not available right now, please try again later. ${refund}`,
  );
}

async function failAndThrow({ db, log, generation, error }) {
  const category =
    error instanceof ProviderError
      ? error.category
      : PROVIDER_ERROR_CATEGORY.UNKNOWN;

  await failGenerationService({
    db,
    generationId: generation.id,
    errorCategory: category,
  });

  const logDetails = { err: error, generationId: generation.id, category };

  if (CATEGORIES_THAT_NEED_AN_ADMIN.includes(category)) {
    log.error(logDetails, 'Image generation failed');
  } else {
    log.warn(logDetails, 'Image generation failed');
  }

  throw buildFailureError({
    category,
    refundedCredits: generation.totalCredits,
  });
}

async function saveGeneratedImages({
  db,
  storage,
  log,
  userId,
  generation,
  imageBuffers,
}) {
  const uploadedKeys = [];

  try {
    const files = imageBuffers.map((fileBuffer) => {
      const details = readImageDetailsUtil({ fileBuffer });

      if (!details) {
        throw new Error('The provider returned a file that is not an image');
      }

      return { id: randomUUID(), fileBuffer, details };
    });

    for (const file of files) {
      file.storageKey = buildImageStorageKeyUtil({
        userId,
        source: IMAGE_SOURCE.GENERATED,
        imageId: file.id,
        extension: file.details.extension,
      });

      await storage.uploadFile({
        key: file.storageKey,
        body: file.fileBuffer,
        contentType: file.details.contentType,
      });
      uploadedKeys.push(file.storageKey);
    }

    await db.transaction(async (tx) => {
      for (const file of files) {
        await createImageRepository({
          db: tx,
          data: {
            id: file.id,
            userId,
            source: IMAGE_SOURCE.GENERATED,
            generationId: generation.id,
            storageKey: file.storageKey,
            contentType: file.details.contentType,
            width: file.details.width,
            height: file.details.height,
            sizeBytes: file.fileBuffer.length,
          },
        });
      }

      const completed = await completeGenerationService({
        db: tx,
        generationId: generation.id,
      });

      if (!completed) {
        throw new Error('The generation was already finished and refunded');
      }
    });
  } catch (error) {
    await Promise.all(
      uploadedKeys.map((key) =>
        storage.deleteFile({ key }).catch((deleteError) => {
          log.error(
            { err: deleteError, storageKey: key },
            'Generated image could not be removed from storage',
          );
        }),
      ),
    );

    throw error;
  }
}

export async function createGenerationService({ server, log, userId, data }) {
  const { db, storage, openai } = server;
  const prompt = data.prompt.trim();
  const { options } = data;

  const estimate = await estimateGenerationCostService({
    db,
    modelId: data.modelId,
    generationTypeCode: 'text_to_image',
    options,
  });

  if (estimate.model.provider.code !== 'openai') {
    throw new BadRequestError('This model cannot generate images yet');
  }

  const generation = await startGenerationService({
    db,
    userId,
    estimate,
    prompt,
    options,
  });

  let imageBuffers;

  try {
    ({ imageBuffers } = await openai.generateImages({
      model: estimate.model.providerModelId,
      prompt,
      size: options.size,
      quality: options.quality,
      outputFormat: options.outputFormat,
      n: options.n,
    }));

    await saveGeneratedImages({
      db,
      storage,
      log,
      userId,
      generation,
      imageBuffers,
    });
  } catch (error) {
    await failAndThrow({ db, log, generation, error });
  }

  const savedGeneration = await findUserGenerationByIdRepository({
    db,
    id: generation.id,
    userId,
  });

  if (!savedGeneration) {
    throw new NotFoundError('Generation not found');
  }

  const [presented] = await presentGenerationsService({
    db,
    storage,
    generations: [savedGeneration],
  });

  return presented;
}
