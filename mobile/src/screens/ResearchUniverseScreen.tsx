/**
 * Research Universe Screen - Mobile Version
 * Complete OMNIS knowledge base with CopyMind AI features for mobile
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

interface ResearchUniverseScreenProps {
  navigation: any;
}

export function ResearchUniverseScreen({ navigation }: ResearchUniverseScreenProps) {
  const [activeMode, setActiveMode] = useState('mindmap');
  const [refreshing, setRefreshing] = useState(false);

  const [researchData] = useState({
    mindMapNodes: [
      { id: 'central', name: 'Sallie Studio Ecosystem', connections: 12 },
      { id: 'ai', name: 'AI Intelligence', connections: 8 },
      { id: 'neuroscience', name: 'Neuroscience', connections: 6 },
      { id: 'business', name: 'Business Strategy', connections: 5 },
      { id: 'personal', name: 'Personal Development', connections: 4 }
    ],
    omnisSystem: {
      totalDomains: 45,
      totalTopics: 52400,
      aggregateExpertise: 84.5,
      systemStatus: 'Omniscient Framework'
    },
    copyMindFeatures: [
      { name: '3D Mind Mapping', effectiveness: 95, status: 'active' },
      { name: 'Knowledge Synthesis', effectiveness: 88, status: 'active' },
      { name: 'Pattern Recognition', effectiveness: 92, status: 'active' },
      { name: 'Creative Ideation', effectiveness: 85, status: 'active' }
    ],
    omniProtocols: [
      { name: 'Architect of Reality', power: 98, tier: 'VI' },
      { name: 'Civilization Reset', power: 95, tier: 'III' },
      { name: 'Ultimate Self', power: 96, tier: 'IV' },
      { name: 'Project Stargate', power: 92, tier: 'VI' }
    ]
  });

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  };

  const modes = [
    { id: 'mindmap', name: '3D Mind Map', icon: '🧠' },
    { id: 'research', name: 'Research Projects', icon: '🔬' },
    { id: 'knowledge', name: 'OMNIS Knowledge', icon: '📚' },
    { id: 'protocols', name: 'Omni-Protocols', icon: '⚡' }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🔬 Research Universe</Text>
          <Text style={styles.subtitle}>OMNIS Knowledge Base & CopyMind AI</Text>
        </View>

        {/* Mode Selector */}
        <View style={styles.modeSelector}>
          {modes.map((mode) => (
            <TouchableOpacity
              key={mode.id}
              style={[
                styles.modeButton,
                activeMode === mode.id && styles.activeModeButton
              ]}
              onPress={() => setActiveMode(mode.id)}
            >
              <Text style={styles.modeIcon}>{mode.icon}</Text>
              <Text style={[
                styles.modeButtonText,
                activeMode === mode.id && styles.activeModeButtonText
              ]}>
                {mode.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* OMNIS System Overview */}
        <View style={styles.omnisOverview}>
          <Text style={styles.sectionTitle}>💠 OMNIS System</Text>
          <Text style={styles.omnisSubtitle}>Universal Polymath Knowledge Base</Text>
          <View style={styles.omnisStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>45</Text>
              <Text style={styles.statLabel}>Active Domains</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>52,400+</Text>
              <Text style={styles.statLabel}>Topics</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>84.5%</Text>
              <Text style={statLabel}>Expertise</Text>
            </View>
          </View>
        </View>

        {/* Content based on active mode */}
        {activeMode === 'mindmap' && (
          <View style={styles.contentContainer}>
            <Text style={styles.sectionTitle}>🧠 3D Mind Map</Text>
            <Text style={styles.contentSubtitle}>Interactive 3D visualization</Text>
            <View style={styles.nodeGrid}>
              {researchData.mindMapNodes.map((node) => (
                <View key={node.id} style={styles.nodeItem}>
                  <Text style={styles.nodeName}>{node.name}</Text>
                  <Text style={styles.nodeConnections}>{node.connections} connections</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {activeMode === 'knowledge' && (
          <View style={styles.contentContainer}>
            <Text style={styles.sectionTitle}>📚 Knowledge Tiers</Text>
            <View style={styles.tierContainer}>
              <View style={styles.tierItem}>
                <Text style={styles.tierTitle}>Tier I: Concrete Reality</Text>
                <Text style={styles.tierDescription}>Hardware of the universe</Text>
                <Text style={styles.tierDomains}>6 Domains</Text>
              </View>
              <View style={styles.tierItem}>
                <Text style={styles.tierTitle}>Tier II: Digital Synthesis</Text>
                <Text style={styles.tierDescription}>Code and AI systems</Text>
                <Text style={styles.tierDomains}>6 Domains</Text>
              </View>
              <View style={styles.tierItem}>
                <Text style={styles.tierTitle}>Tier III: Social Structure</Text>
                <Text style={styles.tierDescription}>Economics and power</Text>
                <Text style={styles.tierDomains}>6 Domains</Text>
              </View>
            </View>
          </View>
        )}

        {activeMode === 'protocols' && (
          <View style={styles.contentContainer}>
            <Text style={styles.sectionTitle}>⚡ Omni-Protocols</Text>
            <Text style={styles.contentSubtitle}>God-tier synergistic capabilities</Text>
            {researchData.omniProtocols.map((protocol, index) => (
              <View key={index} style={styles.protocolItem}>
                <View style={styles.protocolHeader}>
                  <Text style={styles.protocolName}>{protocol.name}</Text>
                  <View style={styles.protocolPower}>
                    <Text style={styles.protocolPowerValue}>{protocol.power}%</Text>
                  </View>
                </View>
                <Text style={styles.protocolTier}>Tier {protocol.tier}</Text>
                <View style={styles.protocolBar}>
                  <View style={[styles.protocolFill, { width: `${protocol.power}%` }]} />
                </View>
              </View>
            ))}
          </View>
        )}

        {/* CopyMind Features */}
        <View style={styles.featuresContainer}>
          <Text style={styles.sectionTitle}>🤖 CopyMind AI Features</Text>
          {researchData.copyMindFeatures.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <View style={styles.featureHeader}>
                <Text style={styles.featureName}>{feature.name}</Text>
                <View style={[
                  styles.featureStatus,
                  { backgroundColor: feature.status === 'active' ? '#10b981' : '#6b7280' }
                ]}>
                  <Text style={styles.featureStatusText}>
                    {feature.status}
                  </Text>
                </View>
              </View>
              <View style={styles.featureEfficiency}>
                <Text style={styles.featureEfficiencyLabel}>Effectiveness</Text>
                <View style={styles.featureEfficiencyBar}>
                  <View style={[styles.featureEfficiencyFill, { width: `${feature.effectiveness}%` }]} />
                </View>
                <Text style={styles.featureEfficiencyValue}>{feature.effectiveness}%</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>🚀 Quick Actions</Text>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Generate New Ideas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Start Creative Session</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Review Breakthroughs</Text>
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
  modeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 8,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#1e293b',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#312e81',
  },
  activeModeButton: {
    backgroundColor: '#1e3a8a',
    borderColor: '#3b82f6',
  },
  modeIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  modeButtonText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '500',
  },
  activeModeButtonText: {
    color: '#f8fafc',
  },
  omnisOverview: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#312e81',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 8,
  },
  omnisSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 12,
  },
  omnisStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8b5cf6',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#94a3b8',
  },
  contentContainer: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#312e81',
  },
  contentSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 12,
  },
  nodeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  nodeItem: {
    width: '48%',
    backgroundColor: '#1e1b4b',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#312e81',
  },
  nodeName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 4,
  },
  nodeConnections: {
    fontSize: 10,
    color: '#94a3b8',
  },
  tierContainer: {
    gap: 12,
  },
  tierItem: {
    backgroundColor: '#1e1b4b',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#312e81',
  },
  tierTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 4,
  },
  tierDescription: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 4,
  },
  tierDomains: {
    fontSize: 10,
    color: '#8b5cf6',
    fontWeight: '500',
  },
  protocolItem: {
    marginBottom: 12,
  },
  protocolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  protocolName: {
    fontSize: 14,
    color: '#f8fafc',
    fontWeight: '500',
    flex: 1,
  },
  protocolPower: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  protocolPowerValue: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  protocolTier: {
    fontSize: 10,
    color: '#94a3b8',
  },
  protocolBar: {
    height: 6,
    backgroundColor: '#1e1b4b',
    borderRadius: 3,
    marginBottom: 4,
  },
  protocolFill: {
    height: '100%',
    backgroundColor: '#f59e0b',
    borderRadius: 3,
  },
  featuresContainer: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#312e81',
  },
  featureItem: {
    marginBottom: 12,
  },
  featureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureName: {
    fontSize: 14,
    color: '#f8fafc',
    fontWeight: '500',
    flex: 1,
  },
  featureStatus: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  featureStatusText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '500',
  },
  featureEfficiency: {
    marginBottom: 8,
  },
  featureEfficiencyLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 4,
  },
  featureEfficiencyBar: {
    height: 6,
    backgroundColor: '#1e1b4b',
    borderRadius: 3,
    marginBottom: 4,
  },
  featureEfficiencyFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 3,
  },
  featureEfficiencyValue: {
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
