'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Bell, Inbox, Loader2 } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContexts';
import {
  getMyNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type NotificationPreview,
} from '@/services';
import { cn } from '@/lib/utils';

function formatNotificationDate(dateIso: string) {
  if (!dateIso) return '';
  
  // Ensure the date is treated as UTC if it doesn't have a timezone indicator
  const utcDateStr = dateIso.endsWith('Z') || dateIso.includes('+') 
    ? dateIso 
    : `${dateIso.replace(' ', 'T')}Z`;
    
  const value = new Date(utcDateStr);

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

export default function NotificationsPage() {
  const pageSize = 20;
  const { currentUser, loading } = useAuth();
  const [notifications, setNotifications] = useState<NotificationPreview[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const loadNotifications = useCallback(async () => {
    setIsLoadingNotifications(true);
    const results = await getMyNotifications({ limit: pageSize, offset: 0 });
    setNotifications(results);
    setOffset(results.length);
    setHasMore(results.length === pageSize);
    setIsLoadingNotifications(false);
  }, [pageSize]);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!currentUser) {
      window.location.replace('/login');
      return;
    }

    let isActive = true;

    const loadNotifications = async () => {
      setIsLoadingNotifications(true);
      const results = await getMyNotifications({ limit: pageSize, offset: 0 });

      if (!isActive) {
        return;
      }

      setNotifications(results);
      setOffset(results.length);
      setHasMore(results.length === pageSize);
      setIsLoadingNotifications(false);
    };

    void loadNotifications();

    return () => {
      isActive = false;
    };
  }, [currentUser, loading, pageSize]);

  const unreadCount = useMemo(() => notifications.filter((notification) => !notification.isRead).length, [notifications]);

  const handleMarkAsRead = async (notificationId: string) => {
    if (markingAll || markingId) {
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

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) {
      return;
    }

    setIsLoadingMore(true);
    const nextBatch = await getMyNotifications({ limit: pageSize, offset });

    setNotifications((prevNotifications) => {
      const seen = new Set(prevNotifications.map((notification) => notification.id));
      const merged = [...prevNotifications];
      for (const notification of nextBatch) {
        if (!seen.has(notification.id)) {
          merged.push(notification);
        }
      }
      return merged;
    });

    setOffset((prevOffset) => prevOffset + nextBatch.length);
    setHasMore(nextBatch.length === pageSize);
    setIsLoadingMore(false);
  };

  if (loading || !currentUser) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-sky-50 via-white to-slate-50 px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-3xl items-center justify-center py-24 text-slate-500">
          <Loader2 className="mr-3 h-5 w-5 animate-spin" />
          Loading your notifications...
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-sky-50 via-white to-slate-50 px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>

          <Link
            href="/profile?tab=booking-history"
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
          >
            My Bookings
          </Link>
        </div>

        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_60px_-28px_rgba(15,23,42,0.25)]">
          <div className="border-b border-slate-100 bg-gradient-to-r from-sky-50 to-white px-5 py-5 sm:px-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                <Bell className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">Notifications</p>
                <h1 className="mt-1 text-2xl font-semibold text-slate-900 sm:text-3xl">
                  Updates, alerts, and trip changes
                </h1>
                <p className="mt-2 text-sm text-slate-600">
                  {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}` : 'You are all caught up.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void handleMarkAllAsRead()}
                disabled={unreadCount === 0 || markingAll}
                className="rounded-full border border-sky-200 bg-white px-4 py-2 text-xs font-semibold text-sky-700 transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {markingAll ? 'Marking...' : 'Mark all as read'}
              </button>
            </div>
          </div>

          <div className="max-h-[72vh] divide-y divide-slate-100 overflow-y-auto">
            {isLoadingNotifications ? (
              <div className="flex items-center justify-center gap-3 px-6 py-16 text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <Inbox className="h-8 w-8" />
                </div>
                <p className="text-lg font-semibold text-slate-900">No notifications yet</p>
                <p className="mt-2 max-w-sm text-sm text-slate-600">
                  We’ll show booking alerts, trip updates, and account messages here when they arrive.
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <article
                  key={notification.id}
                  onClick={() => void handleMarkAsRead(notification.id)}
                  className={cn(
                    'px-5 py-4 sm:px-6',
                    !notification.isRead && 'cursor-pointer hover:bg-sky-100/60',
                    !notification.isRead && 'bg-sky-50/60'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'mt-1 h-2.5 w-2.5 rounded-full shrink-0',
                        notification.isRead
                          ? 'bg-slate-300'
                          : markingId === notification.id
                            ? 'animate-pulse bg-sky-500/70'
                            : 'bg-sky-600'
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <h2 className={cn('text-base font-semibold text-slate-900', notification.isRead && 'font-medium')}>
                          {notification.title}
                        </h2>
                        <span className="shrink-0 text-xs text-slate-500">
                          {hasMounted ? formatNotificationDate(notification.dateCreatedIso) : ''}
                        </span>
                      </div>
                      {notification.message ? (
                        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
                          {notification.message}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))
            )}

            {!isLoadingNotifications && notifications.length > 0 && hasMore ? (
              <div className="px-6 py-5">
                <button
                  type="button"
                  onClick={() => void handleLoadMore()}
                  disabled={isLoadingMore}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoadingMore ? 'Loading more...' : 'Load more notifications'}
                </button>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}