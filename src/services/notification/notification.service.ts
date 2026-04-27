import axios from '@/services/core/axios';
import {
  NOTIFICATION_MARK_ALL_READ_API,
  NOTIFICATION_MARK_READ_API,
  NOTIFICATION_USER_LIST_API,
} from 'constants/api';
import type { IAccountNotification, INotification } from '@/models';

export interface NotificationPreview {
  id: string;
  title: string;
  message: string;
  dateCreatedIso: string;
  isRead: boolean;
  tripId?: number;
}

export interface NotificationListQuery {
  limit?: number;
  offset?: number;
  status?: string;
}

function pickNotificationSource(item: IAccountNotification | INotification | any) {
  return item?.notification ?? item;
}

export function normalizeNotification(item: IAccountNotification | INotification | any, index: number): NotificationPreview {
  const source = pickNotificationSource(item);
  const rawId = source?.id ?? item?.notificationId ?? item?.id ?? index + 1;

  // Prioritize title/message (client-api structure) over subject/body (old structure)
  const title = source?.title ?? source?.subject ?? 'Notification';
  const message = source?.message ?? source?.body ?? '';
  // Normalize the date to a standard ISO string with timezone indicator
  let dateCreatedIso = source?.dateCreatedIso ?? source?.sent_at ?? source?.created_at ?? source?.createdAt ?? new Date().toISOString();
  
  if (typeof dateCreatedIso === 'string' && !dateCreatedIso.endsWith('Z') && !dateCreatedIso.includes('+')) {
    // Convert "YYYY-MM-DD HH:mm:ss.SSSSSS" to ISO "YYYY-MM-DDTHH:mm:ss.SSSz"
    // We truncate microseconds to 3 digits (milliseconds) for better browser compatibility
    dateCreatedIso = dateCreatedIso.replace(' ', 'T');
    const dotIndex = dateCreatedIso.indexOf('.');
    if (dotIndex !== -1 && dateCreatedIso.length - dotIndex > 4) {
      dateCreatedIso = dateCreatedIso.substring(0, dotIndex + 4);
    }
    dateCreatedIso += 'Z';
  }

  return {
    id: String(rawId),
    title: typeof title === 'string' && title.trim() ? title : 'Notification',
    message: typeof message === 'string' ? message : '',
    dateCreatedIso: String(dateCreatedIso),
    isRead: Boolean(item?.isRead ?? source?.isRead ?? (source?.status === 'read')),
    tripId: typeof source?.tripId === 'number' ? source.tripId : undefined,
  };
}

function extractNotificationList(payload: any): Array<IAccountNotification | INotification | any> {
  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.results)) {
    return payload.results;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
}

function buildNotificationQuery(query: NotificationListQuery) {
  const params = new URLSearchParams();

  if (typeof query.limit === 'number') {
    params.set('limit', String(query.limit));
  }

  if (typeof query.offset === 'number') {
    params.set('offset', String(query.offset));
  }

  if (query.status) {
    params.set('status', query.status);
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

export async function getMyNotifications(query: NotificationListQuery = { limit: 20, offset: 0 }): Promise<NotificationPreview[]> {
  try {
    const endpoint = `${NOTIFICATION_USER_LIST_API}${buildNotificationQuery(query)}`;
    const { data } = await axios.get(endpoint);
    const list = extractNotificationList(data?.data ?? data);

    return list
      .map((item, index) => normalizeNotification(item, index))
      .sort((left, right) => new Date(right.dateCreatedIso).getTime() - new Date(left.dateCreatedIso).getTime());
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}

export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  try {
    await axios.post(NOTIFICATION_MARK_READ_API(notificationId));
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
}

export async function markAllNotificationsAsRead(): Promise<boolean> {
  try {
    await axios.post(NOTIFICATION_MARK_ALL_READ_API);
    return true;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }
}