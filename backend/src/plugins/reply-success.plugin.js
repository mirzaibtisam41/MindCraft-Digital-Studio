import fp from 'fastify-plugin';
import { replySuccessDecorator } from '#src/decorators/index.js';

async function registerReplySuccess(fastify) {
  fastify.decorateReply('success', replySuccessDecorator);
}

export const replySuccessPlugin = fp(registerReplySuccess);
