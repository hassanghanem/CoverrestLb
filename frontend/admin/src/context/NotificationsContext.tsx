import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchNotifications } from '@/lib/services/Settings-services';
import { Notification } from '@/types/api.interfaces';

interface NotificationsContextType {
  notifications: Notification[];
  unreadOrderCount: number;
  unreadPreorderCount: number;
  pendingReturnCount: number;
  unreadContactCount: number;
   unreadReviewCount: number; 
  totalUnreadCount: number;
  isLoading: boolean;
  error?: unknown;
  refetch: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(!document.hidden);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    enabled: isVisible,
    refetchInterval: 60000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 5000,
  });

  return (
    <NotificationsContext.Provider
      value={{
        notifications: data?.notifications || [],
        unreadOrderCount: data?.unread_order_count || 0,
        unreadPreorderCount: data?.unread_preorder_count || 0,
        pendingReturnCount: data?.pending_return_count || 0,
        unreadContactCount: data?.unread_contact_count || 0,
        unreadReviewCount: data?.unread_review_count || 0,
        totalUnreadCount: data?.total_unread_count || 0,
        isLoading,
        error,
        refetch,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    return {
      notifications: [],
      unreadOrderCount: 0,
      unreadPreorderCount: 0,
      pendingReturnCount: 0,
      unreadContactCount: 0,
      unreadReviewCount: 0,
      totalUnreadCount: 0,
      isLoading: false,
      error: undefined,
      refetch: () => { },
    };
  }
  return context;
}
