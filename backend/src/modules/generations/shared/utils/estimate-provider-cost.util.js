export function estimateProviderCostUtil({
  capabilities,
  quality,
  imageCount,
}) {
  const costPerImage = capabilities.providerCostPerImage?.[quality];

  if (costPerImage === undefined) {
    return null;
  }

  return (costPerImage * imageCount).toFixed(6);
}
