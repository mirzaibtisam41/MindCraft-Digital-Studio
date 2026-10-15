import { NotFoundError } from '#src/utils/index.js';
import { findUserImageByIdRepository } from '#src/modules/images/shared/repositories/index.js';
import { presentImageService } from '#src/modules/images/shared/services/index.js';

export async function getMyImageService({ db, storage, userId, id }) {
  const image = await findUserImageByIdRepository({ db, id, userId });

  if (!image) {
    throw new NotFoundError('Image not found');
  }

  return presentImageService({ storage, image });
}
