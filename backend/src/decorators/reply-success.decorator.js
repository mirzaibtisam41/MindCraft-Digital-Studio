import { buildSuccessResponseUtil } from '#src/utils/index.js';

export function replySuccessDecorator(options) {
  const body = buildSuccessResponseUtil(options);

  return this.code(body.statusCode).send(body);
}
