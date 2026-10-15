export async function presentImageService({ storage, image }) {
  const { storageKey, ...details } = image;

  return {
    ...details,
    url: await storage.createSignedUrl({ key: storageKey }),
  };
}
