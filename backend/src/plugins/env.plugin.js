import fp from 'fastify-plugin';
import fastifyEnv from '@fastify/env';
import { envSchemaConfig } from '#src/config/index.js';

async function registerEnv(fastify) {
  await fastify.register(fastifyEnv, { schema: envSchemaConfig });
}

export const envPlugin = fp(registerEnv);
