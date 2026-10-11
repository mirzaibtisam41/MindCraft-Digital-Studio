import fp from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';
import { buildJwtConfig } from '#src/config/index.js';

async function registerJwt(fastify) {
  await fastify.register(
    fastifyJwt,
    buildJwtConfig({ appConfig: fastify.config }),
  );
}

export const jwtPlugin = fp(registerJwt);
