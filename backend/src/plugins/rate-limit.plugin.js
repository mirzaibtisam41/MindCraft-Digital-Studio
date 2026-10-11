import fp from 'fastify-plugin';
import fastifyRateLimit from '@fastify/rate-limit';
import { buildRateLimitConfig } from '#src/config/index.js';

async function registerRateLimit(fastify) {
  await fastify.register(
    fastifyRateLimit,
    buildRateLimitConfig({ appConfig: fastify.config }),
  );
}

export const rateLimitPlugin = fp(registerRateLimit);
