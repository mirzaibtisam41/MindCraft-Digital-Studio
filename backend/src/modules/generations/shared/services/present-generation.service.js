async function presentImage({ storage, image }) {
  const { url, expiresAt } = await storage.getSignedUrl({
    key: image.storageKey,
  });

  return {
    id: image.id,
    url,
    urlExpiresAt: expiresAt,
    contentType: image.contentType,
    width: image.width,
    height: image.height,
    sizeBytes: image.sizeBytes,
    createdAt: image.createdAt,
  };
}

export async function presentGenerationService({
  storage,
  generation,
  images,
}) {
  return {
    id: generation.id,
    type: generation.type,
    status: generation.status,
    prompt: generation.prompt,
    provider: generation.provider,
    model: generation.model,
    settings: generation.settings,
    imageCount: generation.imageCount,
    errorCategory: generation.errorCategory,
    errorMessage: generation.errorMessage,
    startedAt: generation.startedAt,
    completedAt: generation.completedAt,
    createdAt: generation.createdAt,
    images: await Promise.all(
      images.map((image) => presentImage({ storage, image })),
    ),
  };
}
