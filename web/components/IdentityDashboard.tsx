'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Shield, 
  Key, 
  Fingerprint, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff,
  Smartphone,
  Mail,
  AlertCircle,
  CheckCircle,
  Clock,
  Settings,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  Plus,
  Edit,
  Save,
  X,
  ChevronRight,
  ChevronDown,
  UserPlus,
  Users,
  CreditCard,
  Globe,
  Wifi,
  Database,
  Activity,
  Zap,
  Heart,
  Star,
  Award,
  Crown,
  Gem,
  Sparkles,
  Target,
  TrendingUp,
  BarChart3,
  PieChart,
  LineChart,
  Calendar,
  Bell,
  Search,
  Filter,
  MoreVertical,
  Copy,
  Share2,
  Link,
  QrCode,
  Camera,
  Mic,
  Volume2,
  Monitor,
  Tablet,
  Smartphone as PhoneIcon
} from 'lucide-react';

interface IdentityDashboardProps {
  className?: string;
  compact?: boolean;
  showAdvancedMetrics?: boolean;
  realTimeUpdates?: boolean;
}

interface IdentityProfile {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatar: string;
  bio: string;
  role: 'creator' | 'admin' | 'user' | 'guest';
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  trustLevel: number;
  reputation: number;
  joinedAt: string;
  lastActive: string;
  preferences: {
    theme: string;
    language: string;
    notifications: boolean;
    privacy: {
      showOnlineStatus: boolean;
      showActivity: boolean;
      allowDataCollection: boolean;
      shareProfile: boolean;
    };
  };
  security: {
    twoFactorEnabled: boolean;
    lastPasswordChange: string;
    loginAttempts: number;
    activeSessions: number;
    trustedDevices: number;
  };
  metrics: {
    totalInteractions: number;
    featuresUsed: number;
    sessionCount: number;
    averageSessionTime: number;
    dataGenerated: number;
    storageUsed: number;
  };
}

interface AuthenticationMethod {
  id: string;
  type: 'password' | 'biometric' | 'hardware' | 'social' | 'sso';
  name: string;
  enabled: boolean;
  lastUsed: string;
  strength: 'weak' | 'medium' | 'strong' | 'maximum';
  icon: any;
  description: string;
  setupRequired: boolean;
}

interface SecurityEvent {
  id: string;
  type: 'login' | 'logout' | 'failed_attempt' | 'password_change' | '2fa_enabled' | 'device_added' | 'suspicious';
  timestamp: string;
  location: string;
  device: string;
  ipAddress: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'success' | 'failed' | 'pending';
  details: string;
}

interface TrustedDevice {
  id: string;
  name: string;
  type: 'desktop' | 'mobile' | 'tablet' | 'browser';
  platform: string;
  lastUsed: string;
  trusted: boolean;
  currentSession: boolean;
  location: string;
}

const IDENTITY_ROLES = {
  creator: { label: 'Creator', color: '#8B5CF6', icon: Crown, permissions: ['full'] },
  admin: { label: 'Administrator', color: '#3B82F6', icon: Shield, permissions: ['admin', 'manage'] },
  user: { label: 'User', color: '#10B981', icon: User, permissions: ['basic'] },
  guest: { label: 'Guest', color: '#6B7280', icon: Users, permissions: ['limited'] }
};

const AUTH_METHODS = {
  password: { label: 'Password', icon: Key, color: '#EF4444' },
  biometric: { label: 'Biometric', icon: Fingerprint, color: '#10B981' },
  hardware: { label: 'Hardware Key', icon: Shield, color: '#3B82F6' },
  social: { label: 'Social Login', icon: Globe, color: '#8B5CF6' },
  sso: { label: 'SSO', icon: Users, color: '#F59E0B' }
};

const SECURITY_LEVELS = {
  maximum: { min: 90, max: 100, color: '#10B981', label: 'Maximum' },
  strong: { min: 70, max: 89, color: '#3B82F6', label: 'Strong' },
  medium: { min: 50, max: 69, color: '#F59E0B', label: 'Medium' },
  weak: { min: 0, max: 49, color: '#EF4444', label: 'Weak' }
};

