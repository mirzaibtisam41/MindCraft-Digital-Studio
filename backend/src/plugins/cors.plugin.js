import fp from 'fastify-plugin';
import fastifyCors from '@fastify/cors';
import { buildCorsConfig } from '#src/config/index.js';

async function registerCors(fastify) {
  await fastify.register(
    fastifyCors,
    buildCorsConfig({ appConfig: fastify.config }),
  );
}

export const corsPlugin = fp(registerCors);
