import { renderHook, act } from '@testing-library/react-hooks'
import { useAuthentication } from '../../src/hooks/useAuthentication'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as SecureStore from 'expo-secure-store'
import * as Biometrics from 'react-native-biometrics'
import { Alert } from 'react-native'

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}))

// Mock SecureStore
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}))

// Mock Biometrics
jest.mock('react-native-biometrics', () => ({
  isSensorAvailable: jest.fn(),
  createKeys: jest.fn(),
  createSignature: jest.fn(),
  deleteKeys: jest.fn(),
}))

// Mock Alert
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
}))

// Mock fetch
global.fetch = jest.fn()

describe('useAuthentication (Mobile)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(AsyncStorage.getItem as jest.Mock).mockResolvedValue(null)
    ;(SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null)
  })

  describe('Login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockResponse = {
        user: {
          id: 'user123',
          email: 'test@example.com',
          name: 'Test User',
        },
        tokens: {
          access: 'access-token',
          refresh: 'refresh-token',
        },
      }

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const { result } = renderHook(() => useAuthentication())

      await act(async () => {
        const success = await result.current.login('test@example.com', 'password123')
        expect(success).toBe(true)
      })

      expect(result.current.user).toEqual(mockResponse.user)
      expect(result.current.isAuthenticated).toBe(true)
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'sallie_tokens',
        JSON.stringify(mockResponse.tokens)
      )
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'sallie_user',
        JSON.stringify(mockResponse.user)
      )
    })

    it('should handle login failure', async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Invalid credentials' }),
      })

      const { result } = renderHook(() => useAuthentication())

      await act(async () => {
        const success = await result.current.login('test@example.com', 'wrong-password')
        expect(success).toBe(false)
      })

      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.error).toBe('Invalid credentials')
    })
  })

  describe('Registration', () => {
    it('should register successfully', async () => {
      const mockResponse = {
        user: {
          id: 'user123',
          email: 'new@example.com',
          name: 'New User',
        },
        tokens: {
          access: 'access-token',
          refresh: 'refresh-token',
        },
      }

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const { result } = renderHook(() => useAuthentication())

      await act(async () => {
        const success = await result.current.register(
          'new@example.com',
          'password123',
          'New User'
        )
        expect(success).toBe(true)
      })

      expect(result.current.user).toEqual(mockResponse.user)
      expect(result.current.isAuthenticated).toBe(true)
    })

    it('should handle registration failure', async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({ message: 'Email already exists' }),
      })

      const { result } = renderHook(() => useAuthentication())

      await act(async () => {
        const success = await result.current.register(
          'existing@example.com',
          'password123',
          'Existing User'
        )
        expect(success).toBe(false)
      })

      expect(result.current.error).toBe('Email already exists')
    })
  })

  describe('Logout', () => {
    it('should logout and clear storage', async () => {
      // Set up authenticated state
      ;(SecureStore.getItemAsync as jest.Mock).mockResolvedValue(
        JSON.stringify({ access: 'token', refresh: 'refresh' })
      )
      ;(AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify({ id: 'user123' })
      )

      const { result } = renderHook(() => useAuthentication())

      // Initialize with existing tokens
      await act(async () => {
        await result.current.initializeAuth()
      })

      expect(result.current.isAuthenticated).toBe(true)

      await act(async () => {
        result.current.logout()
      })

      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('sallie_tokens')
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('sallie_user')
    })
  })

  describe('Biometric Authentication', () => {
    it('should check biometric availability', async () => {
      ;(Biometrics.isSensorAvailable as jest.Mock).mockResolvedValue({
        available: true,
        biometryType: 'TouchID',
      })

      const { result } = renderHook(() => useAuthentication())

      await act(async () => {
        const available = await result.current.checkBiometricAvailability()
        expect(available).toBe(true)
      })

      expect(Biometrics.isSensorAvailable).toHaveBeenCalled()
    })

    it('should handle biometric login', async () => {
      ;(Biometrics.isSensorAvailable as jest.Mock).mockResolvedValue({
        available: true,
        biometryType: 'TouchID',
      })

      ;(Biometrics.createSignature as jest.Mock).mockResolvedValue({
        success: true,
        signature: 'biometric-signature',
      })

      const mockResponse = {
        user: {
          id: 'user123',
          email: 'test@example.com',
          name: 'Test User',
        },
        tokens: {
          access: 'access-token',
          refresh: 'refresh-token',
        },
      }

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const { result } = renderHook(() => useAuthentication())

      await act(async () => {
        const success = await result.current.loginWithBiometrics()
        expect(success).toBe(true)
      })

      expect(result.current.user).toEqual(mockResponse.user)
      expect(result.current.isAuthenticated).toBe(true)
    })

    it('should handle biometric unavailability', async () => {
      ;(Biometrics.isSensorAvailable as jest.Mock).mockResolvedValue({
        available: false,
      })

      const { result } = renderHook(() => useAuthentication())

      await act(async () => {
        const available = await result.current.checkBiometricAvailability()
        expect(available).toBe(false)
      })

      expect(Alert.alert).toHaveBeenCalledWith(
        'Biometric Authentication',
        'Biometric authentication is not available on this device'
      )
    })
  })

  describe('Device Fingerprinting', () => {
    it('should generate device fingerprint', async () => {
      const { result } = renderHook(() => useAuthentication())

      const fingerprint = await result.current.generateDeviceFingerprint()
      expect(typeof fingerprint).toBe('string')
      expect(fingerprint.length).toBeGreaterThan(0)
    })

    it('should include device info in fingerprint', async () => {
      const { result } = renderHook(() => useAuthentication())

      const fingerprint = await result.current.generateDeviceFingerprint()
      
      // Should include device-specific information
      expect(fingerprint).toContain('deviceInfo')
      expect(fingerprint).toContain('timestamp')
    })
  })

  describe('Security Features', () => {
    it('should detect jailbroken/rooted device', async () => {
      const { result } = renderHook(() => useAuthentication())

      const isJailbroken = await result.current.detectJailbreak()
      expect(typeof isJailbroken).toBe('boolean')
    })

    it('should handle secure storage properly', async () => {
      const mockTokens = {
        access: 'secure-access-token',
        refresh: 'secure-refresh-token',
      }

      const { result } = renderHook(() => useAuthentication())

      await act(async () => {
        await result.current.secureStoreTokens(mockTokens)
      })

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'sallie_tokens',
        JSON.stringify(mockTokens)
      )
    })

    it('should handle secure token retrieval', async () => {
      const mockTokens = {
        access: 'secure-access-token',
        refresh: 'secure-refresh-token',
      }

      ;(SecureStore.getItemAsync as jest.Mock).mockResolvedValue(
        JSON.stringify(mockTokens)
      )

      const { result } = renderHook(() => useAuthentication())

      await act(async () => {
        const tokens = await result.current.secureGetTokens()
        expect(tokens).toEqual(mockTokens)
      })
    })
  })

  describe('Mobile-Specific Features', () => {
    it('should handle app backgrounding/foregrounding', async () => {
      const { result } = renderHook(() => useAuthentication())

      // Simulate app backgrounding
      await act(async () => {
        result.current.handleAppStateChange('background')
      })

      // Should pause sensitive operations
      expect(result.current.isAppActive).toBe(false)

      // Simulate app foregrounding
      await act(async () => {
        result.current.handleAppStateChange('active')
      })

      // Should resume operations and check authentication
      expect(result.current.isAppActive).toBe(true)
    })

    it('should handle network connectivity changes', async () => {
      const { result } = renderHook(() => useAuthentication())

      // Simulate network disconnection
      await act(async () => {
        result.current.handleNetworkChange('disconnected')
      })

      expect(result.current.isOnline).toBe(false)

      // Simulate network reconnection
      await act(async () => {
        result.current.handleNetworkChange('connected')
      })

      expect(result.current.isOnline).toBe(true)
    })

    it('should handle offline authentication', async () => {
      const { result } = renderHook(() => useAuthentication())

      // Set up offline mode
      await act(async () => {
        result.current.handleNetworkChange('disconnected')
      })

      // Should use cached authentication if available
      ;(AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify({ id: 'user123', email: 'test@example.com' })
      )

      await act(async () => {
        const isValid = await result.current.validateOfflineAuth()
        expect(typeof isValid).toBe('boolean')
      })
    })
  })

  describe('Token Management', () => {
    it('should refresh tokens automatically', async () => {
      const mockTokens = {
        access: 'new-access-token',
        refresh: 'new-refresh-token',
      }

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTokens,
      })

      ;(SecureStore.getItemAsync as jest.Mock).mockResolvedValue(
        JSON.stringify({ access: 'old-token', refresh: 'old-refresh' })
      )

      const { result } = renderHook(() => useAuthentication())

      await act(async () => {
        const success = await result.current.refreshTokens()
        expect(success).toBe(true)
      })

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'sallie_tokens',
        JSON.stringify(mockTokens)
      )
    })

    it('should handle token expiration gracefully', async () => {
      const { result } = renderHook(() => useAuthentication())

      // Simulate expired token
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Token expired' }),
      })

      await act(async () => {
        const success = await result.current.refreshTokens()
        expect(success).toBe(false)
      })

      expect(result.current.isAuthenticated).toBe(false)
      expect(Alert.alert).toHaveBeenCalledWith(
        'Session Expired',
        'Please login again'
      )
    })
  })

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useAuthentication())

      await act(async () => {
        const success = await result.current.login('test@example.com', 'password123')
        expect(success).toBe(false)
      })

      expect(result.current.error).toContain('Network error')
    })

    it('should handle storage errors', async () => {
      ;(SecureStore.setItemAsync as jest.Mock).mockRejectedValueOnce(
        new Error('Storage error')
      )

      const { result } = renderHook(() => useAuthentication())

      await act(async () => {
        const success = await result.current.secureStoreTokens({
          access: 'token',
          refresh: 'refresh',
        })
        expect(success).toBe(false)
      })

      expect(result.current.error).toContain('Storage error')
    })
  })

  describe('Security Best Practices', () => {
    it('should clear sensitive data on logout', async () => {
      const { result } = renderHook(() => useAuthentication())

      // Set up authenticated state
      ;(SecureStore.getItemAsync as jest.Mock).mockResolvedValue(
        JSON.stringify({ access: 'token', refresh: 'refresh' })
      )

      await act(async () => {
        await result.current.initializeAuth()
      })

      await act(async () => {
        result.current.logout()
      })

      // Should clear all sensitive data
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('sallie_tokens')
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('sallie_user')
      expect(result.current.user).toBeNull()
      expect(result.current.tokens).toBeNull()
    })

    it('should implement rate limiting', async () => {
      const { result } = renderHook(() => useAuthentication())

      // Make multiple rapid login attempts
      const attempts = Array(5).fill(null).map(() =>
        act(async () => {
          await result.current.login('test@example.com', 'password123')
        })
      )

      await Promise.all(attempts)

      // Should implement rate limiting
      expect(result.current.isRateLimited).toBe(true)
    })
  })
})
