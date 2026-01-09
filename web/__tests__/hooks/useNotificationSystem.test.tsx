import { renderHook, act } from '@testing-library/react'
import { useNotificationSystem } from '../../hooks/useNotificationSystem'

// Mock setTimeout and clearTimeout
const setTimeoutMock = jest.fn()
const clearTimeoutMock = jest.fn()
Object.defineProperty(global, 'setTimeout', { value: setTimeoutMock })
Object.defineProperty(global, 'clearTimeout', { value: clearTimeoutMock })

// Mock Notification API
const mockNotification = {
  requestPermission: jest.fn(),
  close: jest.fn(),
}

Object.defineProperty(window, 'Notification', {
  value: mockNotification,
  writable: true,
})

describe('useNotificationSystem', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('Local Notifications', () => {
    it('should show a notification', () => {
      const { result } = renderHook(() => useNotificationSystem())

      act(() => {
        result.current.showNotification({
          id: 'test-1',
          message: 'Test notification',
          type: 'info',
          duration: 5000,
        })
      })

      expect(result.current.notifications).toHaveLength(1)
      expect(result.current.notifications[0]).toMatchObject({
        id: 'test-1',
        message: 'Test notification',
        type: 'info',
        duration: 5000,
      })
      expect(setTimeoutMock).toHaveBeenCalled()
    })

    it('should remove notification manually', () => {
      const { result } = renderHook(() => useNotificationSystem())

      act(() => {
        result.current.showNotification({
          id: 'test-1',
          message: 'Test notification',
          type: 'info',
        })
      })

      expect(result.current.notifications).toHaveLength(1)

      act(() => {
        result.current.removeNotification('test-1')
      })

      expect(result.current.notifications).toHaveLength(0)
    })

    it('should auto-remove notification after duration', () => {
      const { result } = renderHook(() => useNotificationSystem())

      act(() => {
        result.current.showNotification({
          id: 'test-1',
          message: 'Test notification',
          type: 'info',
          duration: 5000,
        })
      })

      expect(result.current.notifications).toHaveLength(1)

      act(() => {
        jest.advanceTimersByTime(5000)
      })

      expect(result.current.notifications).toHaveLength(0)
    })

    it('should clear all notifications', () => {
      const { result } = renderHook(() => useNotificationSystem())

      act(() => {
        result.current.showNotification({
          id: 'test-1',
          message: 'Test notification 1',
          type: 'info',
        })
        result.current.showNotification({
          id: 'test-2',
          message: 'Test notification 2',
          type: 'success',
        })
      })

      expect(result.current.notifications).toHaveLength(2)

      act(() => {
        result.current.clearNotifications()
      })

      expect(result.current.notifications).toHaveLength(0)
    })

    it('should handle different notification types', () => {
      const { result } = renderHook(() => useNotificationSystem())

      const types = ['info', 'success', 'warning', 'error'] as const

      types.forEach((type) => {
        act(() => {
          result.current.showNotification({
            id: `test-${type}`,
            message: `${type} notification`,
            type,
          })
        })
      })

      expect(result.current.notifications).toHaveLength(4)
      result.current.notifications.forEach((notification, index) => {
        expect(notification.type).toBe(types[index])
      })
    })
  })

  describe('Native Notifications', () => {
    it('should request permission for native notifications', async () => {
      mockNotification.requestPermission.mockResolvedValue('granted')

      const { result } = renderHook(() => useNotificationSystem())

      await act(async () => {
        const granted = await result.current.requestNativePermission()
        expect(granted).toBe(true)
        expect(mockNotification.requestPermission).toHaveBeenCalled()
      })
    })

    it('should handle permission denial', async () => {
      mockNotification.requestPermission.mockResolvedValue('denied')

      const { result } = renderHook(() => useNotificationSystem())

      await act(async () => {
        const granted = await result.current.requestNativePermission()
        expect(granted).toBe(false)
      })
    })

    it('should show native notification when permitted', async () => {
      mockNotification.requestPermission.mockResolvedValue('granted')

      const { result } = renderHook(() => useNotificationSystem())

      await act(async () => {
        await result.current.requestNativePermission()
      })

      act(() => {
        result.current.showNotification({
          id: 'native-test',
          message: 'Native notification',
          type: 'info',
          native: true,
        })
      })

      expect(result.current.notifications).toHaveLength(1)
      expect(result.current.notifications[0].native).toBe(true)
    })

    it('should not show native notification when not permitted', async () => {
      mockNotification.requestPermission.mockResolvedValue('denied')

      const { result } = renderHook(() => useNotificationSystem())

      await act(async () => {
        await result.current.requestNativePermission()
      })

      act(() => {
        result.current.showNotification({
          id: 'native-test',
          message: 'Native notification',
          type: 'info',
          native: true,
        })
      })

      expect(result.current.notifications).toHaveLength(1)
      expect(result.current.notifications[0].native).toBe(false)
    })
  })

  describe('Notification Settings', () => {
    it('should update notification settings', () => {
      const { result } = renderHook(() => useNotificationSystem())

      act(() => {
        result.current.updateSettings({
          enableNative: true,
          enableSound: false,
          enableVibration: true,
          duration: 8000,
        })
      })

      expect(result.current.settings).toMatchObject({
        enableNative: true,
        enableSound: false,
        enableVibration: true,
        duration: 8000,
      })
    })

    it('should use custom settings for new notifications', () => {
      const { result } = renderHook(() => useNotificationSystem())

      act(() => {
        result.current.updateSettings({
          duration: 10000,
          enableSound: true,
        })
      })

      act(() => {
        result.current.showNotification({
          id: 'custom-test',
          message: 'Custom notification',
          type: 'info',
        })
      })

      expect(result.current.notifications[0].duration).toBe(10000)
      expect(setTimeoutMock).toHaveBeenCalledWith(expect.any(Function), 10000)
    })
  })

  describe('Notification Actions', () => {
    it('should handle notification with actions', () => {
      const { result } = renderHook(() => useNotificationSystem())

      const mockAction = jest.fn()

      act(() => {
        result.current.showNotification({
          id: 'action-test',
          message: 'Notification with action',
          type: 'info',
          actions: [
            { label: 'OK', action: mockAction },
            { label: 'Cancel', action: jest.fn() },
          ],
        })
      })

      expect(result.current.notifications).toHaveLength(1)
      expect(result.current.notifications[0].actions).toHaveLength(2)

      act(() => {
        result.current.notifications[0].actions![0].action()
      })

      expect(mockAction).toHaveBeenCalled()
    })

    it('should handle notification with custom icon', () => {
      const { result } = renderHook(() => useNotificationSystem())

      act(() => {
        result.current.showNotification({
          id: 'icon-test',
          message: 'Notification with icon',
          type: 'success',
          icon: '🎉',
        })
      })

      expect(result.current.notifications[0].icon).toBe('🎉')
    })
  })

  describe('Notification Persistence', () => {
    it('should persist notifications to localStorage', () => {
      const localStorageMock = {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      }
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
        writable: true,
      })

      const { result } = renderHook(() => useNotificationSystem())

      act(() => {
        result.current.showNotification({
          id: 'persist-test',
          message: 'Persistent notification',
          type: 'info',
          persistent: true,
        })
      })

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'sallie_notifications',
        expect.any(String)
      )
    })

    it('should load notifications from localStorage on mount', () => {
      const mockNotifications = [
        {
          id: 'loaded-1',
          message: 'Loaded notification',
          type: 'info',
          persistent: true,
          timestamp: Date.now(),
        },
      ]

      const localStorageMock = {
        getItem: jest.fn().mockReturnValue(JSON.stringify(mockNotifications)),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      }
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
        writable: true,
      })

      const { result } = renderHook(() => useNotificationSystem())

      expect(result.current.notifications).toContainEqual(
        expect.objectContaining({
          id: 'loaded-1',
          message: 'Loaded notification',
          type: 'info',
        })
      )
    })
  })

  describe('Notification Categories', () => {
    it('should categorize notifications', () => {
      const { result } = renderHook(() => useNotificationSystem())

      act(() => {
        result.current.showNotification({
          id: 'system-1',
          message: 'System update',
          type: 'info',
          category: 'system',
        })
        result.current.showNotification({
          id: 'user-1',
          message: 'New message',
          type: 'success',
          category: 'user',
        })
      })

      expect(result.current.getNotificationsByCategory('system')).toHaveLength(1)
      expect(result.current.getNotificationsByCategory('user')).toHaveLength(1)
      expect(result.current.getNotificationsByCategory('system')[0].category).toBe('system')
    })
  })

  describe('Notification Priority', () => {
    it('should handle high priority notifications', () => {
      const { result } = renderHook(() => useNotificationSystem())

      act(() => {
        result.current.showNotification({
          id: 'high-priority',
          message: 'Critical alert',
          type: 'error',
          priority: 'high',
        })
      })

      expect(result.current.notifications[0].priority).toBe('high')
      // High priority notifications should not auto-dismiss
      expect(result.current.notifications[0].duration).toBe(0)
    })
  })
})