export const IdentityDashboard: React.FC<IdentityDashboardProps> = ({ 
  className = '',
  compact = false,
  showAdvancedMetrics = true,
  realTimeUpdates = true
}) => {
  const [profile, setProfile] = useState<IdentityProfile | null>(null);
  const [authMethods, setAuthMethods] = useState<AuthenticationMethod[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [trustedDevices, setTrustedDevices] = useState<TrustedDevice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview', 'security']));
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [realTimeMode, setRealTimeMode] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<AuthenticationMethod | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Simulate real-time data updates
  useEffect(() => {
    if (!realTimeUpdates || !autoRefresh) return;

    const interval = setInterval(() => {
      loadIdentityData();
    }, 5000);
    return () => clearInterval(interval);
  }, [realTimeUpdates, autoRefresh]);

  // Initialize data
  useEffect(() => {
    loadIdentityData();
  }, []);

  const loadIdentityData = useCallback(async () => {
    try {
      // Simulate API calls
      const mockProfile: IdentityProfile = {
        id: '1',
        username: 'creator',
        displayName: 'Digital Creator',
        email: 'creator@sallie.studio',
        avatar: '/default-avatar.png',
        bio: 'Building the future of human-AI partnership',
        role: 'creator',
        status: 'active',
        trustLevel: 0.95,
        reputation: 4.8,
        joinedAt: '2024-01-01T00:00:00Z',
        lastActive: new Date().toISOString(),
        preferences: {
          theme: 'dark',
          language: 'en',
          notifications: true,
          privacy: {
            showOnlineStatus: true,
            showActivity: true,
            allowDataCollection: false,
            shareProfile: true
          }
        },
        security: {
          twoFactorEnabled: true,
          lastPasswordChange: '2024-12-01T00:00:00Z',
          loginAttempts: 0,
          activeSessions: 3,
          trustedDevices: 5
        },
        metrics: {
          totalInteractions: 15420,
          featuresUsed: 24,
          sessionCount: 342,
          averageSessionTime: 45.6,
          dataGenerated: 2.4,
          storageUsed: 856
        }
      };

      const mockAuthMethods: AuthenticationMethod[] = [
        {
          id: '1',
          type: 'password',
          name: 'Master Password',
          enabled: true,
          lastUsed: new Date(Date.now() - 3600000).toISOString(),
          strength: 'strong',
          icon: Key,
          description: 'Primary authentication method',
          setupRequired: false
        },
        {
          id: '2',
          type: 'biometric',
          name: 'Face ID',
          enabled: true,
          lastUsed: new Date(Date.now() - 86400000).toISOString(),
          strength: 'maximum',
          icon: Fingerprint,
          description: 'Biometric authentication using facial recognition',
          setupRequired: false
        },
        {
          id: '3',
          type: 'hardware',
          name: 'YubiKey 5',
          enabled: false,
          lastUsed: new Date(Date.now() - 604800000).toISOString(),
          strength: 'maximum',
          icon: Shield,
          description: 'Hardware security key for 2FA',
          setupRequired: true
        }
      ];

      const mockSecurityEvents: SecurityEvent[] = [
        {
          id: '1',
          type: 'login',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          location: 'New York, US',
          device: 'Chrome on Windows',
          ipAddress: '192.168.1.100',
          severity: 'low',
          status: 'success',
          details: 'Successful login via Face ID'
        },
        {
          id: '2',
          type: '2fa_enabled',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          location: 'New York, US',
          device: 'Chrome on Windows',
          ipAddress: '192.168.1.100',
          severity: 'medium',
          status: 'success',
          details: 'Two-factor authentication enabled'
        }
      ];

      const mockTrustedDevices: TrustedDevice[] = [
        {
          id: '1',
          name: 'Desktop PC',
          type: 'desktop',
          platform: 'Windows 11',
          lastUsed: new Date().toISOString(),
          trusted: true,
          currentSession: true,
          location: 'Home Network'
        },
        {
          id: '2',
          name: 'iPhone 14 Pro',
          type: 'mobile',
          platform: 'iOS 17',
          lastUsed: new Date(Date.now() - 3600000).toISOString(),
          trusted: true,
          currentSession: false,
          location: 'Mobile Network'
        }
      ];

      setProfile(mockProfile);
      setAuthMethods(mockAuthMethods);
      setSecurityEvents(mockSecurityEvents);
      setTrustedDevices(mockTrustedDevices);
      setError(null);
    } catch (error) {
      console.error('Failed to load identity data:', error);
      setError('Failed to load identity data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const getSecurityLevel = (score: number) => {
    for (const [level, config] of Object.entries(SECURITY_LEVELS)) {
      if (score >= config.min && score <= config.max) {
        return { level, ...config };
      }
    }
    return { level: 'weak', ...SECURITY_LEVELS.weak };
  };

  const getRoleInfo = (role: string) => {
    return IDENTITY_ROLES[role as keyof typeof IDENTITY_ROLES] || IDENTITY_ROLES.user;
  };

  const getAuthMethodInfo = (type: string) => {
    return AUTH_METHODS[type as keyof typeof AUTH_METHODS] || AUTH_METHODS.password;
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'desktop': return Monitor;
      case 'mobile': return PhoneIcon;
      case 'tablet': return Tablet;
      default: return Monitor;
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-900/20 border border-red-800 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-2 text-red-400">
          <AlertCircle className="w-5 h-5" />
          <span>Error: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 rounded-2xl border border-purple-800/50 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">Identity Dashboard</h2>
              <p className="text-purple-200">Identity Management & Security</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`p-2 rounded-lg transition-colors ${
                autoRefresh ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'
              }`}
              title="Toggle auto-refresh"
            >
              <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setRealTimeMode(!realTimeMode)}
              className={`p-2 rounded-lg transition-colors ${
                realTimeMode ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'
              }`}
              title="Toggle real-time mode"
            >
              <Activity className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Profile Overview */}
        {profile && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 rounded-xl border border-purple-700/50 p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-sm text-purple-300 font-medium">Trust Level</div>
                  <div className="text-2xl font-bold text-white">
                    {(profile.trustLevel * 100).toFixed(0)}%
                  </div>
                </div>
                <Shield className="h-8 w-8 text-purple-400" />
              </div>
              <div className="text-xs text-purple-400">
                {getRoleInfo(profile.role).label}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-900/50 to-green-800/50 rounded-xl border border-green-700/50 p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-sm text-green-300 font-medium">Reputation</div>
                  <div className="text-2xl font-bold text-white">{profile.reputation}</div>
                </div>
                <Star className="h-8 w-8 text-green-400" />
              </div>
              <div className="text-xs text-green-400">
                {profile.metrics.totalInteractions} interactions
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 rounded-xl border border-blue-700/50 p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-sm text-blue-300 font-medium">Active Sessions</div>
                  <div className="text-2xl font-bold text-white">{profile.security.activeSessions}</div>
                </div>
                <Activity className="h-8 w-8 text-blue-400" />
              </div>
              <div className="text-xs text-blue-400">
                {profile.security.trustedDevices} trusted devices
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-900/50 to-orange-800/50 rounded-xl border border-orange-700/50 p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-sm text-orange-300 font-medium">Storage Used</div>
                  <div className="text-2xl font-bold text-white">{profile.metrics.storageUsed}MB</div>
                </div>
                <Database className="h-8 w-8 text-orange-400" />
              </div>
              <div className="text-xs text-orange-400">
                {profile.metrics.dataGenerated}GB generated
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Profile Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
              <User className="w-5 h-5 text-purple-400" />
              <span>Profile Information</span>
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setEditingProfile(!editingProfile)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                editingProfile 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {editingProfile ? 'Cancel' : 'Edit'}
            </button>
            <button
              onClick={() => toggleSection('profile')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {expandedSections.has('profile') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {expandedSections.has('profile') && profile && (
          <div className="space-y-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <img
                  src={profile.avatar}
                  alt={profile.displayName}
                  className="w-24 h-24 rounded-full border-4 border-purple-500"
                />
                <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 rounded-full border-2 border-gray-800 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="text-2xl font-bold text-white">{profile.displayName}</h4>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleInfo(profile.role).color}20 text-white`}>
                    {getRoleInfo(profile.role).label}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    profile.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {profile.status}
                  </div>
                </div>
                <p className="text-gray-400 mb-2">@{profile.username}</p>
                <p className="text-gray-300">{profile.bio}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="text-sm font-medium text-gray-400 mb-3">Contact Information</h5>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-300">{profile.email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-300">Joined {new Date(profile.joinedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-300">Last active {new Date(profile.lastActive).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="text-sm font-medium text-gray-400 mb-3">Preferences</h5>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Theme</span>
                    <span className="text-gray-400">{profile.preferences.theme}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Language</span>
                    <span className="text-gray-400">{profile.preferences.language}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Notifications</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      profile.preferences.notifications ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {profile.preferences.notifications ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Authentication Methods */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
            <Key className="w-5 h-5 text-purple-400" />
            <span>Authentication Methods</span>
            <span className="text-sm text-gray-400">({authMethods.length})</span>
          </h3>
          <button
            onClick={() => toggleSection('auth')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {expandedSections.has('auth') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {expandedSections.has('auth') && (
          <div className="space-y-4">
            {authMethods.map((method) => {
              const methodInfo = getAuthMethodInfo(method.type);
              const Icon = method.icon;
              
              return (
                <motion.div
                  key={method.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-4 cursor-pointer hover:border-purple-500/50 transition-all"
                  onClick={() => setSelectedMethod(method)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${methodInfo.color}20`}>
                        <Icon className="w-5 h-5" style={{ color: methodInfo.color }} />
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{method.name}</h4>
                        <p className="text-sm text-gray-400">{method.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-bold ${methodInfo.color}`}>
                        {method.strength}
                      </div>
                      <div className="text-xs text-gray-400">
                        {method.enabled ? 'Enabled' : 'Disabled'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>Last used: {new Date(method.lastUsed).toLocaleDateString()}</span>
                    {method.setupRequired && (
                      <span className="text-orange-400">Setup required</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Security Events */}
      {showAdvancedMetrics && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
              <Shield className="w-5 h-5 text-purple-400" />
              <span>Security Events</span>
              <span className="text-sm text-gray-400">({securityEvents.length})</span>
            </h3>
            <button
              onClick={() => toggleSection('events')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {expandedSections.has('events') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>

          {expandedSections.has('events') && (
            <div className="space-y-3">
              {securityEvents.map((event) => (
                <div key={event.id} className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        event.severity === 'critical' ? 'bg-red-500' :
                        event.severity === 'high' ? 'bg-orange-500' :
                        event.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`} />
                      <span className="text-white font-medium">{event.type}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        event.status === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {event.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(event.timestamp).toLocaleString()}
                    </div>
                  </div>

                  <div className="text-sm text-gray-400 mb-1">{event.details}</div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{event.device}</span>
                    <span>{event.location}</span>
                    <span>{event.ipAddress}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Trusted Devices */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
            <Smartphone className="w-5 h-5 text-purple-400" />
            <span>Trusted Devices</span>
            <span className="text-sm text-gray-400">({trustedDevices.length})</span>
          </h3>
          <button
            onClick={() => toggleSection('devices')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {expandedSections.has('devices') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {expandedSections.has('devices') && (
          <div className="space-y-3">
            {trustedDevices.map((device) => {
              const DeviceIcon = getDeviceIcon(device.type);
              
              return (
                <div key={device.id} className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <DeviceIcon className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{device.name}</h4>
                        <p className="text-sm text-gray-400">{device.platform}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        {device.currentSession && (
                          <div className="w-2 h-2 bg-green-500 rounded-full" title="Current session" />
                        )}
                        <span className={`px-2 py-1 rounded text-xs ${
                          device.trusted ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {device.trusted ? 'Trusted' : 'Not trusted'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {device.location}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Last used: {new Date(device.lastUsed).toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
};