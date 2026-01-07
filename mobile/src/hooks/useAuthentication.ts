import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as Device from 'expo-device';
import * as Network from 'expo-network';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'user' | 'admin' | 'superadmin';
  permissions: string[];
  lastLogin?: Date;
  createdAt: Date;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  acceptTerms: boolean;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  requirePasswordChange: boolean;
  allowedIPs: string[];
  deviceFingerprint: string;
  biometricEnabled: boolean;
}

const API_BASE_URL = 'http://192.168.1.47:8742/api/auth';

export function useAuthentication() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    sessionTimeout: 3600000, // 1 hour
    requirePasswordChange: false,
    allowedIPs: [],
    deviceFingerprint: '',
    biometricEnabled: false,
  });

  const sessionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize authentication on mount
  useEffect(() => {
    initializeAuth();
    generateDeviceFingerprint();
    checkBiometricSupport();
  }, []);

  // Session management
  useEffect(() => {
    if (authState.isAuthenticated && authState.token) {
      startSessionTimeout();
    } else {
      clearSessionTimeout();
    }

    return () => clearSessionTimeout();
  }, [authState.isAuthenticated, authState.token, securitySettings.sessionTimeout]);

  const initializeAuth = async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      const refreshToken = await SecureStore.getItemAsync('refresh_token');
      const userStr = await SecureStore.getItemAsync('auth_user');

      if (token && refreshToken && userStr) {
        const user = JSON.parse(userStr);
        
        // Validate token
        const isValid = await validateToken(token);
        if (isValid) {
          setAuthState({
            user,
            token,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          
          // Update last login
          await updateLastLogin(user.id);
        } else {
          // Token expired, try refresh
          const newToken = await refreshAccessToken(refreshToken);
          if (newToken) {
            await SecureStore.setItemAsync('auth_token', newToken);
            setAuthState({
              user,
              token: newToken,
              refreshToken,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            // Refresh failed, clear auth
            clearAuth();
          }
        }
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Authentication initialization failed',
      }));
    }
  };

  const generateDeviceFingerprint = async () => {
    try {
      const deviceInfo = {
        brand: Device.brand,
        modelName: Device.modelName,
        osVersion: Device.osVersion,
        platform: Platform.OS,
        isDevice: Device.isDevice,
        totalMemory: Device.totalMemory,
        supportedCpuArchitectures: Device.supportedCpuArchitectures,
      };

      const fingerprint = JSON.stringify(deviceInfo);
      const encodedFingerprint = Buffer.from(fingerprint).toString('base64');
      
      setSecuritySettings(prev => ({ ...prev, deviceFingerprint: encodedFingerprint }));
    } catch (error) {
      console.error('Error generating device fingerprint:', error);
    }
  };

  const checkBiometricSupport = async () => {
    try {
      // In a real app, you'd use expo-local-authentication
      // For now, we'll simulate biometric support
      const hasBiometric = Platform.OS === 'ios' || Platform.OS === 'android';
      setSecuritySettings(prev => ({ ...prev, biometricEnabled: hasBiometric }));
    } catch (error) {
      console.error('Error checking biometric support:', error);
    }
  };

  const validateToken = async (token: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/validate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  };

  const refreshAccessToken = async (refreshToken: string): Promise<string | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.token;
      }
    } catch (error) {
      console.error('Token refresh error:', error);
    }
    return null;
  };

  const updateLastLogin = async (userId: string) => {
    try {
      await fetch(`${API_BASE_URL}/last-login`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authState.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  };

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Validate network connectivity
      const networkState = await Network.getNetworkStateAsync();
      if (!networkState.isConnected) {
        throw new Error('No internet connection');
      }

      // Validate IP if restrictions exist
      if (securitySettings.allowedIPs.length > 0) {
        const clientIP = await getClientIP();
        if (!securitySettings.allowedIPs.includes(clientIP)) {
          throw new Error('Access denied from this IP address');
        }
      }

      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-Fingerprint': securitySettings.deviceFingerprint,
          'X-Platform': Platform.OS,
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      
      // Check if 2FA is required
      if (data.requiresTwoFactor) {
        // Handle 2FA flow
        return await handleTwoFactorAuth(data.tempToken, credentials);
      }

      // Set auth state
      const user: User = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        avatar: data.user.avatar,
        role: data.user.role,
        permissions: data.user.permissions,
        lastLogin: new Date(),
        createdAt: new Date(data.user.createdAt),
      };

      setAuthState({
        user,
        token: data.token,
        refreshToken: data.refreshToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      // Store in secure storage
      await SecureStore.setItemAsync('auth_token', data.token);
      await SecureStore.setItemAsync('refresh_token', data.refreshToken);
      await SecureStore.setItemAsync('auth_user', JSON.stringify(user));

      // Store preferences
      if (credentials.rememberMe) {
        await AsyncStorage.setItem('remember_me', 'true');
      }

      return true;
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      }));
      return false;
    }
  };

  const handleTwoFactorAuth = async (tempToken: string, credentials: LoginCredentials): Promise<boolean> => {
    // In a real implementation, you'd show a 2FA input modal
    // For now, we'll simulate successful 2FA
    try {
      const response = await fetch(`${API_BASE_URL}/verify-2fa`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tempToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: '123456' }), // Simulated 2FA code
      });

      if (!response.ok) {
        throw new Error('Invalid 2FA code');
      }

      const data = await response.json();
      
      const user: User = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        avatar: data.user.avatar,
        role: data.user.role,
        permissions: data.user.permissions,
        lastLogin: new Date(),
        createdAt: new Date(data.user.createdAt),
      };

      setAuthState({
        user,
        token: data.token,
        refreshToken: data.refreshToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      // Store in secure storage
      await SecureStore.setItemAsync('auth_token', data.token);
      await SecureStore.setItemAsync('refresh_token', data.refreshToken);
      await SecureStore.setItemAsync('auth_user', JSON.stringify(user));

      return true;
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : '2FA verification failed',
      }));
      return false;
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      if (data.password !== data.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (data.password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      if (!data.acceptTerms) {
        throw new Error('You must accept the terms and conditions');
      }

      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-Fingerprint': securitySettings.deviceFingerprint,
          'X-Platform': Platform.OS,
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          name: data.name,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      const result = await response.json();
      
      // Auto-login after successful registration
      return await login({
        email: data.email,
        password: data.password,
        rememberMe: false,
      });
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      }));
      return false;
    }
  };

  const logout = async () => {
    try {
      if (authState.token) {
        await fetch(`${API_BASE_URL}/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authState.token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
    }
  };

  const clearAuth = async () => {
    setAuthState({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });

    // Clear secure storage
    await SecureStore.deleteItemAsync('auth_token');
    await SecureStore.deleteItemAsync('refresh_token');
    await SecureStore.deleteItemAsync('auth_user');
    await AsyncStorage.removeItem('remember_me');
  };

  const updateProfile = async (updates: Partial<User>): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authState.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedUser = await response.json();
      
      setAuthState(prev => ({
        ...prev,
        user: { ...prev.user!, ...updatedUser },
      }));

      // Update secure storage
      const userStr = JSON.stringify({ ...authState.user!, ...updatedUser });
      await SecureStore.setItemAsync('auth_user', userStr);

      return true;
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Profile update failed',
      }));
      return false;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authState.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Password change failed');
      }

      return true;
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Password change failed',
      }));
      return false;
    }
  };

  const enableTwoFactor = async (): Promise<string> => {
    try {
      const response = await fetch(`${API_BASE_URL}/enable-2fa`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authState.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to enable 2FA');
      }

      const data = await response.json();
      return data.qrCode; // QR code for 2FA setup
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '2FA setup failed',
      }));
      throw error;
    }
  };

  const authenticateWithBiometrics = async (): Promise<boolean> => {
    try {
      // In a real app, you'd use expo-local-authentication
      // For now, we'll simulate biometric authentication
      if (!securitySettings.biometricEnabled) {
        throw new Error('Biometric authentication not available');
      }

      // Simulate biometric scan
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return false;
    }
  };

  const hasPermission = (permission: string): boolean => {
    return authState.user?.permissions.includes(permission) || false;
  };

  const hasRole = (role: string): boolean => {
    return authState.user?.role === role || false;
  };

  const startSessionTimeout = () => {
    clearSessionTimeout();
    sessionTimeoutRef.current = setTimeout(() => {
      logout();
    }, securitySettings.sessionTimeout);
  };

  const clearSessionTimeout = () => {
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
      sessionTimeoutRef.current = null;
    }
  };

  const getClientIP = async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('Error getting client IP:', error);
      return 'unknown';
    }
  };

  return {
    // State
    authState,
    securitySettings,
    
    // Actions
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    enableTwoFactor,
    authenticateWithBiometrics,
    
    // Utilities
    hasPermission,
    hasRole,
    clearAuth,
    
    // Session management
    startSessionTimeout,
    clearSessionTimeout,
  };
}

// Authentication context
const AuthContext = createContext<ReturnType<typeof useAuthentication> | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuthentication();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
