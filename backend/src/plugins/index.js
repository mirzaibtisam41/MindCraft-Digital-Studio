import { configPlugin } from '#src/plugins/config.plugin.js';
import { cookiePlugin } from '#src/plugins/cookie.plugin.js';
import { corsPlugin } from '#src/plugins/cors.plugin.js';
import { databasePlugin } from '#src/plugins/database.plugin.js';
import { errorHandlersPlugin } from '#src/plugins/error-handlers.plugin.js';
import { helmetPlugin } from '#src/plugins/helmet.plugin.js';
import { jwtPlugin } from '#src/plugins/jwt.plugin.js';
import { rateLimitPlugin } from '#src/plugins/rate-limit.plugin.js';
import { replySuccessPlugin } from '#src/plugins/reply-success.plugin.js';

export function registerPlugins({ fastify, appConfig }) {
  fastify.register(configPlugin, { appConfig });
  fastify.register(databasePlugin);
  fastify.register(helmetPlugin);
  fastify.register(corsPlugin);
  fastify.register(rateLimitPlugin);
  fastify.register(cookiePlugin);
  fastify.register(jwtPlugin);
  fastify.register(errorHandlersPlugin);
  fastify.register(replySuccessPlugin);
}
