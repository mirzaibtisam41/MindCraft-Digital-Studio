import {
  Cpu,
  Gauge,
  History,
  LayoutDashboard,
  ScrollText,
  Settings,
  Users,
} from 'lucide-react';

export const SUPER_ADMIN_ROLE = 'super_admin';

export const ADMIN_NAV_ITEMS = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard, ready: true },
  { label: 'Models & pricing', href: '/admin/models', icon: Cpu, ready: true },
  { label: 'Users', href: '/admin/users', icon: Users, ready: true },
  {
    label: 'Generations',
    href: '/admin/generations',
    icon: History,
    ready: true,
  },
  {
    label: 'Audit log',
    href: '/admin/audit-logs',
    icon: ScrollText,
    ready: true,
  },
  { label: 'Settings', href: '/admin/settings', icon: Settings, ready: true },
];

export const ADMIN_BRAND_ICON = Gauge;

export function isAdminNavItemActive(item, pathname) {
  if (item.href === '/admin') return pathname === '/admin';

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function findAdminPageLabel(pathname) {
  const match = ADMIN_NAV_ITEMS.find((item) =>
    isAdminNavItemActive(item, pathname),
  );

  return match?.label ?? 'Overview';
}

export const USER_ROLE_OPTIONS = [
  { value: 'user', label: 'User' },
  { value: 'super_admin', label: 'Super admin' },
];

export const USER_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
];

export const GENERATION_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const IMAGE_PROVIDER_OPTIONS = [{ value: 'openai', label: 'OpenAI' }];

export const IMAGE_MODEL_BADGE_LABELS = {
  new: 'New',
  fast: 'Fast',
  best_quality: 'Best quality',
  popular: 'Popular',
  beta: 'Beta',
};

export const IMAGE_MODEL_TOOL_LABELS = {
  text_to_image: 'Text to image',
  image_to_image: 'Image to image',
  image_editing: 'AI editor',
};

export const NO_BADGE_VALUE = 'none';

export const AUDIT_ACTION_OPTIONS = [
  { value: 'image_model.created', label: 'Image model added' },
  { value: 'image_model.updated', label: 'Image model updated' },
  { value: 'user.suspended', label: 'User suspended' },
  { value: 'user.unsuspended', label: 'User unsuspended' },
  { value: 'user.role_changed', label: 'Role changed' },
  { value: 'credits.adjusted', label: 'Credits adjusted' },
  { value: 'settings.updated', label: 'Settings updated' },
];

export const CREDIT_TYPE_LABELS = {
  signup_grant: 'Signup grant',
  generation_hold: 'Generation',
  generation_refund: 'Refund',
  admin_adjustment: 'Admin adjustment',
};

export const GENERATION_STATUS_TONES = {
  completed: 'success',
  failed: 'danger',
  processing: 'warning',
  pending: 'warning',
  cancelled: 'neutral',
};

export const PAGE_SIZE = 15;

export const OVERVIEW_RANGE_OPTIONS = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
];

export const OVERVIEW_RANGE_DEFAULT = '30d';
