import { toFile } from 'openai';
import { requestOpenAiImagesIntegration } from '#src/integrations/openai/request-openai-images.integration.js';

export function editOpenAiImagesIntegration({
  client,
  model,
  prompt,
  sourceImage,
  maskImage,
  size,
  quality,
  outputFormat,
  n,
}) {
  return requestOpenAiImagesIntegration({
    send: async () =>
      client.images.edit({
        model,
        prompt,
        image: await toFile(
          sourceImage.buffer,
          `source.${sourceImage.extension}`,
          {
            type: sourceImage.contentType,
          },
        ),
        ...(maskImage
          ? {
              mask: await toFile(maskImage, 'mask.png', { type: 'image/png' }),
            }
          : {}),
        size,
        quality,
        background: 'opaque',
        output_format: outputFormat,
        n,
      }),
  });
}
