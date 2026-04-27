'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContexts';
import { EFFECTIVE_API_BASE_URL } from 'constants/api';
import { useToast } from '@/hooks/use-toast';
import { normalizeNotification, type NotificationPreview } from '@/services';

interface NotificationContextType {
  socket: Socket | null;
  newNotifications: NotificationPreview[];
  clearNewNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  socket: null,
  newNotifications: [],
  clearNewNotifications: () => {},
});

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { success } = useToast();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [newNotifications, setNewNotifications] = useState<NotificationPreview[]>([]);

  const clearNewNotifications = useCallback(() => {
    setNewNotifications([]);
  }, []);

  useEffect(() => {
    if (!currentUser) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // Initialize socket connection
    // Note: socket.io-client will automatically use cookies for namespaces
    const newSocket = io(`${EFFECTIVE_API_BASE_URL}/notifications`, {
      withCredentials: true,
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('Connected to notifications websocket');
    });

    newSocket.on('notification', (data: any) => {
      console.log('Received real-time notification:', data);
      
      const normalized = normalizeNotification(data, Date.now());
      setNewNotifications((prev) => [normalized, ...prev]);
      
      // Show local toast success notification
      success(normalized.message, {
        title: normalized.title,
        duration: 5000,
      });
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from notifications websocket');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [currentUser]);

  return (
    <NotificationContext.Provider value={{ socket, newNotifications, clearNewNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};
