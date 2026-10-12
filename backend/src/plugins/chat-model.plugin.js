import fp from 'fastify-plugin';
import { ChatOpenAI } from '@langchain/openai';
import { buildOpenaiChatModelConfig } from '#src/config/index.js';

async function registerChatModel(fastify) {
  const chatModel = new ChatOpenAI(
    buildOpenaiChatModelConfig({ appConfig: fastify.config }),
  );

  fastify.decorate('chatModel', chatModel);
}

export const chatModelPlugin = fp(registerChatModel);
