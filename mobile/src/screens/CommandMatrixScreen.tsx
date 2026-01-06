/**
 * Command Matrix Screen - Mobile Version
 * Complete business intelligence and automation for mobile
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface CommandMatrixScreenProps {
  navigation: any;
}

export function CommandMatrixScreen({ navigation }: CommandMatrixScreenProps) {
  const [activeBusiness, setActiveBusiness] = useState('main');
  const [refreshing, setRefreshing] = useState(false);
  const [businessData, setBusinessData] = useState({
    businesses: [
      { id: 'main', name: 'Main Business', revenue: 125000, growth: 15, status: 'scaling' },
      { id: 'side1', name: 'Side Project 1', revenue: 25000, growth: 25, status: 'growing' },
      { id: 'side2', name: 'Side Project 2', revenue: 15000, growth: 8, status: 'stable' }
    ],
    kpis: {
      totalRevenue: 165000,
      monthlyGrowth: 12.5,
      activeProjects: 8,
      automationLevel: 78
    },
    automation: [
      { name: 'Client Management', active: true, efficiency: 92 },
      { name: 'Financial Processing', active: true, efficiency: 88 },
      { name: 'Marketing Automation', active: true, efficiency: 85 },
      { name: 'Content Creation', active: false, efficiency: 75 }
    ]
  });

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scaling': return '#10b981';
      case 'growing': return '#3b82f6';
      case 'stable': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const currentBusiness = businessData.businesses.find(b => b.id === activeBusiness) || businessData.businesses[0];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>💼 Command Matrix</Text>
          <Text style={styles.subtitle}>Business Intelligence & Automation</Text>
        </View>

        {/* Business Selector */}
        <View style={styles.businessSelector}>
          {businessData.businesses.map((business) => (
            <TouchableOpacity
              key={business.id}
              style={[
                styles.businessButton,
                activeBusiness === business.id && styles.activeBusinessButton
              ]}
              onPress={() => setActiveBusiness(business.id)}
            >
              <Text style={[
                styles.businessButtonText,
                activeBusiness === business.id && styles.activeBusinessButtonText
              ]}>
                {business.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Current Business Details */}
        <View style={styles.businessDetails}>
          <View style={styles.businessHeader}>
            <Text style={styles.businessName}>{currentBusiness.name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(currentBusiness.status) }]}>
              <Text style={styles.statusText}>{currentBusiness.status}</Text>
            </View>
          </View>

          {/* Revenue */}
          <View style={styles.revenueContainer}>
            <Text style={styles.revenueLabel}>Monthly Revenue</Text>
            <Text style={styles.revenueValue}>${currentBusiness.revenue.toLocaleString()}</Text>
            <View style={styles.growthContainer}>
              <Text style={styles.growthLabel}>Growth</Text>
              <Text style={styles.growthValue}>+{currentBusiness.growth}%</Text>
            </View>
          </View>
        </View>

        {/* KPI Dashboard */}
        <View style={styles.kpiContainer}>
          <Text style={styles.sectionTitle}>📊 Key Performance Indicators</Text>
          <View style={styles.kpiGrid}>
            <View style={styles.kpiItem}>
              <Text style={styles.kpiValue}>${businessData.kpis.totalRevenue.toLocaleString()}</Text>
              <Text style={styles.kpiLabel}>Total Revenue</Text>
            </View>
            <View style={styles.kpiItem}>
              <Text style={styles.kpiValue}>{businessData.kpis.monthlyGrowth}%</Text>
              <Text style={styles.kpiLabel}>Monthly Growth</Text>
            </View>
            <View style={styles.kpiItem}>
              <Text style={styles.kpiValue}>{businessData.kpis.activeProjects}</Text>
              <Text style={styles.kpiLabel}>Active Projects</Text>
            </View>
            <View style={styles.kpiItem}>
              <Text style={styles.kpiValue}>{businessData.kpis.automationLevel}%</Text>
              <Text style={styles.kpiLabel}>Automation Level</Text>
            </View>
          </View>
        </View>

        {/* Automation Systems */}
        <View style={styles.automationContainer}>
          <Text style={styles.sectionTitle}>🤖 Automation Systems</Text>
          {businessData.automation.map((system, index) => (
            <View key={index} style={styles.automationItem}>
              <View style={styles.automationHeader}>
                <Text style={styles.automationName}>{system.name}</Text>
                <View style={[
                  styles.automationStatus,
                  { backgroundColor: system.active ? '#10b981' : '#6b7280' }
                ]}>
                  <Text style={styles.automationStatusText}>
                    {system.active ? 'Active' : 'Inactive'}
                  </Text>
                </View>
              </View>
              <View style={styles.efficiencyContainer}>
                <Text style={styles.efficiencyLabel}>Efficiency</Text>
                <View style={styles.efficiencyBar}>
                  <View style={[styles.efficiencyFill, { width: `${system.efficiency}%` }]} />
                </View>
                <Text style={styles.efficiencyValue}>{system.efficiency}%</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>View Analytics</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Manage Automation</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Generate Report</Text>
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
  businessSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 8,
  },
  businessButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#1e293b',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#312e81',
  },
  activeBusinessButton: {
    backgroundColor: '#1e3a8a',
    borderColor: '#3b82f6',
  },
  businessButtonText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '500',
  },
  activeBusinessButtonText: {
    color: '#f8fafc',
  },
  businessDetails: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#312e81',
  },
  businessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  businessName: {
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
  revenueContainer: {
    marginBottom: 16,
  },
  revenueLabel: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 4,
  },
  revenueValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 8,
  },
  growthContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  growthLabel: {
    fontSize: 12,
    color: '#94a3b8',
  },
  growthValue: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '500',
  },
  kpiContainer: {
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
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  kpiItem: {
    width: '48%',
    backgroundColor: '#1e1b4b',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  kpiValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 4,
  },
  kpiLabel: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
  },
  automationContainer: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#312e81',
  },
  automationItem: {
    marginBottom: 12,
  },
  automationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  automationName: {
    fontSize: 14,
    color: '#f8fafc',
    fontWeight: '500',
  },
  automationStatus: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  automationStatusText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '500',
  },
  efficiencyContainer: {
    marginBottom: 8,
  },
  efficiencyLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 4,
  },
  efficiencyBar: {
    height: 6,
    backgroundColor: '#1e1b4b',
    borderRadius: 3,
    marginBottom: 4,
  },
  efficiencyFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 3,
  },
  efficiencyValue: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
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
