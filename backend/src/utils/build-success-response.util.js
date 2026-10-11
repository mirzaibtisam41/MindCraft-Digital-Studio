import { StatusCodes } from 'http-status-codes';

export function buildSuccessResponseUtil({
  data = null,
  message = 'Success',
  statusCode = StatusCodes.OK,
  meta,
} = {}) {
  const body = { success: true, statusCode, message, data };

  if (meta) body.meta = meta;

  return body;
}
