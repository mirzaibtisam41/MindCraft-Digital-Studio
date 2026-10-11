import { StatusCodes } from 'http-status-codes';
import { buildSuccessResponseUtil } from '#src/utils/index.js';

export function replySuccessDecorator({
  data = null,
  message = 'Success',
  statusCode = StatusCodes.OK,
  meta,
} = {}) {
  return this.code(statusCode).send(
    buildSuccessResponseUtil({ data, message, statusCode, meta }),
  );
}
