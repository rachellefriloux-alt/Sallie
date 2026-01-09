import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthentication } from '../../hooks/useAuthentication'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
})

// Mock fetch
global.fetch = jest.fn()

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useAuthentication', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    sessionStorageMock.getItem.mockReturnValue(null)
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

      const { result } = renderHook(() => useAuthentication(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        const success = await result.current.login('test@example.com', 'password123')
        expect(success).toBe(true)
      })

      expect(result.current.user).toEqual(mockResponse.user)
      expect(result.current.isAuthenticated).toBe(true)
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'sallie_tokens',
        JSON.stringify(mockResponse.tokens)
      )
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
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

      const { result } = renderHook(() => useAuthentication(), {
        wrapper: createWrapper(),
      })

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

      const { result } = renderHook(() => useAuthentication(), {
        wrapper: createWrapper(),
      })

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

      const { result } = renderHook(() => useAuthentication(), {
        wrapper: createWrapper(),
      })

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
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'sallie_tokens') return JSON.stringify({ access: 'token', refresh: 'refresh' })
        if (key === 'sallie_user') return JSON.stringify({ id: 'user123' })
        return null
      })

      const { result } = renderHook(() => useAuthentication(), {
        wrapper: createWrapper(),
      })

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
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('sallie_tokens')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('sallie_user')
      expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('sallie_session')
    })
  })

  describe('Token Refresh', () => {
    it('should refresh tokens successfully', async () => {
      const mockTokens = {
        access: 'new-access-token',
        refresh: 'new-refresh-token',
      }

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTokens,
      })

      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'sallie_tokens') return JSON.stringify({ access: 'old-token', refresh: 'old-refresh' })
        return null
      })

      const { result } = renderHook(() => useAuthentication(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        const success = await result.current.refreshTokens()
        expect(success).toBe(true)
      })

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'sallie_tokens',
        JSON.stringify(mockTokens)
      )
    })

    it('should handle token refresh failure', async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Invalid refresh token' }),
      })

      const { result } = renderHook(() => useAuthentication(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        const success = await result.current.refreshTokens()
        expect(success).toBe(false)
      })

      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  describe('Two-Factor Authentication', () => {
    it('should enable 2FA successfully', async () => {
      const mockResponse = {
        qrCode: 'data:image/png;base64,qr-code-data',
        backupCodes: ['code1', 'code2', 'code3'],
      }

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const { result } = renderHook(() => useAuthentication(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        const response = await result.current.enable2FA()
        expect(response).toEqual(mockResponse)
      })
    })

    it('should verify 2FA code', async () => {
      const mockResponse = { verified: true }

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const { result } = renderHook(() => useAuthentication(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        const verified = await result.current.verify2FA('123456')
        expect(verified).toBe(true)
      })
    })
  })

  describe('Biometric Authentication', () => {
    it('should check biometric availability', async () => {
      // Mock WebAuthn API
      const mockCredentials = {
        create: jest.fn(),
        get: jest.fn(),
      }
      Object.defineProperty(window.navigator, 'credentials', {
        value: mockCredentials,
        writable: true,
      })

      const { result } = renderHook(() => useAuthentication(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        const available = await result.current.checkBiometricAvailability()
        expect(typeof available).toBe('boolean')
      })
    })
  })

  describe('Device Fingerprinting', () => {
    it('should generate device fingerprint', () => {
      const { result } = renderHook(() => useAuthentication(), {
        wrapper: createWrapper(),
      })

      const fingerprint = result.current.generateDeviceFingerprint()
      expect(typeof fingerprint).toBe('string')
      expect(fingerprint.length).toBeGreaterThan(0)
    })
  })

  describe('Security Features', () => {
    it('should detect suspicious login attempts', async () => {
      const mockResponse = {
        suspicious: true,
        reason: 'New location detected',
        requiresVerification: true,
      }

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const { result } = renderHook(() => useAuthentication(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        const analysis = await result.current.analyzeLoginAttempt('192.168.1.1', 'Chrome/120.0')
        expect(analysis).toEqual(mockResponse)
      })
    })

    it('should handle IP restrictions', async () => {
      const mockResponse = {
        allowed: false,
        reason: 'IP address not in whitelist',
      }

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const { result } = renderHook(() => useAuthentication(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        const check = await result.current.checkIPRestriction('192.168.1.1')
        expect(check).toEqual(mockResponse)
      })
    })
  })
})
