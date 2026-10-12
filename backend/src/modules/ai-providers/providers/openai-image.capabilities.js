import {
  AI_IMAGE_PROVIDER,
  CAPABILITY_STATUS,
  DEFAULT_IMAGE_BACKGROUND,
  DEFAULT_IMAGE_MODERATION,
  DEFAULT_IMAGE_OUTPUT_FORMAT,
  DEFAULT_IMAGE_QUALITY,
  DEFAULT_IMAGE_SIZE,
  DEFAULT_IMAGES_PER_REQUEST,
  IMAGE_BACKGROUND,
  IMAGE_MODERATIONS,
  IMAGE_PROVIDER_PROMPT_MAX_LENGTH,
  IMAGE_QUALITIES,
  IMAGE_SIZES,
  MAX_IMAGES_PER_REQUEST,
  MAX_REFERENCE_IMAGES,
  OPENAI_IMAGE_MODEL_PROFILES,
  OPENAI_IMAGE_MODELS,
} from '#src/constants/index.js';

export function listOpenaiImageModels() {
  return OPENAI_IMAGE_MODELS;
}

export function buildOpenaiImageCapabilities({ model }) {
  const profile = OPENAI_IMAGE_MODEL_PROFILES[model];

  return {
    provider: AI_IMAGE_PROVIDER.OPENAI,
    model,
    label: profile.label,
    sizes: IMAGE_SIZES,
    qualities: IMAGE_QUALITIES,
    backgrounds: [IMAGE_BACKGROUND.AUTO, IMAGE_BACKGROUND.OPAQUE],
    moderations: IMAGE_MODERATIONS,
    inputFidelities: profile.inputFidelities,
    outputFormats: [DEFAULT_IMAGE_OUTPUT_FORMAT],
    defaults: {
      size: DEFAULT_IMAGE_SIZE,
      quality: DEFAULT_IMAGE_QUALITY,
      n: DEFAULT_IMAGES_PER_REQUEST,
      background: DEFAULT_IMAGE_BACKGROUND,
      moderation: DEFAULT_IMAGE_MODERATION,
      outputFormat: DEFAULT_IMAGE_OUTPUT_FORMAT,
    },
    maxPromptLength: IMAGE_PROVIDER_PROMPT_MAX_LENGTH,
    maxImagesPerRequest: MAX_IMAGES_PER_REQUEST,
    maxReferenceImages: MAX_REFERENCE_IMAGES,
    features: {
      textToImage: CAPABILITY_STATUS.SUPPORTED,
      imageEditing: CAPABILITY_STATUS.SUPPORTED,
      referenceImages: CAPABILITY_STATUS.SUPPORTED,
      maskInpainting: CAPABILITY_STATUS.UNTESTED,
      transparentBackground: CAPABILITY_STATUS.UNTESTED,
      partialImageStreaming: CAPABILITY_STATUS.UNTESTED,
      seed: CAPABILITY_STATUS.UNSUPPORTED,
      negativePrompt: CAPABILITY_STATUS.UNSUPPORTED,
      strength: CAPABILITY_STATUS.UNSUPPORTED,
      upscaling: CAPABILITY_STATUS.UNSUPPORTED,
      progress: CAPABILITY_STATUS.UNSUPPORTED,
    },
  };
}
