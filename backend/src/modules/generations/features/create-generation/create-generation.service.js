import { randomUUID } from 'node:crypto';
import { PROVIDER_ERROR_CATEGORY } from '#src/constants/index.js';
import {
  BadRequestError,
  NotFoundError,
  PROVIDER_CATEGORIES_THAT_NEED_AN_ADMIN,
  ProviderError,
  buildProviderFailureErrorUtil,
} from '#src/utils/index.js';
import { IMAGE_SOURCE } from '#src/modules/images/image.constants.js';
import {
  createImageRepository,
  findUserImageByIdRepository,
} from '#src/modules/images/shared/repositories/index.js';
import {
  deleteImageFilesService,
  uploadImageFilesService,
} from '#src/modules/images/shared/services/index.js';
import { readImageDetailsUtil } from '#src/modules/images/shared/utils/index.js';
import { GENERATION_TYPE_CODE } from '#src/modules/generations/generation.constants.js';
import { findUserGenerationByIdRepository } from '#src/modules/generations/shared/repositories/index.js';
import {
  completeGenerationService,
  estimateGenerationCostService,
  failGenerationService,
  presentGenerationsService,
  startGenerationService,
} from '#src/modules/generations/shared/services/index.js';

const EXTENSIONS = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
};

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

  if (PROVIDER_CATEGORIES_THAT_NEED_AN_ADMIN.includes(category)) {
    log.error(logDetails, 'Image generation failed');
  } else {
    log.warn(logDetails, 'Image generation failed');
  }

  throw buildProviderFailureErrorUtil({
    category,
    refundedCredits: generation.totalCredits,
  });
}

async function readSourceImage({ db, storage, userId, data, type }) {
  if (type === GENERATION_TYPE_CODE.TEXT_TO_IMAGE) {
    if (data.sourceImageId || data.mask) {
      throw new BadRequestError(
        'A starting image and a mask are only used for image to image and edits',
      );
    }

    return null;
  }

  if (!data.sourceImageId) {
    throw new BadRequestError('Choose an image to start from');
  }

  const image = await findUserImageByIdRepository({
    db,
    id: data.sourceImageId,
    userId,
  });

  if (!image) {
    throw new NotFoundError('Image not found');
  }

  return {
    id: image.id,
    width: image.width,
    height: image.height,
    contentType: image.contentType,
    extension: EXTENSIONS[image.contentType] ?? 'png',
    buffer: await storage.downloadFile({ key: image.storageKey }),
  };
}

function readMask({ data, type, sourceImage }) {
  if (type !== GENERATION_TYPE_CODE.IMAGE_EDIT) {
    if (data.mask) {
      throw new BadRequestError('A mask is only used for image edits');
    }

    return null;
  }

  if (!data.mask) {
    throw new BadRequestError(
      'Paint over the part of the image you want to change',
    );
  }

  const maskBuffer = Buffer.from(
    data.mask.slice(data.mask.indexOf(',') + 1),
    'base64',
  );
  const details = readImageDetailsUtil({ fileBuffer: maskBuffer });

  if (
    !details ||
    details.contentType !== 'image/png' ||
    details.width !== sourceImage.width ||
    details.height !== sourceImage.height
  ) {
    throw new BadRequestError(
      'The mask must be a PNG the same size as the image',
    );
  }

  return maskBuffer;
}

async function saveGeneratedImages({
  db,
  storage,
  log,
  userId,
  generation,
  imageBuffers,
  source,
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
      const keys = await uploadImageFilesService({
        storage,
        userId,
        source,
        imageId: file.id,
        fileBuffer: file.fileBuffer,
        details: file.details,
      });

      Object.assign(file, keys);
      uploadedKeys.push(keys.storageKey, keys.thumbnailKey);
    }

    await db.transaction(async (tx) => {
      for (const file of files) {
        await createImageRepository({
          db: tx,
          data: {
            id: file.id,
            userId,
            source,
            generationId: generation.id,
            storageKey: file.storageKey,
            thumbnailKey: file.thumbnailKey,
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
    await deleteImageFilesService({ storage, log, keys: uploadedKeys });

    throw error;
  }
}

function requestImages({
  openai,
  model,
  prompt,
  options,
  sourceImage,
  maskImage,
}) {
  const request = {
    model,
    prompt,
    size: options.size,
    quality: options.quality,
    outputFormat: options.outputFormat,
    n: options.n,
  };

  if (!sourceImage) return openai.generateImages(request);

  return openai.editImages({ ...request, sourceImage, maskImage });
}

export async function createGenerationService({ server, log, userId, data }) {
  const { db, storage, openai } = server;
  const type = data.type ?? GENERATION_TYPE_CODE.TEXT_TO_IMAGE;
  const prompt = data.prompt.trim();
  const { options } = data;

  const estimate = await estimateGenerationCostService({
    db,
    modelId: data.modelId,
    generationTypeCode: type,
    options,
  });

  if (estimate.model.provider.code !== 'openai') {
    throw new BadRequestError('This model cannot generate images yet');
  }

  const sourceImage = await readSourceImage({
    db,
    storage,
    userId,
    data,
    type,
  });
  const maskImage = readMask({ data, type, sourceImage });

  const generation = await startGenerationService({
    db,
    userId,
    estimate,
    prompt,
    options: maskImage ? { ...options, hasMask: true } : options,
    sourceImageId: sourceImage?.id ?? null,
  });

  try {
    const { imageBuffers } = await requestImages({
      openai,
      model: estimate.model.providerModelId,
      prompt,
      options,
      sourceImage,
      maskImage,
    });

    await saveGeneratedImages({
      db,
      storage,
      log,
      userId,
      generation,
      imageBuffers,
      source:
        type === GENERATION_TYPE_CODE.IMAGE_EDIT
          ? IMAGE_SOURCE.EDITED
          : IMAGE_SOURCE.GENERATED,
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
