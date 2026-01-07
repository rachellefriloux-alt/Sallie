import { useState, useCallback, useEffect } from 'react';
import { Platform, Alert, PushNotificationIOS, PermissionsAndroid } from 'react-native';
import { Notifications } from 'expo-notifications';
import * as Device from 'expo-device';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: number;
  duration?: number;
  data?: any;
}

interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
  badge: boolean;
}

export function useNotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    sound: true,
    vibration: true,
    badge: true,
  });
  const [permissionGranted, setPermissionGranted] = useState(false);

  // Initialize notifications
  useEffect(() => {
    initializeNotifications();
  }, []);

  const initializeNotifications = async () => {
    if (Device.isDevice) {
      await configureNotifications();
      await requestPermissions();
    }
  };

  const configureNotifications = async () => {
    if (Platform.OS === 'ios') {
      await Notifications.setNotificationCategoryAsync('default', [
        {
          identifier: 'default',
          buttons: [
            {
              identifier: 'dismiss',
              title: 'Dismiss',
              options: { opensAppToForeground: false },
            },
            {
              identifier: 'view',
              title: 'View',
              options: { opensAppToForeground: true },
            },
          ],
        },
      ]);
    }

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: settings.sound,
        shouldSetBadge: settings.badge,
      }),
    });
  };

  const requestPermissions = async () => {
    if (Platform.OS === 'ios') {
      const { status } = await Notifications.requestPermissionsAsync();
      setPermissionGranted(status === 'granted');
    } else if (Platform.OS === 'android') {
      const { status } = await Notifications.requestPermissionsAsync();
      setPermissionGranted(status === 'granted');
    }
  };

  const showNotification = useCallback(
    async (
      title: string,
      message: string,
      type: 'info' | 'success' | 'warning' | 'error' = 'info',
      duration: number = 5000,
      data?: any
    ) => {
      const id = Date.now().toString();
      const notification: Notification = {
        id,
        title,
        message,
        type,
        timestamp: Date.now(),
        duration,
        data,
      };

      // Add to local state
      setNotifications(prev => [...prev, notification]);

      // Auto-remove notification after duration
      if (duration > 0) {
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== id));
        }, duration);
      }

      // Show native notification if app is in background
      if (permissionGranted && settings.enabled) {
        try {
          await Notifications.scheduleNotificationAsync({
            content: {
              title,
              body: message,
              data: { notificationId: id, ...data },
              sound: settings.sound ? 'default' : false,
              priority: getPriority(type),
              categoryId: 'default',
            },
            trigger: null, // Show immediately
          });
        } catch (error) {
          console.error('Failed to show native notification:', error);
        }
      }

      // Show in-app alert for critical notifications
      if (type === 'error') {
        Alert.alert(title, message, [
          { text: 'OK', onPress: () => {} },
        ]);
      }

      return id;
    },
    [permissionGranted, settings]
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    
    // Cancel native notification if scheduled
    Notifications.dismissNotificationAsync(id);
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    
    // Dismiss all native notifications
    Notifications.dismissAllNotificationsAsync();
  }, []);

  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const getNotificationsByType = useCallback((type: Notification['type']) => {
    return notifications.filter(n => n.type === type);
  }, [notifications]);

  const getUnreadCount = useCallback(() => {
    return notifications.length;
  }, [notifications]);

  // Push notification handlers
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const { notification } = response;
      const data = notification.request.content.data;
      
      // Handle notification tap
      if (data.notificationId) {
        // Navigate to relevant screen or perform action
        console.log('Notification tapped:', data);
      }
    });

    return () => subscription.remove();
  }, []);

  // Background notification handler
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      // Handle notification received in foreground
      console.log('Notification received:', notification);
    });

    return () => subscription.remove();
  }, []);

  return {
    notifications,
    settings,
    permissionGranted,
    showNotification,
    removeNotification,
    clearAllNotifications,
    updateSettings,
    getNotificationsByType,
    getUnreadCount,
    requestPermissions,
  };
}

// Helper function to get notification priority based on type
const getPriority = (type: Notification['type']): Notifications.AndroidNotificationPriority => {
  switch (type) {
    case 'error':
      return Notifications.AndroidNotificationPriority.HIGH;
    case 'warning':
      return Notifications.AndroidNotificationPriority.DEFAULT;
    case 'success':
      return Notifications.AndroidNotificationPriority.DEFAULT;
    case 'info':
    default:
      return Notifications.AndroidNotificationPriority.LOW;
  }
};

// Notification context for global access
import { createContext, useContext } from 'react';

const NotificationContext = createContext<ReturnType<typeof useNotificationSystem> | null>(null);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const notification = useNotificationSystem();
  
  return (
    <NotificationContext.Provider value={notification}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
