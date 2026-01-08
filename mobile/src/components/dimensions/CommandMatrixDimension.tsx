/**
 * Command Matrix Dimension - Mobile Version
 * Complete command and control system with top-tier quality
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  Animated,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface Command {
  id: string;
  name: string;
  description: string;
  category: 'system' | 'user' | 'ai' | 'automation';
  status: 'active' | 'inactive' | 'pending' | 'error';
  priority: 'low' | 'medium' | 'high' | 'critical';
  executionTime?: number;
  lastRun?: string;
  schedule?: string;
  parameters?: Record<string, any>;
}

interface CommandMatrixDimensionProps {
  navigation: any;
}

const categories = [
  { id: 'system', name: 'System Commands', icon: '⚙️', color: '#3b82f6' },
  { id: 'user', name: 'User Commands', icon: '👤', color: '#10b981' },
  { id: 'ai', name: 'AI Commands', icon: '🤖', color: '#8b5cf6' },
  { id: 'automation', name: 'Automation', icon: '🔄', color: '#f59e0b' },
];

export function CommandMatrixDimension({ navigation }: CommandMatrixDimensionProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('system');
  const [showDetails, setShowDetails] = useState(false);
  const [animationValue] = useState(new Animated.Value(0));
  const [commands, setCommands] = useState<Command[]>([
    {
      id: 'system-restart',
      name: 'System Restart',
      description: 'Restart the Sallie Studio system',
      category: 'system',
      status: 'active',
      priority: 'medium',
      executionTime: 30000,
      lastRun: '2024-01-08T10:30:00Z',
      schedule: 'daily',
    },
    {
      id: 'user-backup',
      name: 'User Data Backup',
      description: 'Backup all user data and settings',
      category: 'user',
      status: 'active',
      priority: 'high',
      executionTime: 120000,
      lastRun: '2024-01-08T02:00:00Z',
      schedule: 'daily',
    },
    {
      id: 'ai-sync',
      name: 'AI Model Sync',
      description: 'Synchronize AI models with latest updates',
      category: 'ai',
      status: 'pending',
      priority: 'medium',
      executionTime: 60000,
      lastRun: '2024-01-07T18:00:00Z',
      schedule: 'weekly',
    },
    {
      id: 'auto-cleanup',
      name: 'Auto Cleanup',
      description: 'Automatically clean up temporary files',
      category: 'automation',
      status: 'active',
      priority: 'low',
      executionTime: 30000,
      lastRun: '2024-01-08T01:00:00Z',
      schedule: 'daily',
    },
    {
      id: 'system-scan',
      name: 'System Health Scan',
      description: 'Comprehensive system health check',
      category: 'system',
      status: 'active',
      priority: 'high',
      executionTime: 45000,
      lastRun: '2024-01-08T09:00:00Z',
      schedule: 'daily',
    },
    {
      id: 'user-export',
      name: 'Export User Data',
      description: 'Export user data in various formats',
      category: 'user',
      status: 'inactive',
      priority: 'medium',
      executionTime: 60000,
      lastRun: '2024-01-05T14:30:00Z',
    },
    {
      id: 'ai-optimize',
      name: 'AI Performance Optimize',
      description: 'Optimize AI performance parameters',
      category: 'ai',
      status: 'active',
      priority: 'medium',
      executionTime: 90000,
      lastRun: '2024-01-08T08:00:00Z',
      schedule: 'weekly',
    },
    {
      id: 'auto-update',
      name: 'Auto Update Check',
      description: 'Check for system updates automatically',
      category: 'automation',
      status: 'active',
      priority: 'medium',
      executionTime: 15000,
      lastRun: '2024-01-08T06:00:00Z',
      schedule: 'daily',
    },
  ]);

  // Calculate derived metrics
  const derivedMetrics = useMemo(() => {
    const activeCommands = commands.filter(c => c.status === 'active').length;
    const criticalCommands = commands.filter(c => c.priority === 'critical').length;
    const totalCommands = commands.length;
    const avgExecutionTime = commands.reduce((sum, c) => sum + (c.executionTime || 0), 0) / totalCommands;
    
    return {
      activeCommands,
      criticalCommands,
      totalCommands,
      avgExecutionTime: Math.round(avgExecutionTime / 1000), // Convert to seconds
      systemHealth: activeCommands > totalCommands * 0.7 ? 'excellent' : 
                     activeCommands > totalCommands * 0.5 ? 'good' : 'needs-attention',
    };
  }, [commands]);

  // Animation effects
  useEffect(() => {
    Animated.timing(animationValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 2000);
  }, []);

  // Handle category selection
  const handleCategorySelect = useCallback((categoryId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategory(categoryId);
  }, []);

  // Handle command execution
  const handleCommandExecute = useCallback((commandId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Execute Command',
      `Are you sure you want to execute this command?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Execute', 
          onPress: () => {
            setCommands(prev => prev.map(cmd => 
              cmd.id === commandId 
                ? { ...cmd, status: 'pending' as const, lastRun: new Date().toISOString() }
                : cmd
            ));
            setTimeout(() => {
              setCommands(prev => prev.map(cmd => 
                cmd.id === commandId 
                  ? { ...cmd, status: 'active' as const }
                  : cmd
              ));
            }, 3000);
          }
        },
      ]
    );
  }, []);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'inactive': return '#6b7280';
      case 'pending': return '#f59e0b';
      case 'error': return '#ef4444';
      default: return '#6b7280';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  // Filter commands by category
  const filteredCommands = useMemo(() => {
    return commands.filter(cmd => cmd.category === selectedCategory);
  }, [commands, selectedCategory]);

  // Selected category data
  const selectedCategoryData = useMemo(() => {
    return categories.find(c => c.id === selectedCategory);
  }, [selectedCategory]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#3b82f6', '#1d4ed8']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.title}>Command Matrix</Text>
          <Text style={styles.subtitle}>System Control & Automation</Text>
        </View>
      </LinearGradient>

      {/* Metrics Overview */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Key Metrics */}
        <Animated.View
          style={[
            styles.metricsContainer,
            {
              opacity: animationValue,
              transform: [{ translateY: animationValue.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }) }],
            },
          ]}
        >
          <View style={styles.metricsRow}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{derivedMetrics.activeCommands}</Text>
              <Text style={styles.metricLabel}>Active</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{derivedMetrics.criticalCommands}</Text>
              <Text style={styles.metricLabel}>Critical</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{derivedMetrics.avgExecutionTime}s</Text>
              <Text style={styles.metricLabel}>Avg Time</Text>
            </View>
          </View>

          {/* System Health */}
          <View style={styles.healthContainer}>
            <Text style={styles.healthLabel}>System Health</Text>
            <View style={[
              styles.healthBadge,
              { backgroundColor: derivedMetrics.systemHealth === 'excellent' ? '#10b981' :
                               derivedMetrics.systemHealth === 'good' ? '#3b82f6' : '#f59e0b' }
            ]}>
              <Text style={styles.healthText}>
                {derivedMetrics.systemHealth === 'excellent' ? 'Excellent' :
                 derivedMetrics.systemHealth === 'good' ? 'Good' : 'Needs Attention'}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Category Tabs */}
        <View style={styles.categoryTabsContainer}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryTab,
                selectedCategory === category.id && styles.categoryTabActive
              ]}
              onPress={() => handleCategorySelect(category.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={[
                styles.categoryName,
                selectedCategory === category.id && styles.categoryNameActive
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Commands List */}
        <View style={styles.commandsContainer}>
          <Text style={styles.sectionTitle}>
            {selectedCategoryData?.name} Commands
          </Text>
          
          {filteredCommands.map((command) => (
            <View key={command.id} style={styles.commandCard}>
              <View style={styles.commandHeader}>
                <View style={styles.commandInfo}>
                  <Text style={styles.commandName}>{command.name}</Text>
                  <Text style={styles.commandDescription}>{command.description}</Text>
                </View>
                <View style={styles.commandStatus}>
                  <View style={[
                    styles.statusDot,
                    { backgroundColor: getStatusColor(command.status) }
                  ]} />
                  <Text style={[
                    styles.statusText,
                    { color: getStatusColor(command.status) }
                  ]}>
                    {command.status}
                  </Text>
                </View>
              </View>

              <View style={styles.commandDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Priority</Text>
                  <View style={[
                    styles.priorityBadge,
                    { backgroundColor: getPriorityColor(command.priority) }
                  ]}>
                    <Text style={styles.priorityText}>{command.priority}</Text>
                  </View>
                </View>
                
                {command.executionTime && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Execution Time</Text>
                    <Text style={styles.detailValue}>
                      {Math.round(command.executionTime / 1000)}s
                    </Text>
                  </View>
                )}
                
                {command.lastRun && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Last Run</Text>
                    <Text style={styles.detailValue}>
                      {new Date(command.lastRun).toLocaleDateString()}
                    </Text>
                  </View>
                )}
                
                {command.schedule && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Schedule</Text>
                    <Text style={styles.detailValue}>{command.schedule}</Text>
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={[
                  styles.executeButton,
                  { backgroundColor: command.status === 'active' ? '#10b981' : '#6b7280' }
                ]}
                onPress={() => handleCommandExecute(command.id)}
                disabled={command.status !== 'active'}
                activeOpacity={0.8}
              >
                <Text style={styles.executeButtonText}>Execute</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>🔄</Text>
              <Text style={styles.actionLabel}>Run All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>⏸️</Text>
              <Text style={styles.actionLabel}>Pause All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>📊</Text>
              <Text style={styles.actionLabel}>View Logs</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>⚙️</Text>
              <Text style={styles.actionLabel}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#e0e7ff',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  metricsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricCard: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  healthContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  healthLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  healthBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  healthText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  categoryTabsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  categoryTab: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryTabActive: {
    backgroundColor: '#3b82f6',
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  categoryNameActive: {
    color: '#ffffff',
  },
  commandsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  commandCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  commandHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  commandInfo: {
    flex: 1,
  },
  commandName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  commandDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  commandStatus: {
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  commandDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  executeButton: {
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  executeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  actionsContainer: {
    marginBottom: 20,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    color: '#4b5563',
    textAlign: 'center',
  },
});
