import {
  Bell,
  Palette,
  Shield,
  SlidersHorizontal,
  UserRound,
} from 'lucide-react';

export const SETTINGS_SECTIONS = [
  { label: 'Profile', href: '/app/settings/profile', icon: UserRound },
  {
    label: 'Generation defaults',
    href: '/app/settings/defaults',
    icon: SlidersHorizontal,
  },
  { label: 'Notifications', href: '/app/settings/notifications', icon: Bell },
  { label: 'Security', href: '/app/settings/security', icon: Shield },
  { label: 'Appearance', href: '/app/settings/appearance', icon: Palette },
];

export const ASPECT_RATIOS = ['1:1', '16:9', '9:16', '4:3'];

export const THEME_OPTIONS = [
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
  { value: 'system', label: 'System' },
];

export const NOTIFICATION_OPTIONS = [
  {
    key: 'notifyGenerationComplete',
    label: 'Generation complete',
    description: 'When a batch of images finishes.',
  },
  {
    key: 'notifyGenerationFailed',
    label: 'Failed generations',
    description: 'When a generation fails and its credits are refunded.',
  },
  {
    key: 'notifyLowCredits',
    label: 'Low credit warnings',
    description: 'When your balance drops below 200 credits.',
  },
  {
    key: 'notifyProductUpdates',
    label: 'Product updates',
    description: 'New models, tools and occasional news.',
  },
];
