'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Bell, Inbox, Loader2 } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { useAuth } from '@/contexts/AuthContexts';
import { cn } from '@/lib/utils';
import {
  getMyNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type NotificationPreview,
} from '@/services';

interface NotificationDropdownProps {
  shouldBeTransparent?: boolean;
  mobile?: boolean;
}

function formatNotificationDate(dateIso: string) {
  const value = new Date(dateIso);

  if (Number.isNaN(value.getTime())) {
    return '';
  }

  return value.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function NotificationDropdown({ shouldBeTransparent = false, mobile = false }: NotificationDropdownProps) {
  const { currentUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationPreview[]>([]);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    const results = await getMyNotifications({ limit: 20, offset: 0 });
    setNotifications(results);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    let isActive = true;

    const loadNotificationsSafely = async () => {
      setLoading(true);
      const results = await getMyNotifications({ limit: 20, offset: 0 });

      if (!isActive) {
        return;
      }

      setNotifications(results);
      setLoading(false);
    };

    void loadNotificationsSafely();

    return () => {
      isActive = false;
    };
  }, [currentUser]);

  const unreadCount = useMemo(() => notifications.filter((notification) => !notification.isRead).length, [notifications]);

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0 || markingAll) {
      return;
    }

    setMarkingAll(true);
    const success = await markAllNotificationsAsRead();
    if (success) {
      await loadNotifications();
    }
    setMarkingAll(false);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    if (markingId || markingAll) {
      return;
    }

    const target = notifications.find((notification) => notification.id === notificationId);
    if (!target || target.isRead) {
      return;
    }

    setMarkingId(notificationId);
    const success = await markNotificationAsRead(notificationId);
    if (success) {
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
    }
    setMarkingId(null);
  };

  if (!currentUser) {
    return null;
  }

  if (mobile) {
    return (
      <Link
        href="/notifications"
        aria-label="Open notifications"
        className={cn(
          'relative inline-flex h-8 w-8 items-center justify-center rounded-full transition-opacity hover:opacity-80 focus:outline-none',
          shouldBeTransparent ? 'text-white' : 'text-current'
        )}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center px-1 text-[10px] leading-none"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Link>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          data-template-ignore="true"
          aria-label="Open notifications"
          className={cn(
            'relative inline-flex h-8 w-8 items-center justify-center rounded-full transition-opacity hover:opacity-80 focus:outline-none',
            shouldBeTransparent ? 'text-white' : 'text-current'
          )}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center px-1 text-[10px] leading-none"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={10} className="w-[min(24rem,calc(100vw-1rem))] border-none p-0 shadow-lg">
        <div className="px-4 py-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-foreground">Notifications</p>
              <p className="text-xs text-muted-foreground">
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}` : 'All caught up'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => void handleMarkAllAsRead()}
              disabled={unreadCount === 0 || markingAll}
              className="text-xs font-medium text-primary transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {markingAll ? 'Marking...' : 'Mark all as read'}
            </button>
          </div>
        </div>

        <div className="max-h-[24rem] overflow-y-auto py-1">
          {loading ? (
            <div className="flex items-center gap-3 px-4 py-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 px-4 py-8 text-center">
              <Inbox className="h-7 w-7 text-muted-foreground/70" />
              <p className="text-sm font-medium text-foreground">No notifications yet</p>
              <p className="text-xs text-muted-foreground">We’ll show updates here when there are new alerts.</p>
            </div>
          ) : (
            notifications.slice(0, 8).map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="cursor-default rounded-none px-0 py-0 focus:bg-transparent"
                onSelect={(event) => event.preventDefault()}
              >
                <div
                  onClick={() => void handleMarkAsRead(notification.id)}
                  className={cn(
                    'w-full px-4 py-3 text-left',
                    !notification.isRead && 'cursor-pointer hover:bg-primary/5',
                    !notification.isRead && 'bg-primary/5'
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          'text-sm font-medium leading-5 text-foreground',
                          !notification.isRead && 'font-semibold'
                        )}
                      >
                        {notification.subject}
                      </p>
                      {notification.body ? (
                        <p className="mt-1 line-clamp-2 text-sm leading-5 text-muted-foreground">{notification.body}</p>
                      ) : null}
                    </div>
                    {!notification.isRead && (
                      <span
                        className={cn(
                          'mt-1 h-2.5 w-2.5 rounded-full shrink-0',
                          markingId === notification.id ? 'animate-pulse bg-primary/60' : 'bg-primary'
                        )}
                      />
                    )}
                  </div>
                  {notification.dateCreatedIso ? (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {formatNotificationDate(notification.dateCreatedIso)}
                    </p>
                  ) : null}
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>

        <div className="px-4 py-3">
          <Link href="/notifications" className="text-sm font-medium text-primary hover:underline">
            View all notifications
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}