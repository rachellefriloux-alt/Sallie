/**
 * Life Sanctuary Screen - Mobile Version
 * Complete family and relationship management for mobile
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface LifeSanctuaryScreenProps {
  navigation: any;
}

export function LifeSanctuaryScreen({ navigation }: LifeSanctuaryScreenProps) {
  const [activeRole, setActiveRole] = useState('mom');
  const [refreshing, setRefreshing] = useState(false);
  const [familyData, setFamilyData] = useState({
    roles: [
      { id: 'mom', name: 'Mom', energy: 85, needs: 'Quality time, appreciation', status: 'thriving' },
      { id: 'spouse', name: 'Spouse', energy: 78, needs: 'Connection, support', status: 'connected' },
      { id: 'friend', name: 'Friend', energy: 92, needs: 'Social interaction, fun', status: 'vibrant' },
      { id: 'daughter', name: 'Daughter', energy: 88, needs: 'Guidance, love', status: 'growing' }
    ],
    rituals: [
      { id: 'morning', name: 'Morning Connection', frequency: 'Daily', active: true },
      { id: 'evening', name: 'Evening Gratitude', frequency: 'Daily', active: true },
      { id: 'weekly', name: 'Family Dinner', frequency: 'Weekly', active: true },
      { id: 'monthly', name: 'Family Adventure', frequency: 'Monthly', active: false }
    ],
    insights: [
      'Family energy levels are high - maintain current connection patterns',
      'Spouse relationship thriving - plan quality time together',
      'Friendship energy excellent - nurture these connections',
      'Daughter growing well - provide guidance and support'
    ]
  });

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const getRoleColor = (status: string) => {
    switch (status) {
      case 'thriving': return '#10b981';
      case 'connected': return '#3b82f6';
      case 'vibrant': return '#8b5cf6';
      case 'growing': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const currentRole = familyData.roles.find(role => role.id === activeRole) || familyData.roles[0];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🏠 Life Sanctuary</Text>
          <Text style={styles.subtitle}>Family & Relationship Management</Text>
        </View>

        {/* Role Selector */}
        <View style={styles.roleSelector}>
          {familyData.roles.map((role) => (
            <TouchableOpacity
              key={role.id}
              style={[
                styles.roleButton,
                activeRole === role.id && styles.activeRoleButton
              ]}
              onPress={() => setActiveRole(role.id)}
            >
              <Text style={[
                styles.roleButtonText,
                activeRole === role.id && styles.activeRoleButtonText
              ]}>
                {role.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Current Role Details */}
        <View style={styles.roleDetails}>
          <View style={styles.roleHeader}>
            <Text style={styles.roleName}>{currentRole.name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getRoleColor(currentRole.status) }]}>
              <Text style={styles.statusText}>{currentRole.status}</Text>
            </View>
          </View>

          {/* Energy Level */}
          <View style={styles.energyContainer}>
            <Text style={styles.energyLabel}>Energy Level</Text>
            <View style={styles.energyBar}>
              <View style={[styles.energyFill, { width: `${currentRole.energy}%` }]} />
            </View>
            <Text style={styles.energyValue}>{currentRole.energy}%</Text>
          </View>

          {/* Needs */}
          <View style={styles.needsContainer}>
            <Text style={styles.needsLabel}>Current Needs</Text>
            <Text style={styles.needsText}>{currentRole.needs}</Text>
          </View>
        </View>

        {/* Family Rituals */}
        <View style={styles.ritualsContainer}>
          <Text style={styles.sectionTitle}>Family Rituals</Text>
          {familyData.rituals.map((ritual) => (
            <View key={ritual.id} style={styles.ritualItem}>
              <View style={styles.ritualHeader}>
                <Text style={styles.ritualName}>{ritual.name}</Text>
                <View style={[
                  styles.ritualStatus,
                  { backgroundColor: ritual.active ? '#10b981' : '#6b7280' }
                ]}>
                  <Text style={styles.ritualStatusText}>
                    {ritual.active ? 'Active' : 'Inactive'}
                  </Text>
                </View>
              </View>
              <Text style={styles.ritualFrequency}>{ritual.frequency}</Text>
            </View>
          ))}
        </View>

        {/* Sallie's Insights */}
        <View style={styles.insightsContainer}>
          <Text style={styles.sectionTitle}>💜 Sallie's Insights</Text>
          {familyData.insights.map((insight, index) => (
            <View key={index} style={styles.insightItem}>
              <Text style={styles.insightText}>{insight}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Schedule Family Time</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Send Appreciation</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Plan Family Ritual</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>New Action</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1b4b',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  roleSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 8,
  },
  roleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#1e293b',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#312e81',
  },
  activeRoleButton: {
    backgroundColor: '#1e3a8a',
    borderColor: '#3b82f6',
  },
  roleButtonText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '500',
  },
  activeRoleButtonText: {
    color: '#f8fafc',
  },
  roleDetails: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#312e81',
  },
  roleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  roleName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f8fafc',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '500',
  },
  energyContainer: {
    marginBottom: 16,
  },
  energyLabel: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 8,
  },
  energyBar: {
    height: 8,
    backgroundColor: '#1e1b4b',
    borderRadius: 4,
    marginBottom: 4,
  },
  energyFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  energyValue: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
  },
  needsContainer: {
    marginBottom: 16,
  },
  needsLabel: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 4,
  },
  needsText: {
    fontSize: 14,
    color: '#f8fafc',
  },
  ritualsContainer: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#312e81',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 12,
  },
  ritualItem: {
    marginBottom: 12,
  },
  ritualHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  ritualName: {
    fontSize: 14,
    color: '#f8fafc',
    fontWeight: '500',
  },
  ritualStatus: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  ritualStatusText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '500',
  },
  ritualFrequency: {
    fontSize: 12,
    color: '#94a3b8',
  },
  insightsContainer: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#312e81',
  },
  insightItem: {
    marginBottom: 8,
    padding: 12,
    backgroundColor: '#1e1b4b',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#f472b6',
  },
  insightText: {
    fontSize: 13,
    color: '#f8fafc',
    lineHeight: 18,
  },
  actionsContainer: {
    marginBottom: 24,
  },
  actionButton: {
    backgroundColor: '#1e3a8a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '500',
  },
});
