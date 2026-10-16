import fp from 'fastify-plugin';
import {
  buildOpenAiClientIntegration,
  editOpenAiImagesIntegration,
  generateOpenAiImagesIntegration,
} from '#src/integrations/index.js';

function buildOpenAi({ appConfig }) {
  const client = buildOpenAiClientIntegration({ appConfig });

  return {
    generateImages: (request) =>
      generateOpenAiImagesIntegration({ client, ...request }),
    editImages: (request) =>
      editOpenAiImagesIntegration({ client, ...request }),
  };
}

async function registerOpenAi(fastify, { openai }) {
  fastify.decorate(
    'openai',
    openai ?? buildOpenAi({ appConfig: fastify.config }),
  );
}

export const openAiPlugin = fp(registerOpenAi);
