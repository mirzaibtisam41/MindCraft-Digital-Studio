import { NotFoundError } from '#src/utils/index.js';
import {
  findUserImageByIdRepository,
  updateUserImagesFavoriteRepository,
} from '#src/modules/images/shared/repositories/index.js';
import { presentImageService } from '#src/modules/images/shared/services/index.js';

export async function updateMyImageService({
  db,
  storage,
  userId,
  id,
  isFavorite,
}) {
  const [updatedId] = await updateUserImagesFavoriteRepository({
    db,
    ids: [id],
    userId,
    isFavorite,
  });

  if (!updatedId) {
    throw new NotFoundError('Image not found');
  }

  const image = await findUserImageByIdRepository({ db, id, userId });

  return presentImageService({ storage, image });
}
