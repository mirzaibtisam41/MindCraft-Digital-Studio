import {
  CreditCard,
  FolderKanban,
  Gauge,
  History,
  House,
  ImagePlus,
  Images,
  LayoutDashboard,
  NotebookPen,
  PenTool,
  ScanEye,
  Settings,
  Sparkles,
  UserRound,
} from 'lucide-react';

export const NAV_GROUPS = [
  {
    label: 'Workspace',
    items: [
      { label: 'Dashboard', href: '/app', icon: LayoutDashboard, ready: true },
      {
        label: 'Image Generator',
        href: '/app/generate',
        icon: Sparkles,
        ready: true,
      },
      {
        label: 'Image Editor',
        href: '/app/editor',
        icon: PenTool,
        ready: false,
      },
      {
        label: 'Image to Image',
        href: '/app/image-to-image',
        icon: ImagePlus,
        ready: false,
      },
      {
        label: 'AI Vision',
        href: '/app/vision',
        icon: ScanEye,
        ready: false,
      },
    ],
  },
  {
    label: 'Library',
    items: [
      {
        label: 'My Creations',
        href: '/app/creations',
        icon: Images,
        ready: false,
      },
      {
        label: 'Projects',
        href: '/app/projects',
        icon: FolderKanban,
        ready: false,
      },
      {
        label: 'Generation History',
        href: '/app/history',
        icon: History,
        ready: false,
      },
      {
        label: 'Prompt Studio',
        href: '/app/prompts',
        icon: NotebookPen,
        ready: false,
      },
    ],
  },
  {
    label: 'Account',
    items: [
      {
        label: 'Usage & Credits',
        href: '/app/usage',
        icon: Gauge,
        ready: false,
      },
      {
        label: 'Billing',
        href: '/app/billing',
        icon: CreditCard,
        ready: false,
      },
      {
        label: 'Settings',
        href: '/app/settings',
        icon: Settings,
        ready: true,
      },
    ],
  },
];

export const MOBILE_TABS = [
  { label: 'Home', href: '/app', icon: House, ready: true },
  { label: 'Create', href: '/app/generate', icon: Sparkles, ready: true },
  { label: 'Library', href: '/app/creations', icon: Images, ready: false },
  { label: 'Account', href: '/app/settings', icon: UserRound, ready: true },
];

export function isNavItemActive(item, pathname) {
  if (item.href === '/app') return pathname === '/app';

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function findBreadcrumb(pathname) {
  for (const group of NAV_GROUPS) {
    const item = group.items.find((candidate) =>
      isNavItemActive(candidate, pathname),
    );

    if (item) return { group: group.label, page: item.label };
  }

  return { group: 'Workspace', page: 'Dashboard' };
}
