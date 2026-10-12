import { NotFoundError } from '#src/utils/index.js';
import * as imageRepositories from '#src/modules/images/shared/repositories/index.js';

export async function getImageUrlService({ db, storage, userId, imageId }) {
  const image = await imageRepositories.findImageByIdAndUserIdRepository({
    db,
    id: imageId,
    userId,
  });

  if (!image) {
    throw new NotFoundError('Image not found');
  }

  return storage.getSignedUrl({ key: image.storageKey });
}
