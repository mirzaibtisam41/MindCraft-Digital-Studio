import { listAiProvidersService } from './list-ai-providers.service.js';

export async function listAiProvidersController(request, reply) {
  const providers = await listAiProvidersService({ db: request.server.db });

  return reply.success({ data: { providers } });
}
