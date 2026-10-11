import { checkHealthController } from './features/check/check.controller.js';

export function healthRoutes(fastify) {
  fastify.get('/', checkHealthController);
}
