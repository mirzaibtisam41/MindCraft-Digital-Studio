import { requestOpenAiImagesIntegration } from '#src/integrations/openai/request-openai-images.integration.js';

export function generateOpenAiImagesIntegration({
  client,
  model,
  prompt,
  size,
  quality,
  outputFormat,
  n,
}) {
  return requestOpenAiImagesIntegration({
    send: () =>
      client.images.generate({
        model,
        prompt,
        size,
        quality,
        output_format: outputFormat,
        n,
      }),
  });
}
