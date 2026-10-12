import OpenAI from 'openai';
import {
  IMAGE_ERROR_MESSAGE,
  OPENAI_CONTENT_BLOCKED_CODES,
  OPENAI_ERROR_CODE,
} from '#src/constants/index.js';
import {
  BadRequestError,
  ContentBlockedError,
  ServiceUnavailableError,
  TooManyRequestsError,
} from '#src/utils/index.js';

function isRateLimited(error) {
  return (
    error.status === 429 && error.code !== OPENAI_ERROR_CODE.INSUFFICIENT_QUOTA
  );
}

function isContentBlocked(error) {
  return (
    error.status === 400 && OPENAI_CONTENT_BLOCKED_CODES.includes(error.code)
  );
}

export function mapOpenaiErrorUtil({ error }) {
  if (!(error instanceof OpenAI.APIError)) {
    return error;
  }

  if (isContentBlocked(error)) {
    return new ContentBlockedError(IMAGE_ERROR_MESSAGE.CONTENT_BLOCKED);
  }

  if (isRateLimited(error)) {
    return new TooManyRequestsError(IMAGE_ERROR_MESSAGE.BUSY);
  }

  if (error.status === 400) {
    return new BadRequestError(IMAGE_ERROR_MESSAGE.INVALID_REQUEST);
  }

  return new ServiceUnavailableError(IMAGE_ERROR_MESSAGE.UNAVAILABLE);
}
