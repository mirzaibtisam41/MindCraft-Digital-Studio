import { PROVIDER_ERROR_CATEGORY } from '#src/constants/index.js';
import {
  BadRequestError,
  NotFoundError,
  PROVIDER_CATEGORIES_THAT_NEED_AN_ADMIN,
  ProviderError,
  buildProviderFailureErrorUtil,
} from '#src/utils/index.js';
import { GENERATION_STATUS } from '#src/modules/generations/generation.constants.js';
import { findUserImageByIdRepository } from '#src/modules/images/shared/repositories/index.js';
import { extractPaletteUtil } from '#src/modules/images/shared/utils/index.js';
import { IMAGE_ANALYSIS_TASK } from '#src/modules/image-analyses/image-analysis.constants.js';
import {
  finishProcessingImageAnalysisRepository,
  listImageAnalysesRepository,
} from '#src/modules/image-analyses/shared/repositories/index.js';
import {
  failImageAnalysisService,
  presentImageAnalysisService,
  startImageAnalysisService,
} from '#src/modules/image-analyses/shared/services/index.js';
import { getVisionSettingsService } from '#src/modules/platform-settings/shared/services/index.js';

const TASKS_WITH_PALETTE = [
  IMAGE_ANALYSIS_TASK.DESCRIBE,
  IMAGE_ANALYSIS_TASK.DESIGN,
];

const HISTORY_SUMMARIES = {
  describe: (result) => ['Describe this image.', result.details],
  question: (result, analysis) => [analysis.question, result.answer],
  ocr: (result) => [
    'Extract the text in this image.',
    result.hasText ? result.text : 'There is no readable text.',
  ],
  objects: (result) => [
    'What objects are in this image?',
    result.objects
      .map((object) => `${object.name} (${object.location})`)
      .join(', '),
  ],
  design: (result) => [
    'Analyze the design of this image.',
    `${result.layout} ${result.style} ${result.mood}`,
  ],
  caption: (result) => [
    'Write captions for this image.',
    result.captions.join(' | '),
  ],
};

async function readConversationHistory({ db, userId, imageId }) {
  const earlier = await listImageAnalysesRepository({
    db,
    userId,
    imageId,
    status: GENERATION_STATUS.SUCCEEDED,
    limit: 3,
  });

  return earlier.map((analysis) => {
    const [question, answer] = HISTORY_SUMMARIES[analysis.task](
      analysis.result,
      analysis,
    );

    return { question, answer };
  });
}

export async function createImageAnalysisService({
  server,
  log,
  userId,
  data,
}) {
  const { db, storage, vision } = server;
  const question = data.question?.trim() || null;

  if ((data.task === IMAGE_ANALYSIS_TASK.QUESTION) !== Boolean(question)) {
    throw new BadRequestError(
      question
        ? 'A question is only used with "Ask a question"'
        : 'Write the question you want to ask about this image',
    );
  }

  const image = await findUserImageByIdRepository({
    db,
    id: data.imageId,
    userId,
  });

  if (!image) {
    throw new NotFoundError('Image not found');
  }

  const settings = await getVisionSettingsService({ db });
  const history =
    data.task === IMAGE_ANALYSIS_TASK.QUESTION
      ? await readConversationHistory({ db, userId, imageId: image.id })
      : [];

  const analysis = await startImageAnalysisService({
    db,
    userId,
    imageId: image.id,
    task: data.task,
    question,
    model: settings.model,
    credits: settings.credits,
  });

  try {
    const fileBuffer = await storage.downloadFile({ key: image.storageKey });
    const result = await vision.analyzeImage({
      model: settings.model,
      task: data.task,
      question,
      history,
      image: { buffer: fileBuffer, contentType: image.contentType },
    });

    const completed = await finishProcessingImageAnalysisRepository({
      db,
      id: analysis.id,
      data: {
        status: GENERATION_STATUS.SUCCEEDED,
        result: TASKS_WITH_PALETTE.includes(data.task)
          ? { ...result, palette: await extractPaletteUtil({ fileBuffer }) }
          : result,
      },
    });

    if (!completed) {
      throw new Error('The analysis was already finished and refunded');
    }

    return presentImageAnalysisService({ analysis: completed });
  } catch (error) {
    const category =
      error instanceof ProviderError
        ? error.category
        : PROVIDER_ERROR_CATEGORY.UNKNOWN;

    await failImageAnalysisService({
      db,
      analysisId: analysis.id,
      errorCategory: category,
    });

    const logDetails = { err: error, analysisId: analysis.id, category };

    if (PROVIDER_CATEGORIES_THAT_NEED_AN_ADMIN.includes(category)) {
      log.error(logDetails, 'Image analysis failed');
    } else {
      log.warn(logDetails, 'Image analysis failed');
    }

    throw buildProviderFailureErrorUtil({
      category,
      refundedCredits: analysis.credits,
    });
  }
}
