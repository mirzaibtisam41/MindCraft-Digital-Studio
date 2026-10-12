import { Badge } from '@/components/ui/badge';
import { SUPER_ADMIN_ROLE } from '@/constants/admin';

export function RoleBadge({ role }) {
  return role === SUPER_ADMIN_ROLE ? (
    <Badge tone="brand">Super admin</Badge>
  ) : (
    <Badge>User</Badge>
  );
}

export function StatusBadge({ suspendedAt }) {
  return suspendedAt ? (
    <Badge tone="danger">Suspended</Badge>
  ) : (
    <Badge tone="success">Active</Badge>
  );
}
