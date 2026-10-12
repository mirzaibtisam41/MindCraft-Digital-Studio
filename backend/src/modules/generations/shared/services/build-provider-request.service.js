export function buildProviderRequestService({ prompt, options }) {
  return {
    prompt,
    size: options.size,
    quality: options.quality,
    n: options.n,
    background: options.background,
  };
}
