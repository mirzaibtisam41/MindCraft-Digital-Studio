export function presentImageModelService(imageModel) {
  return {
    id: imageModel.id,
    provider: imageModel.provider,
    label: imageModel.label,
    description: imageModel.description,
    badge: imageModel.badge,
    enabled: imageModel.enabled,
    isDefault: imageModel.isDefault,
    sortOrder: imageModel.sortOrder,
    tools: imageModel.tools,
    capabilities: imageModel.capabilities,
    creditsPerImage: imageModel.creditsPerImage,
    providerCostPerImage: imageModel.providerCostPerImage,
    updatedAt: imageModel.updatedAt,
  };
}
