export const USER_ROLES = [
  { value: 'user', label: 'User', tone: 'neutral' },
  { value: 'admin', label: 'Admin', tone: 'brand' },
];

export const USER_STATUSES = [
  { value: 'active', label: 'Active', tone: 'success' },
  { value: 'suspended', label: 'Suspended', tone: 'danger' },
];

export function findUserRole(value) {
  return USER_ROLES.find((role) => role.value === value);
}

export function findUserStatus(value) {
  return USER_STATUSES.find((status) => status.value === value);
}
