import {
  Boxes,
  Coins,
  FolderKanban,
  History,
  ImageIcon,
  ImagePlus,
  Images,
  LayoutDashboard,
  NotebookPen,
  ScanEye,
  Server,
  Settings,
  SlidersHorizontal,
  Workflow,
  ShieldCheck,
  Users,
  Wand2,
} from 'lucide-react';

const WORKSPACE_GROUP = {
  label: 'Workspace',
  items: [
    {
      label: 'Dashboard',
      href: '/app',
      icon: LayoutDashboard,
      ready: true,
      exact: true,
    },
    {
      label: 'Image Generator',
      href: '/app/generate',
      icon: ImagePlus,
      ready: true,
    },
    { label: 'Image Editor', icon: Wand2 },
    { label: 'Image to Image', icon: ImageIcon },
    { label: 'AI Vision', icon: ScanEye },
  ],
};

const LIBRARY_GROUP = {
  label: 'Library',
  items: [
    {
      label: 'My Creations',
      href: '/app/creations',
      icon: Images,
      ready: true,
    },
    { label: 'Projects', icon: FolderKanban },
    { label: 'Generation History', icon: History },
    { label: 'Prompt Studio', icon: NotebookPen },
  ],
};

const ACCOUNT_GROUP = {
  label: 'Account',
  items: [
    {
      label: 'Usage & Credits',
      href: '/app/credits',
      icon: Coins,
      ready: true,
    },
    {
      label: 'Settings',
      href: '/app/settings/security',
      icon: Settings,
      ready: true,
    },
  ],
};

const ADMIN_GROUP = {
  label: 'Admin',
  items: [
    {
      label: 'Admin console',
      href: '/admin',
      icon: ShieldCheck,
      ready: true,
      exact: true,
    },
    {
      label: 'Users',
      href: '/admin/users',
      icon: Users,
      ready: true,
      description:
        'Search accounts, suspend users, change roles and adjust credits.',
    },
    {
      label: 'AI Providers',
      href: '/admin/providers',
      icon: Server,
      ready: true,
      description: 'Companies whose image models the platform uses.',
    },
    {
      label: 'AI Models',
      href: '/admin/models',
      icon: Boxes,
      ready: true,
      description: 'Models, their workflows, options and credit prices.',
    },
    {
      label: 'Generation Types',
      href: '/admin/generation-types',
      icon: Workflow,
      ready: true,
      description: 'Kinds of generation, such as text to image.',
    },
    {
      label: 'Platform settings',
      href: '/admin/settings',
      icon: SlidersHorizontal,
      ready: true,
      description: 'Platform-wide settings such as signup credits.',
    },
  ],
};

export const ADMIN_TOOLS = ADMIN_GROUP.items.filter((item) => item.description);

export function getNavGroups({ isAdmin }) {
  const groups = [WORKSPACE_GROUP, LIBRARY_GROUP, ACCOUNT_GROUP];

  return isAdmin ? [...groups, ADMIN_GROUP] : groups;
}

export function isNavItemActive(item, pathname) {
  if (!item.href) return false;
  if (item.exact) return pathname === item.href;

  return pathname.startsWith(item.href);
}

export function findActiveNavItem(groups, pathname) {
  for (const group of groups) {
    const item = group.items.find((navItem) =>
      isNavItemActive(navItem, pathname),
    );

    if (item) return { group, item };
  }

  return null;
}
