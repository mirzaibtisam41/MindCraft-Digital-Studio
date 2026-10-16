'use client';

import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  Bell,
  CircleMinus,
  CirclePlus,
  Coins,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  useGetMyNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from '@/features/notifications/notificationsApi';
import { formatTimeAgo } from '@/lib/timeAgo';
import { cn } from '@/lib/utils';

const TYPE_ICONS = {
  generation_failed: AlertTriangle,
  analysis_failed: AlertTriangle,
  credits_added: CirclePlus,
  credits_removed: CircleMinus,
  low_credits: Coins,
};

export function NotificationBell() {
  const router = useRouter();
  const { data } = useGetMyNotificationsQuery(undefined, {
    pollingInterval: 60000,
  });
  const [markNotificationRead] = useMarkNotificationReadMutation();
  const [markAllNotificationsRead] = useMarkAllNotificationsReadMutation();
  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  function open(notification) {
    if (!notification.readAt) markNotificationRead(notification.id);
    if (notification.link) router.push(notification.link);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="relative"
          aria-label={
            unreadCount
              ? `Notifications, ${unreadCount} unread`
              : 'Notifications'
          }
        >
          <Bell />
          {unreadCount ? (
            <span className="absolute top-1 right-1 size-2 rounded-full bg-brand ring-2 ring-background" />
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[min(22rem,90vw)] p-0">
        <div className="flex items-center justify-between gap-3 px-3 py-2">
          <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
          <button
            type="button"
            className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
            disabled={!unreadCount}
            onClick={() => markAllNotificationsRead()}
          >
            Mark all read
          </button>
        </div>
        <DropdownMenuSeparator className="m-0" />
        {notifications.length === 0 ? (
          <p className="px-3 py-8 text-center text-sm text-muted-foreground">
            You are all caught up.
          </p>
        ) : (
          <div className="max-h-96 overflow-y-auto py-1">
            {notifications.map((notification) => {
              const Icon = TYPE_ICONS[notification.type] ?? Bell;

              return (
                <DropdownMenuItem
                  key={notification.id}
                  onSelect={() => open(notification)}
                  className="items-start gap-3 rounded-none px-3 py-2.5"
                >
                  <Icon
                    className={cn(
                      'mt-0.5 size-4 shrink-0',
                      notification.type.endsWith('failed') ||
                        notification.type === 'low_credits'
                        ? 'text-warning'
                        : 'text-brand',
                    )}
                  />
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span
                      className={cn(
                        'text-sm',
                        !notification.readAt && 'font-medium',
                      )}
                    >
                      {notification.title}
                    </span>
                    {notification.body ? (
                      <span className="line-clamp-2 text-xs text-muted-foreground">
                        {notification.body}
                      </span>
                    ) : null}
                    <span className="text-[11px] text-ink-3">
                      {formatTimeAgo(notification.createdAt)}
                    </span>
                  </span>
                  {notification.readAt ? null : (
                    <span
                      aria-label="Unread"
                      className="mt-1.5 size-2 shrink-0 rounded-full bg-brand"
                    />
                  )}
                </DropdownMenuItem>
              );
            })}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
