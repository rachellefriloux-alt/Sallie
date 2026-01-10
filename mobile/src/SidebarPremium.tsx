import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';

interface SidebarItem {
  id: string;
  title: string;
  icon: string;
  badge?: number;
  premium?: boolean;
  disabled?: boolean;
}

interface PremiumFeatures {
  enhancedNavigation: boolean;
  quickActions: boolean;
  smartShortcuts: boolean;
  personalizedLayout: boolean;
  gestureControls: boolean;
}

const { width, height } = Dimensions.get('window');

const SidebarPremium: React.FC<{
  isVisible: boolean;
  onClose: () => void;
  onNavigate: (screen: string) => void;
  currentScreen?: string;
}> = ({ isVisible, onClose, onNavigate, currentScreen = 'Dashboard' }) => {
  const [selectedItem, setSelectedItem] = useState(currentScreen);
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  
  const [premiumFeatures, setPremiumFeatures] = useState<PremiumFeatures>({
    enhancedNavigation: true,
    quickActions: true,
    smartShortcuts: true,
    personalizedLayout: true,
    gestureControls: true
  });

  // Animation values
  const slideAnim = useRef(new Animated.Value(-width)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  
  // Reanimated values
  const expandedHeight = useSharedValue(60);

  const sidebarItems: SidebarItem[] = [
    { id: 'Dashboard', title: 'Dashboard', icon: 'grid', premium: true },
    { id: 'Convergence', title: 'Convergence', icon: 'pulse', premium: true, badge: 3 },
    { id: 'Agency', title: 'Agency', icon: 'shield-checkmark', premium: true },
    { id: 'Identity', title: 'Identity', icon: 'person', premium: true },
    { id: 'Learning', title: 'Learning', icon: 'school', premium: true },
    { id: 'DreamState', title: 'Dream State', icon: 'moon', premium: true },
    { id: 'LimbicScreen', title: 'Limbic Screen', icon: 'analytics', premium: true },
    { id: 'VoiceInterface', title: 'Voice Interface', icon: 'mic', premium: true },
    { id: 'ChatArea', title: 'Chat Area', icon: 'chatbubble', premium: true },
    { id: 'Projects', title: 'Projects', icon: 'folder', disabled: true },
    { id: 'Heritage', title: 'Heritage', icon: 'library', disabled: true },
    { id: 'Settings', title: 'Settings', icon: 'settings', disabled: true },
  ];

  const quickActions = [
    { id: 'new-session', title: 'New Session', icon: 'add-circle', color: '#10b981' },
    { id: 'voice-toggle', title: 'Toggle Voice', icon: 'mic', color: '#f59e0b' },
    { id: 'sync-data', title: 'Sync Data', icon: 'sync', color: '#3b82f6' },
    { id: 'export', title: 'Export', icon: 'download', color: '#ec4899' },
  ];

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -width,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible]);

  const handleItemPress = (item: SidebarItem) => {
    if (item.disabled) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedItem(item.id);
    onNavigate(item.id);
    
    // Auto-close sidebar on mobile after selection
    if (width < 768) {
      setTimeout(onClose, 300);
    }
  };

  const handleQuickAction = (action: typeof quickActions[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    switch (action.id) {
      case 'new-session':
        console.log('Starting new session');
        break;
      case 'voice-toggle':
        console.log('Toggling voice interface');
        break;
      case 'sync-data':
        console.log('Syncing data');
        break;
      case 'export':
        console.log('Exporting data');
        break;
    }
  };

  const toggleExpanded = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsExpanded(!isExpanded);
    expandedHeight.value = withSpring(isExpanded ? 60 : 200);
  };

  const toggleSearch = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowSearch(!showSearch);
    if (!showSearch) {
      // Focus search input
    }
  };

  const filteredItems = sidebarItems.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Animated styles
  const expandedStyle = useAnimatedStyle(() => ({
    height: expandedHeight.value,
  }));

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      <TouchableOpacity 
        style={styles.backdrop} 
        activeOpacity={1} 
        onPress={onClose}
      />
      
      <Animated.View 
        style={[
          styles.sidebar, 
          { transform: [{ translateX: slideAnim }, { scale: scaleAnim }] }
        ]}
      >
        <LinearGradient
          colors={['#1e1b4b', '#581c87', '#1e1b4b']}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        <BlurView intensity={20} style={styles.sidebarBlur}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Ionicons name="sparkles" size={24} color="#fbbf24" />
              <Text style={styles.headerTitle}>Sallie Studio</Text>
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumBadgeText}>PRO</Text>
              </View>
            </View>
            
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={toggleSearch} style={styles.headerButton}>
                <Ionicons name="search" size={20} color="#e9d5ff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={styles.headerButton}>
                <Ionicons name="close" size={20} color="#e9d5ff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Bar */}
          {showSearch && (
            <Animated.View style={styles.searchContainer}>
              <View style={styles.searchInput}>
                <Ionicons name="search" size={16} color="#a78bfa" />
                <Text style={styles.searchPlaceholder}>Search navigation...</Text>
              </View>
            </Animated.View>
          )}

          {/* Quick Actions */}
          <Animated.View style={[styles.quickActionsContainer, expandedStyle]}>
            <TouchableOpacity onPress={toggleExpanded} style={styles.expandButton}>
              <Text style={styles.expandTitle}>Quick Actions</Text>
              <Ionicons 
                name={isExpanded ? "chevron-up" : "chevron-down"} 
                size={16} 
                color="#e9d5ff" 
              />
            </TouchableOpacity>
            
            {isExpanded && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickActionsScroll}>
                {quickActions.map(action => (
                  <TouchableOpacity
                    key={action.id}
                    onPress={() => handleQuickAction(action)}
                    style={styles.quickActionButton}
                  >
                    <View style={[styles.quickActionIcon, { backgroundColor: action.color }]}>
                      <Ionicons name={action.icon as any} size={16} color="white" />
                    </View>
                    <Text style={styles.quickActionText}>{action.title}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </Animated.View>

          {/* Navigation Items */}
          <ScrollView style={styles.navigationContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Premium Features</Text>
              {filteredItems.filter(item => item.premium).map(item => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => handleItemPress(item)}
                  style={[
                    styles.navItem,
                    selectedItem === item.id && styles.selectedNavItem,
                    item.disabled && styles.disabledNavItem
                  ]}
                >
                  <View style={styles.navItemContent}>
                    <View style={styles.navItemIcon}>
                      <Ionicons 
                        name={item.icon as any} 
                        size={20} 
                        color={item.disabled ? '#6b7280' : selectedItem === item.id ? '#fbbf24' : '#e9d5ff'} 
                      />
                      {item.badge && (
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>{item.badge}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[
                      styles.navItemText,
                      selectedItem === item.id && styles.selectedNavItemText,
                      item.disabled && styles.disabledNavItemText
                    ]}>
                      {item.title}
                    </Text>
                  </View>
                  
                  {item.premium && (
                    <View style={styles.premiumIndicator}>
                      <Ionicons name="star" size={12} color="#fbbf24" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Standard Features</Text>
              {filteredItems.filter(item => !item.premium).map(item => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => handleItemPress(item)}
                  style={[
                    styles.navItem,
                    selectedItem === item.id && styles.selectedNavItem,
                    item.disabled && styles.disabledNavItem
                  ]}
                >
                  <View style={styles.navItemContent}>
                    <View style={styles.navItemIcon}>
                      <Ionicons 
                        name={item.icon as any} 
                        size={20} 
                        color={item.disabled ? '#6b7280' : selectedItem === item.id ? '#fbbf24' : '#e9d5ff'} 
                      />
                    </View>
                    <Text style={[
                      styles.navItemText,
                      selectedItem === item.id && styles.selectedNavItemText,
                      item.disabled && styles.disabledNavItemText
                    ]}>
                      {item.title}
                    </Text>
                  </View>
                  
                  {item.disabled && (
                    <View style={styles.comingSoonBadge}>
                      <Text style={styles.comingSoonText}>Coming Soon</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.footerContent}>
              <View style={styles.connectionStatus}>
                <View style={styles.statusIndicator} />
                <Text style={styles.statusText}>Connected</Text>
              </View>
              
              <View style={styles.footerActions}>
                <TouchableOpacity style={styles.footerButton}>
                  <Ionicons name="settings" size={16} color="#a78bfa" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.footerButton}>
                  <Ionicons name="help-circle" size={16} color="#a78bfa" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </BlurView>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: width * 0.85,
    maxWidth: 320,
    overflow: 'hidden',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sidebarBlur: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(147, 51, 234, 0.2)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 12,
    flex: 1,
  },
  premiumBadge: {
    backgroundColor: '#fbbf24',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  premiumBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1e1b4b',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(147, 51, 234, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(147, 51, 234, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchPlaceholder: {
    fontSize: 14,
    color: '#a78bfa',
    marginLeft: 8,
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
    overflow: 'hidden',
  },
  expandButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  expandTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  quickActionsScroll: {
    marginTop: 12,
  },
  quickActionButton: {
    alignItems: 'center',
    marginRight: 16,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: '#e9d5ff',
    textAlign: 'center',
  },
  navigationContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#a78bfa',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  selectedNavItem: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
  },
  disabledNavItem: {
    opacity: 0.5,
  },
  navItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  navItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(147, 51, 234, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  navItemText: {
    fontSize: 16,
    color: '#e9d5ff',
    fontWeight: '500',
  },
  selectedNavItemText: {
    color: '#fbbf24',
    fontWeight: '600',
  },
  disabledNavItemText: {
    color: '#6b7280',
  },
  premiumIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  comingSoonBadge: {
    backgroundColor: 'rgba(107, 114, 128, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  comingSoonText: {
    fontSize: 10,
    color: '#9ca3af',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(147, 51, 234, 0.2)',
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#10b981',
  },
  footerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  footerButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(147, 51, 234, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SidebarPremium;
