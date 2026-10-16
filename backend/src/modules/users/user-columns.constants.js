import { users } from '#src/modules/users/user.table.js';
import { creditWallets } from '#src/modules/credit-wallets/credit-wallet.table.js';

export const USER_COLUMNS = {
  id: users.id,
  name: users.name,
  email: users.email,
  role: users.role,
  status: users.status,
  emailVerifiedAt: users.emailVerifiedAt,
  onboardingCompletedAt: users.onboardingCompletedAt,
  createdAt: users.createdAt,
};

export const USER_WITH_BALANCE_COLUMNS = {
  ...USER_COLUMNS,
  lastLoginAt: users.lastLoginAt,
  balance: creditWallets.balance,
};
