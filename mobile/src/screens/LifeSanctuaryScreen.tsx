/**
 * Enhanced Life Sanctuary Screen - Mobile Version
 * Complete family and relationship management with top-tier quality
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface FamilyRole {
  id: string;
  name: string;
  relationship: string;
  energy: number;
  needs: string;
  status: 'thriving' | 'connected' | 'vibrant' | 'growing' | 'struggling' | 'distant';
  lastInteraction: string;
  upcomingEvents: Array<{
    id: string;
    title: string;
    date: string;
    type: 'birthday' | 'anniversary' | 'celebration' | 'appointment';
  }>;
  communicationStyle: {
    preferred: 'text' | 'call' | 'in-person' | 'video';
    frequency: 'daily' | 'weekly' | 'monthly' | 'occasionally';
  };
}

interface RelationshipMetrics {
  overallHealth: number;
  communication: number;
  trust: number;
  support: number;
  growth: number;
  balance: number;
}

interface LifeSanctuaryScreenProps {
  navigation: any;
}

export function LifeSanctuaryScreen({ navigation }: LifeSanctuaryScreenProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRole, setSelectedRole] = useState('mom');
  const [showDetails, setShowDetails] = useState(false);
  const [animationValue] = useState(new Animated.Value(0));
  const [familyData, setFamilyData] = useState({
    roles: [
      {
        id: 'mom',
        name: 'Mom',
        relationship: 'Mother',
        energy: 85,
        needs: 'Quality time, appreciation, support',
        status: 'thriving' as const,
        lastInteraction: '2 hours ago',
        upcomingEvents: [
          { id: '1', title: 'Birthday', date: '2024-02-15', type: 'birthday' as const },
          { id: '2', title: 'Monthly Dinner', date: '2024-01-20', type: 'celebration' as const },
        ],
        communicationStyle: {
          preferred: 'call' as const,
          frequency: 'weekly' as const,
        },
      },
      {
        id: 'spouse',
        name: 'Spouse',
        relationship: 'Partner',
        energy: 78,
        needs: 'Connection, support, intimacy',
        status: 'connected' as const,
        lastInteraction: '1 hour ago',
        upcomingEvents: [
          { id: '3', title: 'Anniversary', date: '2024-03-10', type: 'anniversary' as const },
          { id: '4', title: 'Date Night', date: '2024-01-18', type: 'celebration' as const },
        ],
        communicationStyle: {
          preferred: 'in-person' as const,
          frequency: 'daily' as const,
        },
      },
      {
        id: 'friend',
        name: 'Best Friend',
        relationship: 'Friend',
        energy: 92,
        needs: 'Social interaction, fun, support',
        status: 'vibrant' as const,
        lastInteraction: '3 days ago',
        upcomingEvents: [
          { id: '5', title: 'Coffee Meetup', date: '2024-01-17', type: 'celebration' as const },
        ],
        communicationStyle: {
          preferred: 'text' as const,
          frequency: 'weekly' as const,
        },
      },
      {
        id: 'daughter',
        name: 'Daughter',
        relationship: 'Child',
        energy: 88,
        needs: 'Guidance, love, encouragement',
        status: 'growing' as const,
        lastInteraction: '5 hours ago',
        upcomingEvents: [
          { id: '6', title: 'School Play', date: '2024-01-22', type: 'celebration' as const },
        ],
        communicationStyle: {
          preferred: 'in-person' as const,
          frequency: 'daily' as const,
        },
      },
    ],
    metrics: {
      overallHealth: 85,
      communication: 78,
      trust: 92,
      support: 80,
      growth: 88,
      balance: 75,
    },
  });

  // Calculate derived metrics
  const derivedMetrics = useMemo(() => {
    const roles = familyData.roles;
    const avgEnergy = roles.reduce((sum, role) => sum + role.energy, 0) / roles.length;
    const thrivingCount = roles.filter(role => role.status === 'thriving').length;
    const totalEvents = roles.reduce((sum, role) => sum + role.upcomingEvents.length, 0);
    
    return {
      avgEnergy: Math.round(avgEnergy),
      thrivingCount,
      totalEvents,
      relationshipBalance: Math.round((thrivingCount / roles.length) * 100),
      connectionStrength: Math.round((roles.filter(r => r.lastInteraction.includes('hour')).length / roles.length) * 100),
    };
  }, [familyData]);

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
    // Simulate data refresh
    setTimeout(() => {
      setRefreshing(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 2000);
  }, []);

  // Handle role selection
  const handleRoleSelect = useCallback((roleId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedRole(roleId);
    setShowDetails(true);
  }, []);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'thriving': return '#10b981';
      case 'connected': return '#3b82f6';
      case 'vibrant': return '#8b5cf6';
      case 'growing': return '#f59e0b';
      case 'struggling': return '#f97316';
      case 'distant': return '#ef4444';
      default: return '#6b7280';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'thriving': return '🌟';
      case 'connected': return '💫';
      case 'vibrant': return '✨';
      case 'growing': return '🌱';
      case 'struggling': return '🌧';
      case 'distant': return '❄️';
      default: return '⚪';
    }
  };

  // Selected role data
  const selectedRoleData = useMemo(() => {
    return familyData.roles.find(role => role.id === selectedRole);
  }, [selectedRole, familyData.roles]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#8b5cf6', '#6366f1']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.title}>Life Sanctuary</Text>
          <Text style={styles.subtitle}>Family & Relationship Management</Text>
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
              <Text style={styles.metricValue}>{derivedMetrics.avgEnergy}%</Text>
              <Text style={styles.metricLabel}>Avg Energy</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{derivedMetrics.thrivingCount}</Text>
              <Text style={styles.metricLabel}>Thriving</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{derivedMetrics.totalEvents}</Text>
              <Text style={styles.metricLabel}>Events</Text>
            </View>
          </View>

          {/* Overall Health Bar */}
          <View style={styles.healthBarContainer}>
            <Text style={styles.healthBarLabel}>Overall Family Health</Text>
            <View style={styles.healthBarBackground}>
              <Animated.View
                style={[
                  styles.healthBarFill,
                  {
                    width: animationValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, `${familyData.metrics.overallHealth}%`],
                    }),
                  },
                ]}
              />
            </View>
            <Text style={styles.healthBarValue}>{familyData.metrics.overallHealth}%</Text>
          </View>
        </Animated.View>

        {/* Family Roles */}
        <View style={styles.rolesContainer}>
          <Text style={styles.sectionTitle}>Family Members</Text>
          {familyData.roles.map((role, index) => (
            <Animated.View
              key={role.id}
              style={[
                styles.roleCard,
                {
                  opacity: animationValue,
                  transform: [{ translateX: animationValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }) }],
                },
              ]}
            >
              <TouchableOpacity
                style={styles.roleContent}
                onPress={() => handleRoleSelect(role.id)}
                activeOpacity={0.8}
              >
                <View style={styles.roleHeader}>
                  <View style={styles.roleInfo}>
                    <Text style={styles.roleName}>{role.name}</Text>
                    <Text style={styles.roleRelationship}>{role.relationship}</Text>
                  </View>
                  <View style={styles.roleStatus}>
                    <Text style={styles.statusIcon}>{getStatusIcon(role.status)}</Text>
                    <Text style={[styles.statusText, { color: getStatusColor(role.status) }]}>
                      {role.status.charAt(0).toUpperCase() + role.status.slice(1)}
                    </Text>
                  </View>
                </View>

                <View style={styles.roleMetrics}>
                  <View style={styles.energyBar}>
                    <Text style={styles.energyLabel}>Energy</Text>
                    <View style={styles.energyBarBackground}>
                      <View
                        style={[
                          styles.energyBarFill,
                          { width: `${role.energy}%`, backgroundColor: getStatusColor(role.status) },
                        ]}
                      />
                    </View>
                    <Text style={styles.energyValue}>{role.energy}%</Text>
                  </View>
                  <Text style={styles.needsText} numberOfLines={2}>
                    Needs: {role.needs}
                  </Text>
                  <Text style={styles.lastInteraction}>
                    Last interaction: {role.lastInteraction}
                  </Text>
                </View>

                {role.upcomingEvents.length > 0 && (
                  <View style={styles.eventsContainer}>
                    <Text style={styles.eventsTitle}>Upcoming Events</Text>
                    {role.upcomingEvents.slice(0, 2).map((event) => (
                      <View key={event.id} style={styles.eventItem}>
                        <Text style={styles.eventTitle}>{event.title}</Text>
                        <Text style={styles.eventDate}>{event.date}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        {/* Relationship Metrics */}
        <View style={styles.metricsContainer}>
          <Text style={styles.sectionTitle}>Relationship Metrics</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={styles.metricItemValue}>{familyData.metrics.communication}%</Text>
              <Text style={styles.metricItemLabel}>Communication</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricItemValue}>{familyData.metrics.trust}%</Text>
              <Text style={styles.metricItemLabel}>Trust</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricItemValue}>{familyData.metrics.support}%</Text>
              <Text style={styles.metricItemLabel}>Support</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricItemValue}>{familyData.metrics.growth}%</Text>
              <Text style={styles.metricItemLabel}>Growth</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>📞</Text>
              <Text style={styles.actionLabel}>Call Mom</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>💬</Text>
              <Text style={styles.actionLabel}>Message Spouse</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>📅</Text>
              <Text style={styles.actionLabel}>Schedule Event</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>📊</Text>
              <Text style={styles.actionLabel}>View Insights</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Role Details Modal */}
      {showDetails && selectedRoleData && (
        <BlurView intensity={100} style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                opacity: animationValue,
                transform: [{ scale: animationValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }) }],
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedRoleData.name}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowDetails(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.detailSection}>
                <Text style={styles.detailTitle}>Relationship</Text>
                <Text style={styles.detailValue}>{selectedRoleData.relationship}</Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailTitle}>Current Status</Text>
                <View style={styles.statusRow}>
                  <Text style={styles.statusIcon}>{getStatusIcon(selectedRoleData.status)}</Text>
                  <Text style={[styles.statusText, { color: getStatusColor(selectedRoleData.status) }]}>
                    {selectedRoleData.status.charAt(0).toUpperCase() + selectedRoleData.status.slice(1)}
                  </Text>
                </View>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailTitle}>Energy Level</Text>
                <View style={styles.energyBar}>
                  <View style={styles.energyBarBackground}>
                    <View
                      style={[
                        styles.energyBarFill,
                        { width: `${selectedRoleData.energy}%`, backgroundColor: getStatusColor(selectedRoleData.status) },
                      ]}
                    />
                  </View>
                  <Text style={styles.energyValue}>{selectedRoleData.energy}%</Text>
                </View>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailTitle}>Needs</Text>
                <Text style={styles.detailValue}>{selectedRoleData.needs}</Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailTitle}>Communication Style</Text>
                <Text style={styles.detailValue}>
                  Preferred: {selectedRoleData.communicationStyle.preferred}
                </Text>
                <Text style={styles.detailValue}>
                  Frequency: {selectedRoleData.communicationStyle.frequency}
                </Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailTitle}>Upcoming Events</Text>
                {selectedRoleData.upcomingEvents.map((event) => (
                  <View key={event.id} style={styles.eventDetail}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventDate}>{event.date}</Text>
                    <Text style={styles.eventType}>{event.type}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalButton}>
                <Text style={styles.modalButtonText}>Send Message</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton}>
                <Text style={styles.modalButtonText}>Schedule Event</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </BlurView>
      )}
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
  healthBarContainer: {
    marginTop: 10,
  },
  healthBarLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  healthBarBackground: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 4,
  },
  healthBarFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  healthBarValue: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'right',
  },
  rolesContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  roleCard: {
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
  roleContent: {
    flex: 1,
  },
  roleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  roleInfo: {
    flex: 1,
  },
  roleName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  roleRelationship: {
    fontSize: 14,
    color: '#6b7280',
  },
  roleStatus: {
    alignItems: 'flex-end',
  },
  statusIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  roleMetrics: {
    marginBottom: 12,
  },
  energyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  energyLabel: {
    fontSize: 12,
    color: '#6b7280',
    width: 60,
  },
  energyBarBackground: {
    flex: 1,
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    marginHorizontal: 8,
  },
  energyBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  energyValue: {
    fontSize: 12,
    color: '#6b7280',
    width: 40,
    textAlign: 'right',
  },
  needsText: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 8,
    lineHeight: 20,
  },
  lastInteraction: {
    fontSize: 12,
    color: '#9ca3af',
  },
  eventsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  eventsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  eventItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventTitle: {
    fontSize: 12,
    color: '#4b5563',
    flex: 1,
  },
  eventDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricItem: {
    width: '48%',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  metricItemValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  metricItemLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
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
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    margin: 20,
    maxHeight: height * 0.8,
    width: width * 0.9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#6b7280',
  },
  modalBody: {
    flex: 1,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  detailValue: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  eventDetail: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  eventType: {
    fontSize: 12,
    color: '#8b5cf6',
    marginTop: 4,
  },
});
