import {
  EMAIL_MAX_LENGTH,
  NAME_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from '@/constants/formLimits';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PASSWORD_RULES = [
  {
    id: 'length',
    label: `${PASSWORD_MIN_LENGTH}–${PASSWORD_MAX_LENGTH} characters`,
    test: (value) =>
      value.length >= PASSWORD_MIN_LENGTH &&
      value.length <= PASSWORD_MAX_LENGTH,
  },
  {
    id: 'letter',
    label: 'At least one letter',
    test: (value) => /\p{L}/u.test(value),
  },
  {
    id: 'number',
    label: 'At least one number',
    test: (value) => /\d/.test(value),
  },
];

export function validateEmail(value) {
  const email = value.trim();

  if (!email) return 'Enter your email address.';
  if (email.length > EMAIL_MAX_LENGTH) return 'This email address is too long.';
  if (!EMAIL_PATTERN.test(email)) return 'Enter a valid email address.';

  return '';
}

export function validateName(value) {
  const name = value.trim();

  if (!name) return 'Enter your name.';
  if (name.length > NAME_MAX_LENGTH) {
    return `Name can be at most ${NAME_MAX_LENGTH} characters.`;
  }

  return '';
}

export function validateNewPassword(value) {
  if (!value) return 'Enter a password.';

  const failedRule = PASSWORD_RULES.find((rule) => !rule.test(value));

  return failedRule ? `Password needs: ${failedRule.label.toLowerCase()}.` : '';
}

export function validateRequiredPassword(value) {
  return value ? '' : 'Enter your password.';
}

export function validatePasswordConfirmation(password, confirmation) {
  if (!confirmation) return 'Re-enter your password.';
  if (password !== confirmation) return 'Passwords do not match.';

  return '';
}

export function hasErrors(errors) {
  return Object.values(errors).some(Boolean);
}
