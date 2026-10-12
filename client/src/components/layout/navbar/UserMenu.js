'use client';

import Link from 'next/link';
import { LogOut, Settings, ShieldCheck } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { SUPER_ADMIN_ROLE } from '@/constants/admin';
import { useGetProfileQuery } from '@/features/auth/authApi';
import { useSignOut } from '@/hooks/useSignOut';
import { getInitials } from '@/lib/getInitials';

export function UserMenu() {
  const { data: user, isLoading } = useGetProfileQuery();
  const signOut = useSignOut();

  if (isLoading || !user) return <Skeleton className="size-8 rounded-full" />;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex items-center gap-2.5 rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        aria-label="Account menu"
      >
        <span className="hidden max-w-40 truncate text-[13px] font-medium sm:block">
          {user.name}
        </span>
        <Avatar className="size-8">
          <AvatarFallback className="bg-brand-tint text-xs font-semibold text-brand">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5 font-normal">
          <span className="truncate font-medium">{user.name}</span>
          <span className="truncate text-xs text-muted-foreground">
            {user.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/app/settings">
            <Settings />
            Settings
          </Link>
        </DropdownMenuItem>
        {user.role === SUPER_ADMIN_ROLE ? (
          <DropdownMenuItem asChild>
            <Link href="/admin">
              <ShieldCheck />
              Admin console
            </Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem variant="destructive" onSelect={signOut}>
          <LogOut />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
