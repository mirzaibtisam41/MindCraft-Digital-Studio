import { checkHealthController } from './features/checkHealth/check-health.controller.js';

export function healthRoutes(fastify) {
  fastify.get('/', checkHealthController);
}
