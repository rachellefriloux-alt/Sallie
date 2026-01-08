import { useState, useCallback } from 'react';

interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: number;
  duration?: number;
}

export function useNotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info',
    duration: number = 5000
  ) => {
    const id = Date.now().toString();
    const notification: Notification = {
      id,
      message,
      type,
      timestamp: Date.now(),
      duration,
    };

    setNotifications(prev => [...prev, notification]);

    // Auto-remove notification after duration
    if (duration > 0) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    showNotification,
    removeNotification,
    clearAllNotifications,
  };
}
