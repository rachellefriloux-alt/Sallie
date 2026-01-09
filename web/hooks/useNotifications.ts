'use client';

import { useState, useEffect, useCallback } from 'react';

type Notification = {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  persistent?: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
    style?: 'primary' | 'secondary' | 'danger';
  }>;
  metadata?: Record<string, any>;
};

type NotificationSettings = {
  enabled: boolean;
  desktop: boolean;
  sound: boolean;
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  duration: number;
  maxVisible: number;
};

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    desktop: true,
    sound: true,
    position: 'top-right',
    duration: 5000,
    maxVisible: 5
  });

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  }, []);

  // Add a new notification
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev].slice(0, 100)); // Keep last 100

    // Show desktop notification if enabled and permitted
    if (settings.enabled && settings.desktop && 'Notification' in window && Notification.permission === 'granted') {
      const desktopNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id,
        requireInteraction: notification.persistent
      });

      // Auto-close after duration if not persistent
      if (!notification.persistent && settings.duration > 0) {
        setTimeout(() => {
          desktopNotification.close();
        }, settings.duration);
      }

      // Handle click
      desktopNotification.onclick = () => {
        desktopNotification.close();
        markAsRead(notification.id);
      };
    }

    // Play sound if enabled
    if (settings.sound && settings.enabled) {
      playNotificationSound(notification.type);
    }

    return id;
  }, [settings]);

  // Mark notification as read
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  // Remove notification
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Get unread count
  const getUnreadCount = useCallback(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  // Get notifications by type
  const getNotificationsByType = useCallback((type: Notification['type']) => {
    return notifications.filter(n => n.type === type);
  }, [notifications]);

  // Play notification sound
  const playNotificationSound = useCallback((type: Notification['type']) => {
    try {
      const audio = new Audio();
      
      switch (type) {
        case 'success':
          audio.src = '/sounds/success.mp3';
          break;
        case 'warning':
          audio.src = '/sounds/warning.mp3';
          break;
        case 'error':
          audio.src = '/sounds/error.mp3';
          break;
        default:
          audio.src = '/sounds/info.mp3';
      }
      
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Ignore audio play errors (might be blocked by browser)
      });
    } catch (error) {
      // Ignore sound errors
    }
  }, []);

  // Convenience methods for different notification types
  const showInfo = useCallback((title: string, message: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'info',
      title,
      message,
      ...options
    });
  }, [addNotification]);

  const showSuccess = useCallback((title: string, message: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'success',
      title,
      message,
      ...options
    });
  }, [addNotification]);

  const showWarning = useCallback((title: string, message: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'warning',
      title,
      message,
      persistent: true,
      ...options
    });
  }, [addNotification]);

  const showError = useCallback((title: string, message: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'error',
      title,
      message,
      persistent: true,
      ...options
    });
  }, [addNotification]);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Request permission on mount
  useEffect(() => {
    if (settings.desktop) {
      requestPermission();
    }
  }, [settings.desktop, requestPermission]);

  // Auto-remove non-persistent notifications after duration
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setNotifications(prev => 
        prev.filter(notification => {
          if (notification.persistent || notification.read) {
            return true;
          }
          const age = now - notification.timestamp.getTime();
          return age < settings.duration;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [settings.duration]);

  return {
    notifications,
    settings,
    unreadCount: getUnreadCount(),
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    getNotificationsByType,
    showInfo,
    showSuccess,
    showWarning,
    showError,
    updateSettings,
    requestPermission
  };
}
