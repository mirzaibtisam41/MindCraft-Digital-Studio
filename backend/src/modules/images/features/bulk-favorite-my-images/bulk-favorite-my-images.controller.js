import { updateUserImagesFavoriteRepository } from '#src/modules/images/shared/repositories/index.js';

export async function bulkFavoriteMyImagesController(request, reply) {
  const updatedIds = await updateUserImagesFavoriteRepository({
    db: request.server.db,
    ids: request.body.ids,
    userId: request.user.id,
    isFavorite: request.body.isFavorite,
  });

  return reply.success({
    data: { updatedIds },
    message: request.body.isFavorite
      ? `${updatedIds.length} added to favorites`
      : `${updatedIds.length} removed from favorites`,
  });
}
