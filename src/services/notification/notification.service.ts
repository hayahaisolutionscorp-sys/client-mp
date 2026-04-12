import axios from '@/services/core/axios';
import {
  NOTIFICATION_MARK_ALL_READ_API,
  NOTIFICATION_MARK_READ_API,
  NOTIFICATION_USER_LIST_API,
} from 'constants/api';
import type { IAccountNotification, INotification } from '@/models';

export interface NotificationPreview {
  id: string;
  subject: string;
  body: string;
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

function normalizeNotification(item: IAccountNotification | INotification | any, index: number): NotificationPreview {
  const source = pickNotificationSource(item);
  const rawId = source?.id ?? item?.notificationId ?? item?.id ?? index + 1;

  return {
    id: String(rawId),
    subject: typeof source?.subject === 'string' && source.subject.trim() ? source.subject : 'Notification',
    body: typeof source?.body === 'string' ? source.body : '',
    dateCreatedIso: typeof source?.dateCreatedIso === 'string' ? source.dateCreatedIso : new Date().toISOString(),
    isRead: Boolean(item?.isRead ?? source?.isRead ?? false),
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