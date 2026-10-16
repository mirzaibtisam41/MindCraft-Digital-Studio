import fp from 'fastify-plugin';
import {
  buildChatModelIntegration,
  enhancePromptIntegration,
} from '#src/integrations/index.js';

function buildPromptEnhancer({ appConfig }) {
  return {
    enhancePrompt: ({ model, temperature, ...request }) =>
      enhancePromptIntegration({
        chatModel: buildChatModelIntegration({ appConfig, model, temperature }),
        ...request,
      }),
  };
}

async function registerPromptEnhancer(fastify, { promptEnhancer }) {
  fastify.decorate(
    'promptEnhancer',
    promptEnhancer ?? buildPromptEnhancer({ appConfig: fastify.config }),
  );
}

export const promptEnhancerPlugin = fp(registerPromptEnhancer);
