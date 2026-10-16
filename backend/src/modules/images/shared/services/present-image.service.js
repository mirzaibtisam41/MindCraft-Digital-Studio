export async function presentImageService({ storage, image }) {
  const { storageKey, thumbnailKey, ...details } = image;
  const url = await storage.createSignedUrl({ key: storageKey });

  return {
    ...details,
    url,
    thumbnailUrl: thumbnailKey
      ? await storage.createSignedUrl({ key: thumbnailKey })
      : url,
  };
}
