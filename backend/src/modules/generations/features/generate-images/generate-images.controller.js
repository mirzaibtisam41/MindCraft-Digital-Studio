import {
  generateImagesService,
  presentGenerationService,
} from '#src/modules/generations/shared/services/index.js';

export async function generateImagesController(request, reply) {
  const { generation, images } = await generateImagesService({
    fastify: request.server,
    userId: request.user.id,
    input: request.body,
  });

  const data = await presentGenerationService({
    storage: request.server.storage,
    generation,
    images,
  });

  return reply.code(201).success({ data, message: 'Images generated' });
}
