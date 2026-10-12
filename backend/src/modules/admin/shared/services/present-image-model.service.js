export function presentImageModelService(imageModel) {
  return {
    id: imageModel.id,
    provider: imageModel.provider,
    label: imageModel.label,
    enabled: imageModel.enabled,
    sortOrder: imageModel.sortOrder,
    capabilities: imageModel.capabilities,
    creditsPerImage: imageModel.creditsPerImage,
    updatedAt: imageModel.updatedAt,
  };
}
