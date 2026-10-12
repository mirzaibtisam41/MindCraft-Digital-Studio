import fp from 'fastify-plugin';
import OpenAI from 'openai';
import { buildOpenaiConfig } from '#src/config/index.js';

async function registerOpenai(fastify) {
  const client = new OpenAI(buildOpenaiConfig({ appConfig: fastify.config }));

  fastify.decorate('openai', client);
}

export const openaiPlugin = fp(registerOpenai);
