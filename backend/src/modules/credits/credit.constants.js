export const SIGNUP_CREDITS = 60;

export const CREDIT_TRANSACTION_TYPE = {
  SIGNUP_GRANT: 'signup_grant',
  GENERATION_HOLD: 'generation_hold',
  GENERATION_REFUND: 'generation_refund',
};

export const CREDIT_TRANSACTION_TYPES = Object.values(CREDIT_TRANSACTION_TYPE);

export const CREDIT_IDEMPOTENCY_KEY_MAX_LENGTH = 100;

export const INSUFFICIENT_CREDITS_MESSAGE =
  'Insufficient credits for this generation';
