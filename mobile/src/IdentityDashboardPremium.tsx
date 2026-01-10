import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Dimensions, FlatList, TextInput, Switch, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
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
} from 'lucide-react-native';
import { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, withSpring } from 'react-native-reanimated';

const { width: screenWidth } = Dimensions.get('window');

interface IdentityDashboardPremiumProps {
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

export const IdentityDashboardPremium: React.FC<IdentityDashboardPremiumProps> = ({ 
  className = '',
  compact = false,
  showAdvancedMetrics = true,
  realTimeUpdates = true
}) => {
  const [profile, setProfile] = useState<IdentityProfile | null>(null);
  const [authMethods, setAuthMethods] = useState<AuthenticationMethod[]>([]);
  const [trustedDevices, setTrustedDevices] = useState<TrustedDevice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview', 'security']));
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [realTimeMode, setRealTimeMode] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<AuthenticationMethod | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Animation values
  const pulseScale = useSharedValue(1);
  const rotationValue = useSharedValue(0);

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

  // Pulse animation
  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
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
      <View style={styles.loadingContainer}>
        <Animated.View
          style={[
            styles.loadingSpinner,
            { transform: [{ rotate: rotationValue }] }
          ]}
        />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorContent}>
          <AlertCircle size={20} color="#EF4444" />
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <BlurView intensity={20} tint="dark" style={styles.header}>
        <LinearGradient
          colors={['#8B5CF6', '#6366F1', '#4F46E5']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <LinearGradient
                colors={['#06B6D4', '#0891B2', '#0E7490']}
                style={styles.crownIcon}
              >
                <Text style={styles.crownText}>👤</Text>
              </LinearGradient>
              <View style={styles.headerText}>
                <Text style={styles.headerTitle}>Identity Dashboard</Text>
                <Text style={styles.headerSubtitle}>Identity Management & Security</Text>
              </View>
            </View>
            
            <View style={styles.headerRight}>
              <TouchableOpacity
                onPress={() => setAutoRefresh(!autoRefresh)}
                style={[
                  styles.iconButton,
                  autoRefresh && styles.iconButtonActive
                ]}
              >
                <RefreshCw 
                  size={16} 
                  color={autoRefresh ? "#FFFFFF" : "#9CA3AF"} 
                />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </BlurView>

      {/* Profile Overview */}
      {profile && (
        <BlurView intensity={20} tint="dark" style={styles.metricsCard}>
          <LinearGradient
            colors={['#1F2937', '#111827']}
            style={styles.metricsCardGradient}
          >
            <Text style={styles.metricsTitle}>Profile Overview</Text>
            
            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <Text style={styles.metricCardValue}>{(profile.trustLevel * 100).toFixed(0)}%</Text>
                <Text style={styles.metricCardLabel}>Trust Level</Text>
                <Text style={styles.metricCardSubtext}>{getRoleInfo(profile.role).label}</Text>
              </View>
              
              <View style={styles.metricCard}>
                <Text style={styles.metricCardValue}>{profile.reputation}</Text>
                <Text style={styles.metricCardLabel}>Reputation</Text>
                <Text style={styles.metricCardSubtext}>{profile.metrics.totalInteractions} interactions</Text>
              </View>
              
              <View style={styles.metricCard}>
                <Text style={styles.metricCardValue}>{profile.security.activeSessions}</Text>
                <Text style={styles.metricCardLabel}>Active Sessions</Text>
                <Text style={styles.metricCardSubtext}>{profile.security.trustedDevices} trusted devices</Text>
              </View>
              
              <View style={styles.metricCard}>
                <Text style={styles.metricCardValue}>{profile.metrics.storageUsed}MB</Text>
                <Text style={styles.metricCardLabel}>Storage Used</Text>
                <Text style={styles.metricCardSubtext}>{profile.metrics.dataGenerated}GB generated</Text>
              </View>
            </View>
          </LinearGradient>
        </BlurView>
      )}

      {/* Profile Information */}
      <BlurView intensity={20} tint="dark" style={styles.profileCard}>
        <LinearGradient
          colors={['#1F2937', '#111827']}
          style={styles.profileCardGradient}
        >
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection('profile')}
          >
            <View style={styles.sectionHeaderLeft}>
              <User size={20} color="#8B5CF6" />
              <Text style={styles.sectionTitle}>Profile Information</Text>
            </View>
            {expandedSections.has('profile') ? (
              <ChevronDown size={16} color="#9CA3AF" />
            ) : (
              <ChevronRight size={16} color="#9CA3AF" />
            )}
          </TouchableOpacity>

