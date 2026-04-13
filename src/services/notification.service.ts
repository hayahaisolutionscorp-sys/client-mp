import axios from '@/services/core/axios';
import { NOTIFICATION_API } from 'constants/api';

export interface UserNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  status: 'pending' | 'sent' | 'failed' | 'read';
  priority: 'low' | 'medium' | 'high' | 'critical';
  channels: string[];
  data: Record<string, any> | null;
  created_at: string;
  read_at: string | null;
}

export interface PaginatedNotificationsResponse {
  data: UserNotification[];
  total: number;
  page_size: number;
  offset: number;
}

export const NotificationService = {
  getUserNotifications: async (params?: {
    limit?: number;
    offset?: number;
    status?: string;
  }): Promise<PaginatedNotificationsResponse> => {
    const queryEntries = Object.entries(params || {}).filter(
      ([_, value]) => value !== undefined && value !== null,
    );
    const queryString = new URLSearchParams(queryEntries as [string, string][]).toString();
    const url = queryString
      ? `${NOTIFICATION_API}/user-notifications?${queryString}`
      : `${NOTIFICATION_API}/user-notifications`;
    const response = await axios.get(url);
    return response.data;
  },

  getUnreadCount: async (): Promise<{ data: { count: number } }> => {
    const response = await axios.get(`${NOTIFICATION_API}/unread-count`);
    return response.data;
  },

  markAsRead: async (id: string): Promise<any> => {
    const response = await axios.post(`${NOTIFICATION_API}/${id}/read`);
    return response.data;
  },

  markAllAsRead: async (): Promise<{ success: boolean }> => {
    const response = await axios.post(`${NOTIFICATION_API}/mark-all-read`);
    return response.data;
  },
};
