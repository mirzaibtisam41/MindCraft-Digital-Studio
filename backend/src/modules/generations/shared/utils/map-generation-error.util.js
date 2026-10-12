import { ERROR_CODE } from '#src/constants/index.js';
import {
  GENERATION_ERROR_MESSAGE_MAX_LENGTH,
  GENERATION_FALLBACK_ERROR_MESSAGE,
} from '#src/modules/generations/generation.constants.js';

const KNOWN_ERROR_CODES = Object.values(ERROR_CODE).filter(
  (code) => code !== ERROR_CODE.INTERNAL_SERVER_ERROR,
);

export function mapGenerationErrorUtil(error) {
  if (!KNOWN_ERROR_CODES.includes(error?.code)) {
    return {
      category: ERROR_CODE.INTERNAL_SERVER_ERROR,
      message: GENERATION_FALLBACK_ERROR_MESSAGE,
    };
  }

  return {
    category: error.code,
    message: error.message.slice(0, GENERATION_ERROR_MESSAGE_MAX_LENGTH),
  };
}