          {expandedSections.has('profile') && profile && (
            <View style={styles.profileContent}>
              <View style={styles.profileHeader}>
                <View style={styles.avatarContainer}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>👤</Text>
                  </View>
                  <View style={styles.onlineIndicator}>
                    <CheckCircle size={12} color="#FFFFFF" />
                  </View>
                </View>
                
                <View style={styles.profileInfo}>
                  <View style={styles.profileNameRow}>
                    <Text style={styles.displayName}>{profile.displayName}</Text>
                    <View style={[styles.roleBadge, { backgroundColor: getRoleInfo(profile.role).color + '20' }]}>
                      <Text style={[styles.roleText, { color: getRoleInfo(profile.role).color }]}>
                        {getRoleInfo(profile.role).label}
                      </Text>
                    </View>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: profile.status === 'active' ? '#10B98120' : '#6B728020' }
                    ]}>
                      <Text style={[
                        styles.statusText,
                        { color: profile.status === 'active' ? '#10B981' : '#6B7280' }
                      ]}>
                        {profile.status}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.username}>@{profile.username}</Text>
                  <Text style={styles.bio}>{profile.bio}</Text>
                </View>
              </View>

              <View style={styles.profileDetails}>
                <View style={styles.detailSection}>
                  <Text style={styles.detailTitle}>Contact Information</Text>
                  <View style={styles.detailItem}>
                    <Mail size={16} color="#6B7280" style={styles.detailIcon} />
                    <Text style={styles.detailText}>{profile.email}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Calendar size={16} color="#6B7280" style={styles.detailIcon} />
                    <Text style={styles.detailText}>Joined {new Date(profile.joinedAt).toLocaleDateString()}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Clock size={16} color="#6B7280" style={styles.detailIcon} />
                    <Text style={styles.detailText}>Last active {new Date(profile.lastActive).toLocaleString()}</Text>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailTitle}>Preferences</Text>
                  <View style={styles.preferenceItem}>
                    <Text style={styles.preferenceLabel}>Theme</Text>
                    <Text style={styles.preferenceValue}>{profile.preferences.theme}</Text>
                  </View>
                  <View style={styles.preferenceItem}>
                    <Text style={styles.preferenceLabel}>Language</Text>
                    <Text style={styles.preferenceValue}>{profile.preferences.language}</Text>
                  </View>
                  <View style={styles.preferenceItem}>
                    <Text style={styles.preferenceLabel}>Notifications</Text>
                    <Switch
                      value={profile.preferences.notifications}
                      onValueChange={() => {}}
                      style={styles.preferenceSwitch}
                    />
                  </View>
                </View>
              </View>
            </View>
          )}
        </LinearGradient>
      </BlurView>

      {/* Authentication Methods */}
      <BlurView intensity={20} tint="dark" style={styles.authCard}>
        <LinearGradient
          colors={['#1F2937', '#111827']}
          style={styles.authCardGradient}
        >
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection('auth')}
          >
            <View style={styles.sectionHeaderLeft}>
              <Key size={20} color="#8B5CF6" />
              <Text style={styles.sectionTitle}>Authentication Methods</Text>
              <Text style={styles.sectionCount}>({authMethods.length})</Text>
            </View>
            {expandedSections.has('auth') ? (
              <ChevronDown size={16} color="#9CA3AF" />
            ) : (
              <ChevronRight size={16} color="#9CA3AF" />
            )}
          </TouchableOpacity>

          {expandedSections.has('auth') && (
            <View style={styles.authContent}>
              {authMethods.map((method) => {
                const methodInfo = getAuthMethodInfo(method.type);
                const Icon = method.icon;
                
                return (
                  <TouchableOpacity
                    key={method.id}
                    style={styles.authMethodItem}
                    onPress={() => setSelectedMethod(method)}
                  >
                    <View style={styles.authMethodHeader}>
                      <View style={[styles.authMethodIcon, { backgroundColor: methodInfo.color + '20' }]}>
                        <Icon size={20} style={{ color: methodInfo.color }} />
                      </View>
                      <View style={styles.authMethodInfo}>
                        <Text style={styles.authMethodName}>{method.name}</Text>
                        <Text style={styles.authMethodDescription}>{method.description}</Text>
                      </View>
                      <View style={styles.authMethodStatus}>
                        <Text style={[styles.authMethodStrength, { color: methodInfo.color }]}>
                          {method.strength}
                        </Text>
                        <Text style={styles.authMethodEnabled}>
                          {method.enabled ? 'Enabled' : 'Disabled'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.authMethodFooter}>
                      <Text style={styles.authMethodLastUsed}>
                        Last used: {new Date(method.lastUsed).toLocaleDateString()}
                      </Text>
                      {method.setupRequired && (
                        <Text style={styles.authMethodSetupRequired}>Setup required</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </LinearGradient>
      </BlurView>

      {/* Trusted Devices */}
      <BlurView intensity={20} tint="dark" style={styles.devicesCard}>
        <LinearGradient
          colors={['#1F2937', '#111827']}
          style={styles.devicesCardGradient}
        >
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection('devices')}
          >
            <View style={styles.sectionHeaderLeft}>
              <Smartphone size={20} color="#8B5CF6" />
              <Text style={styles.sectionTitle}>Trusted Devices</Text>
              <Text style={styles.sectionCount}>({trustedDevices.length})</Text>
            </View>
            {expandedSections.has('devices') ? (
              <ChevronDown size={16} color="#9CA3AF" />
            ) : (
              <ChevronRight size={16} color="#9CA3AF" />
            )}
          </TouchableOpacity>

          {expandedSections.has('devices') && (
            <View style={styles.devicesContent}>
              {trustedDevices.map((device) => {
                const DeviceIcon = getDeviceIcon(device.type);
                
                return (
                  <TouchableOpacity
                    key={device.id}
                    style={styles.deviceItem}
                  >
                    <View style={styles.deviceHeader}>
                      <View style={styles.deviceIconContainer}>
                        <DeviceIcon size={20} color="#3B82F6" />
                      </View>
                      <View style={styles.deviceInfo}>
                        <Text style={styles.deviceName}>{device.name}</Text>
                        <Text style={styles.devicePlatform}>{device.platform}</Text>
                      </View>
                      <View style={styles.deviceStatus}>
                        {device.currentSession && (
                          <View style={styles.currentSessionIndicator} />
                        )}
                        <View style={[
                          styles.trustBadge,
                          { backgroundColor: device.trusted ? '#10B98120' : '#6B728020' }
                        ]}>
                          <Text style={[
                            styles.trustText,
                            { color: device.trusted ? '#10B981' : '#6B7280' }
                          ]}>
                            {device.trusted ? 'Trusted' : 'Not trusted'}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.deviceFooter}>
                      <Text style={styles.deviceLocation}>{device.location}</Text>
                      <Text style={styles.deviceLastUsed}>
                        Last used: {new Date(device.lastUsed).toLocaleString()}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </LinearGradient>
      </BlurView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingSpinner: {
    width: 48,
    height: 48,
    borderWidth: 4,
    borderColor: '#8B5CF6',
    borderTopColor: 'transparent',
    borderRadius: 24,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  errorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  header: {
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
  },
  headerGradient: {
    padding: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  crownIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  crownText: {
    fontSize: 24,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E5E7EB',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#374151',
  },
  iconButtonActive: {
    backgroundColor: '#8B5CF6',
  },
  metricsCard: {
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
  },
  metricsCardGradient: {
    padding: 20,
  },
  metricsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  metricCardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B5CF6',
    marginBottom: 4,
  },
  metricCardLabel: {
    fontSize: 10,
    color: '#A78BFA',
    textAlign: 'center',
  },
  metricCardSubtext: {
    fontSize: 8,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  profileCard: {
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
  },
  profileCardGradient: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  sectionCount: {
    fontSize: 14,
    color: '#9CA3AF',
    marginLeft: 8,
  },
  profileContent: {
    flex: 1,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 48,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  displayName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 8,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  roleText: {
    fontSize: 10,
    fontWeight: 'medium',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'medium',
  },
  username: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  bio: {
    fontSize: 14,
    color: '#D1D5DB',
  },
  profileDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailSection: {
    width: '48%',
  },
  detailTitle: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: 'medium',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailIcon: {
    marginRight: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#D1D5DB',
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  preferenceLabel: {
    fontSize: 14,
    color: '#D1D5DB',
  },
  preferenceValue: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  preferenceSwitch: {
    marginLeft: 8,
  },
  authCard: {
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
  },
  authCardGradient: {
    padding: 20,
  },
  authContent: {
    flex: 1,
  },
  authMethodItem: {
    backgroundColor: '#111827',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  authMethodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  authMethodIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  authMethodInfo: {
    flex: 1,
  },
  authMethodName: {
    fontSize: 14,
    fontWeight: 'medium',
    color: '#FFFFFF',
  },
  authMethodDescription: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  authMethodStatus: {
    alignItems: 'flex-end',
  },
  authMethodStrength: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  authMethodEnabled: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  authMethodFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authMethodLastUsed: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  authMethodSetupRequired: {
    fontSize: 12,
    color: '#F59E0B',
  },
  devicesCard: {
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
  },
  devicesCardGradient: {
    padding: 20,
  },
  devicesContent: {
    flex: 1,
  },
  deviceItem: {
    backgroundColor: '#111827',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  deviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  deviceIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#3B82F620',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 14,
    fontWeight: 'medium',
    color: '#FFFFFF',
  },
  devicePlatform: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  deviceStatus: {
    alignItems: 'flex-end',
  },
  currentSessionIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginBottom: 4,
  },
  trustBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  trustText: {
    fontSize: 10,
    fontWeight: 'medium',
  },
  deviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deviceLocation: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  deviceLastUsed: {
    fontSize: 10,
    color: '#9CA3AF',
  },
});
