import { PROVIDER_ERROR_CATEGORY } from '#src/constants/index.js';
import { ProviderError } from '#src/utils/index.js';
import { mapOpenAiErrorIntegration } from '#src/integrations/openai/map-openai-error.integration.js';

export async function generateOpenAiImagesIntegration({
  client,
  model,
  prompt,
  size,
  quality,
  outputFormat,
  n,
}) {
  let response;

  try {
    response = await client.images.generate({
      model,
      prompt,
      size,
      quality,
      output_format: outputFormat,
      n,
    });
  } catch (error) {
    throw new ProviderError({
      category: mapOpenAiErrorIntegration({ error }),
      cause: error,
    });
  }

  const encodedImages = (response.data ?? []).map((item) => item.b64_json);

  if (encodedImages.length === 0 || encodedImages.some((image) => !image)) {
    throw new ProviderError({ category: PROVIDER_ERROR_CATEGORY.UNKNOWN });
  }

  return {
    imageBuffers: encodedImages.map((image) => Buffer.from(image, 'base64')),
    usage: response.usage ?? null,
  };
}
