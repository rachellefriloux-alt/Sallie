import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

const API_BASE = 'http://192.168.1.47:8742';

interface LimbicState {
  limbic_variables: Record<string, number>;
  autonomy_level: number;
  trust_tier: string;
}

interface CognitiveState {
  active_models: string[];
  reasoning_confidence: number;
  dynamic_posture: string;
  learning_memory_size: number;
  cross_domain_patterns: number;
}

const HumanLevelExpansion: React.FC = () => {
  const [limbicState, setLimbicState] = useState<LimbicState | null>(null);
  const [cognitiveState, setCognitiveState] = useState<CognitiveState | null>(null);
  const [loading, setLoading] = useState(true);
  const [enhancing, setEnhancing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [limbicResponse, cognitiveResponse] = await Promise.all([
          fetch(`${API_BASE}/limbic`),
          fetch(`${API_BASE}/cognitive`)
        ]);

        if (limbicResponse.ok && cognitiveResponse.ok) {
          const [limbicData, cognitiveData] = await Promise.all([
            limbicResponse.json(),
            cognitiveResponse.json()
          ]);

          setLimbicState(limbicData);
          setCognitiveState(cognitiveData);
        }
      } catch (error) {
        console.error('Failed to fetch human-level data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleEnhancement = async (variable: string, delta: number) => {
    if (limbicState?.autonomy_level !== 4) {
      Alert.alert('Permission Denied', 'Enhancement requires Tier 4 (Full Partner) trust level');
      return;
    }

    setEnhancing(true);
    try {
      const response = await fetch(`${API_BASE}/enhance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ variable, delta }),
      });

      if (response.ok) {
        const result = await response.json();
        // Refresh limbic state
        const limbicResponse = await fetch(`${API_BASE}/limbic`);
        if (limbicResponse.ok) {
          const newLimbicState = await limbicResponse.json();
          setLimbicState(newLimbicState);
        }
        Alert.alert('Enhancement Complete', result.message);
      } else {
        Alert.alert('Enhancement Failed', 'Please try again');
      }
    } catch (error) {
      console.error('Enhancement failed:', error);
      Alert.alert('Enhancement Failed', 'Network error');
    } finally {
      setEnhancing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#00A896" />
        <Text style={styles.loadingText}>Loading Human-Level Expansion...</Text>
      </View>
    );
  }

  if (!limbicState || !cognitiveState) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Human-level expansion features not available</Text>
      </View>
    );
  }

  const limbicVariables = [
    { key: 'trust', label: 'Trust', icon: 'favorite', color: '#FF6B6B' },
    { key: 'empathy', label: 'Empathy', icon: 'favorite', color: '#FF6B9D' },
    { key: 'intuition', label: 'Intuition', icon: 'auto-awesome', color: '#C77DFF' },
    { key: 'creativity', label: 'Creativity', icon: 'lightbulb', color: '#FEF08A' },
    { key: 'wisdom', label: 'Wisdom', icon: 'psychology', color: '#7DD3FC' },
    { key: 'humor', label: 'Humor', icon: 'sentiment-satisfied', color: '#6EE7B7' },
  ];

  const getTrustTierColor = (tier: string) => {
    if (tier.includes('Full_Partner')) return '#9333EA';
    if (tier.includes('Surrogate')) return '#3B82F6';
    if (tier.includes('Colleague')) return '#10B981';
    if (tier.includes('Acquaintance')) return '#F59E0B';
    return '#6B7280';
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Trust Tier Status */}
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Trust Level</Text>
          <View style={[styles.trustBadge, { backgroundColor: getTrustTierColor(limbicState.trust_tier) }]}>
            <Text style={styles.trustBadgeText}>
              {limbicState.trust_tier.replace('_', ' ')}
            </Text>
          </View>
        </View>
        <View style={styles.cardContent}>
          <View style={styles.progressContainer}>
            <Text style={styles.progressLabel}>Autonomy Level</Text>
            <Text style={styles.progressValue}>Tier {limbicState.autonomy_level}/4</Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(limbicState.autonomy_level / 4) * 100}%` }
              ]} 
            />
          </View>
        </View>
      </Card>

      {/* Limbic Variables */}
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Limbic System</Text>
        </View>
        <View style={styles.cardContent}>
          {limbicVariables.map(({ key, label, icon, color }) => {
            const value = limbicState.limbic_variables[key] || 0;
            return (
              <View key={key} style={styles.variableContainer}>
                <View style={styles.variableHeader}>
                  <View style={styles.variableInfo}>
                    <Icon name={icon} size={20} color={color} />
                    <Text style={styles.variableLabel}>{label}</Text>
                  </View>
                  <Text style={styles.variableValue}>{value.toFixed(2)}</Text>
                </View>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${value * 100}%`, backgroundColor: color }
                    ]} 
                  />
                </View>
                {limbicState.autonomy_level === 4 && (
                  <View style={styles.enhancementButtons}>
                    <TouchableOpacity
                      style={[styles.enhancementButton, styles.decrementButton]}
                      onPress={() => handleEnhancement(key, -0.1)}
                      disabled={enhancing || value <= 0}
                    >
                      <Text style={styles.enhancementButtonText}>-</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.enhancementButton, styles.incrementButton]}
                      onPress={() => handleEnhancement(key, 0.1)}
                      disabled={enhancing || value >= 1}
                    >
                      <Text style={styles.enhancementButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </Card>

      {/* Cognitive State */}
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Cognitive Processing</Text>
        </View>
        <View style={styles.cardContent}>
          <View style={styles.cognitiveSection}>
            <Text style={styles.cognitiveLabel}>Active Reasoning Models</Text>
            <View style={styles.modelsContainer}>
              {cognitiveState.active_models.map((model) => (
                <View key={model} style={styles.modelBadge}>
                  <Text style={styles.modelText}>{model}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.cognitiveSection}>
            <View style={styles.progressContainer}>
              <Text style={styles.cognitiveLabel}>Reasoning Confidence</Text>
              <Text style={styles.progressValue}>{(cognitiveState.reasoning_confidence * 100).toFixed(0)}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${cognitiveState.reasoning_confidence * 100}%` }
                ]} 
              />
            </View>
          </View>

          <View style={styles.cognitiveStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Dynamic Posture</Text>
              <Text style={styles.statValue}>{cognitiveState.dynamic_posture}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Learning Memory</Text>
              <Text style={styles.statValue}>{cognitiveState.learning_memory_size} items</Text>
            </View>
          </View>
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
    padding: 16,
  },
  loadingText: {
    color: '#EAEAEA',
    marginTop: 16,
    textAlign: 'center',
  },
  errorText: {
    color: '#EAEAEA',
    textAlign: 'center',
    marginTop: 16,
  },
  card: {
    backgroundColor: '#1A1A1A',
    marginBottom: 16,
    borderRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  cardTitle: {
    color: '#EAEAEA',
    fontSize: 18,
    fontWeight: 'bold',
  },
  trustBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trustBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardContent: {
    padding: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    color: '#EAEAEA',
    fontSize: 14,
  },
  progressValue: {
    color: '#EAEAEA',
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00A896',
    borderRadius: 4,
  },
  variableContainer: {
    marginBottom: 20,
  },
  variableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  variableInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  variableLabel: {
    color: '#EAEAEA',
    fontSize: 14,
    fontWeight: 'medium',
  },
  variableValue: {
    color: '#EAEAEA',
    fontSize: 14,
    fontWeight: 'bold',
  },
  enhancementButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  enhancementButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  decrementButton: {
    backgroundColor: '#FF6B6B',
  },
  incrementButton: {
    backgroundColor: '#6EE7B7',
  },
  enhancementButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cognitiveSection: {
    marginBottom: 20,
  },
  cognitiveLabel: {
    color: '#EAEAEA',
    fontSize: 14,
    marginBottom: 8,
  },
  modelsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modelBadge: {
    backgroundColor: '#333',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  modelText: {
    color: '#EAEAEA',
    fontSize: 12,
  },
  cognitiveStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    color: '#666',
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: '#EAEAEA',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default HumanLevelExpansion;
