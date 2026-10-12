import { IMAGE_QUALITY, OPENAI_IMAGE_MODEL } from '#src/constants/index.js';

export const SIGNUP_CREDITS = 60;

export const CREDIT_TRANSACTION_TYPE = {
  SIGNUP_GRANT: 'signup_grant',
  GENERATION_HOLD: 'generation_hold',
  GENERATION_REFUND: 'generation_refund',
};

export const CREDIT_TRANSACTION_TYPES = Object.values(CREDIT_TRANSACTION_TYPE);

export const CREDIT_IDEMPOTENCY_KEY_MAX_LENGTH = 100;

export const CREDITS_PER_IMAGE = {
  [OPENAI_IMAGE_MODEL.GPT_IMAGE_1_MINI]: {
    [IMAGE_QUALITY.LOW]: 1,
    [IMAGE_QUALITY.MEDIUM]: 2,
    [IMAGE_QUALITY.HIGH]: 4,
  },
  [OPENAI_IMAGE_MODEL.GPT_IMAGE_1]: {
    [IMAGE_QUALITY.LOW]: 2,
    [IMAGE_QUALITY.MEDIUM]: 4,
    [IMAGE_QUALITY.HIGH]: 8,
  },
};

export const INSUFFICIENT_CREDITS_MESSAGE =
  'Insufficient credits for this generation';
