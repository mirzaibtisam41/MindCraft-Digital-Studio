import { StatusCodes } from 'http-status-codes';
import { ERROR_CODE } from '#src/constants/index.js';

export function buildErrorResponseUtil({
  code = ERROR_CODE.INTERNAL_SERVER_ERROR,
  message = 'Something went wrong',
  statusCode = StatusCodes.INTERNAL_SERVER_ERROR,
  details,
} = {}) {
  const body = { success: false, statusCode, code, message };

  if (details) body.details = details;

  return body;
}
