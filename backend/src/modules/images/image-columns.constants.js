import { images } from '#src/modules/images/image.table.js';
import { generations } from '#src/modules/generations/generation.table.js';
import { aiModels } from '#src/modules/ai-models/ai-model.table.js';

export const IMAGE_COLUMNS = {
  id: images.id,
  source: images.source,
  generationId: images.generationId,
  storageKey: images.storageKey,
  thumbnailKey: images.thumbnailKey,
  contentType: images.contentType,
  width: images.width,
  height: images.height,
  sizeBytes: images.sizeBytes,
  originalFileName: images.originalFileName,
  isFavorite: images.isFavorite,
  createdAt: images.createdAt,
};

export const IMAGE_WITH_GENERATION_COLUMNS = {
  ...IMAGE_COLUMNS,
  prompt: generations.prompt,
  model: { id: aiModels.id, name: aiModels.name },
};
