import { applyStylePresetUtil } from '#src/modules/generations/shared/utils/index.js';

export function buildProviderRequestService({ model, prompt, options }) {
  return {
    model,
    prompt: applyStylePresetUtil({ prompt, style: options.style }),
    size: options.size,
    quality: options.quality,
    n: options.n,
    background: options.background,
    moderation: options.moderation,
    outputFormat: options.outputFormat,
  };
}
