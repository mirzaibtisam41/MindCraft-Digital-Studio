import fp from 'fastify-plugin';
import {
  analyzeImageIntegration,
  buildChatModelIntegration,
} from '#src/integrations/index.js';

function buildVision({ appConfig }) {
  return {
    analyzeImage: ({ model, ...request }) =>
      analyzeImageIntegration({
        chatModel: buildChatModelIntegration({ appConfig, model }),
        ...request,
      }),
  };
}

async function registerVision(fastify, { vision }) {
  fastify.decorate(
    'vision',
    vision ?? buildVision({ appConfig: fastify.config }),
  );
}

export const visionPlugin = fp(registerVision);
