import { checkHealthController } from './health.controller.js';

export function healthRoutes(fastify) {
  fastify.get('/', checkHealthController);
}
