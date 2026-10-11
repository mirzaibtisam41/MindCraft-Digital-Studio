import fp from 'fastify-plugin';
import fastifyEnv from '@fastify/env';
import { envSchemaConfig } from '#src/config/index.js';

async function registerEnvValidation(fastify) {
  await fastify.register(fastifyEnv, { schema: envSchemaConfig });

  fastify.log.level = fastify.config.LOG_LEVEL;
}

export const validateEnvPlugin = fp(registerEnvValidation);
