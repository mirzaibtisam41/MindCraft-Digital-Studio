import {
  AI_IMAGE_PROVIDER,
  CAPABILITY_STATUS,
  DEFAULT_IMAGE_OUTPUT_FORMAT,
  IMAGE_BACKGROUND,
  IMAGE_PROVIDER_PROMPT_MAX_LENGTH,
  IMAGE_QUALITIES,
  IMAGE_SIZES,
  MAX_IMAGES_PER_REQUEST,
  MAX_REFERENCE_IMAGES,
} from '#src/constants/index.js';

export function buildOpenaiImageCapabilities({ appConfig }) {
  return {
    provider: AI_IMAGE_PROVIDER.OPENAI,
    model: appConfig.OPENAI_IMAGE_MODEL,
    sizes: IMAGE_SIZES,
    qualities: IMAGE_QUALITIES,
    backgrounds: [IMAGE_BACKGROUND.AUTO, IMAGE_BACKGROUND.OPAQUE],
    outputFormats: [DEFAULT_IMAGE_OUTPUT_FORMAT],
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
