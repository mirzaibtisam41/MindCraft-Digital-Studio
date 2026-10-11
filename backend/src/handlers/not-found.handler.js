import { NotFoundError } from '#src/utils/index.js';
import { errorHandler } from './error.handler.js';

export function notFoundHandler(request, reply) {
  const error = new NotFoundError(
    `Route ${request.method} ${request.url} not found`,
  );

  return errorHandler(error, request, reply);
}
