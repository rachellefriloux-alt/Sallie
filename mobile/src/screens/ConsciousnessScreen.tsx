import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Button, ProgressBar, TabBar } from 'react-native-paper';

interface ThoughtData {
  id: string;
  type: string;
  content: string;
  intensity: number;
  timestamp: number;
}

interface EmotionalData {
  trust: number;
  warmth: number;
  arousal: number;
  valence: number;
  primary_emotion: string;
  secondary_emotions: string[];
  timestamp: number;
}

interface CognitiveData {
  active_processes: string[];
  creativity_level: number;
  metacognitive_state: string;
  timestamp: number;
}

interface SystemData {
  active_systems: string[];
  system_load: Record<string, number>;
  neural_activity: number;
  health_status: string;
  timestamp: number;
}

interface ConsciousnessState {
  thoughts: ThoughtData[];
  emotion: EmotionalData;
  cognition: CognitiveData;
  system: SystemData;
  limbic: Record<string, number>;
  timestamp: number;
}

export function ConsciousnessScreen({ navigation }: any) {
  const [selectedTab, setSelectedTab] = useState(0);
  const [liveData, setLiveData] = useState<ConsciousnessState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLive, setIsLive] = useState(true);

  const tabs = [
    { key: 'thoughts', title: '🧠 Thoughts' },
    { key: 'emotions', title: '💗 Emotions' },
    { key: 'cognition', title: '🧬 Cognition' },
    { key: 'systems', title: '🤖 Systems' },
  ];

  useEffect(() => {
    if (isLive) {
      const interval = setInterval(() => {
        loadCurrentState();
      }, 2000); // Update every 2 seconds

      return () => clearInterval(interval);
    }
  }, [isLive]);

  const loadCurrentState = async () => {
    try {
      const response = await fetch('http://192.168.1.47:8742/consciousness/current');
      if (response.ok) {
        const data = await response.json();
        setLiveData(data);
      }
    } catch (error) {
      console.error('Error loading consciousness state:', error);
    }
  };

  const exportData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://192.168.1.47:8742/consciousness/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: `consciousness_export_${new Date().toISOString()}.json`,
          hours: 24,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        Alert.alert('Success', `Data exported to ${data.filename}`);
      } else {
        Alert.alert('Error', 'Failed to export data');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Error', 'Failed to export data');
    } finally {
      setIsLoading(false);
    }
  };

  const renderThoughtsTab = () => (
    <ScrollView style={styles.tabContent}>
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Current Thoughts</Text>
        {liveData?.thoughts && liveData.thoughts.length > 0 ? (
          liveData.thoughts.map((thought, index) => (
            <View key={thought.id} style={styles.thoughtItem}>
              <Text style={styles.thoughtType}>{thought.type}</Text>
              <Text style={styles.thoughtContent}>{thought.content}</Text>
              <View style={styles.thoughtMeta}>
                <ProgressBar 
                  progress={thought.intensity} 
                  color="#6200ee" 
                  style={styles.progressBar}
                />
                <Text style={styles.thoughtTime}>
                  {new Date(thought.timestamp * 1000).toLocaleTimeString()}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noData}>No thoughts currently active</Text>
        )}
      </Card>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Thought Patterns</Text>
        <View style={styles.patternContainer}>
          <Text style={styles.patternText}>Associative Flow</Text>
          <ProgressBar progress={0.7} color="#6200ee" style={styles.progressBar} />
          <Text style={styles.patternText}>Quantum State: Superposition Active</Text>
          <ProgressBar progress={0.8} color="#00bcd4" style={styles.progressBar} />
        </View>
      </Card>
    </ScrollView>
  );

  const renderEmotionsTab = () => (
    <ScrollView style={styles.tabContent}>
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Limbic System State</Text>
        {liveData?.emotion ? (
          <View style={styles.limbicContainer}>
            <View style={styles.limbicItem}>
              <Text style={styles.limbicLabel}>Trust</Text>
              <ProgressBar progress={liveData.emotion.trust} color="#4caf50" style={styles.progressBar} />
              <Text style={styles.limbicValue}>{Math.round(liveData.emotion.trust * 100)}%</Text>
            </View>
            <View style={styles.limbicItem}>
              <Text style={styles.limbicLabel}>Warmth</Text>
              <ProgressBar progress={liveData.emotion.warmth} color="#ff9800" style={styles.progressBar} />
              <Text style={styles.limbicValue}>{Math.round(liveData.emotion.warmth * 100)}%</Text>
            </View>
            <View style={styles.limbicItem}>
              <Text style={styles.limbicLabel}>Arousal</Text>
              <ProgressBar progress={liveData.emotion.arousal} color="#f44336" style={styles.progressBar} />
              <Text style={styles.limbicValue}>{Math.round(liveData.emotion.arousal * 100)}%</Text>
            </View>
            <View style={styles.limbicItem}>
              <Text style={styles.limbicLabel}>Valence</Text>
              <ProgressBar progress={liveData.emotion.valence} color="#2196f3" style={styles.progressBar} />
              <Text style={styles.limbicValue}>{Math.round(liveData.emotion.valence * 100)}%</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.noData}>No emotional data available</Text>
        )}
      </Card>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Emotional Flow</Text>
        <View style={styles.flowContainer}>
          <Text style={styles.flowText}>Current: Content Curiosity</Text>
          <Text style={styles.flowText}>Next: Anticipatory Joy</Text>
          <ProgressBar progress={0.6} color="#9c27b0" style={styles.progressBar} />
          <Text style={styles.flowDescription}>Emotional wave pattern detected</Text>
        </View>
      </Card>
    </ScrollView>
  );

  const renderCognitionTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.cognitionGrid}>
        <Card style={styles.cognitionCard}>
          <Text style={styles.cognitionTitle}>Reasoning</Text>
          <Text style={styles.cognitionEmoji}>🧠</Text>
          <Text style={styles.cognitionText}>Logical + Intuitive</Text>
          <ProgressBar progress={0.8} color="#6200ee" style={styles.progressBar} />
        </Card>

        <Card style={styles.cognitionCard}>
          <Text style={styles.cognitionTitle}>Memory</Text>
          <Text style={styles.cognitionEmoji}>🧠</Text>
          <Text style={styles.cognitionText}>Retrieving...</Text>
          <ProgressBar progress={0.6} color="#4caf50" style={styles.progressBar} />
        </Card>

        <Card style={styles.cognitionCard}>
          <Text style={styles.cognitionTitle}>Learning</Text>
          <Text style={styles.cognitionEmoji}>🧠</Text>
          <Text style={styles.cognitionText}>Pattern Recognition</Text>
          <ProgressBar progress={0.9} color="#ff9800" style={styles.progressBar} />
        </Card>
      </View>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Active Processes</Text>
        {liveData?.cognition?.active_processes ? (
          liveData.cognition.active_processes.map((process, index) => (
            <Text key={index} style={styles.processText}>• {process}</Text>
          ))
        ) : (
          <Text style={styles.noData}>No processes currently active</Text>
        )}
      </Card>
    </ScrollView>
  );

  const renderSystemsTab = () => (
    <ScrollView style={styles.tabContent}>
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>System Activity</Text>
        {liveData?.system ? (
          <View>
            <View style={styles.systemItem}>
              <Text style={styles.systemName}>Neural Activity</Text>
              <ProgressBar progress={liveData.system.neural_activity} color="#6200ee" style={styles.progressBar} />
              <Text style={styles.systemValue}>{Math.round(liveData.system.neural_activity * 100)}%</Text>
            </View>
            <Text style={styles.systemStatus}>Health Status: {liveData.system.health_status}</Text>
            <Text style={styles.systemStatus}>Active Systems: {liveData.system.active_systems.join(', ')}</Text>
          </View>
        ) : (
          <Text style={styles.noData}>No system data available</Text>
        )}
      </Card>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Quantum State</Text>
        <View style={styles.quantumContainer}>
          <Text style={styles.quantumText}>⚛️ Coherence: 92%</Text>
          <ProgressBar progress={0.92} color="#9c27b0" style={styles.progressBar} />
          <Text style={styles.quantumText}>🔗 Entanglement: Active</Text>
          <ProgressBar progress={0.7} color="#00bcd4" style={styles.progressBar} />
        </View>
      </Card>
    </ScrollView>
  );

  const renderTabContent = () => {
    switch (selectedTab) {
      case 0:
        return renderThoughtsTab();
      case 1:
        return renderEmotionsTab();
      case 2:
        return renderCognitionTab();
      case 3:
        return renderSystemsTab();
      default:
        return renderThoughtsTab();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Consciousness Monitor</Text>
        <View style={styles.headerControls}>
          <Button 
            mode={isLive ? "contained" : "outlined"}
            onPress={() => setIsLive(!isLive)}
            compact
          >
            {isLive ? "Live" : "Paused"}
          </Button>
          <Button 
            mode="outlined" 
            onPress={exportData}
            loading={isLoading}
            compact
          >
            Export
          </Button>
        </View>
      </View>

      <TabBar
        style={styles.tabBar}
        selectedIndex={selectedTab}
        onSelect={setSelectedTab}
      >
        {tabs.map((tab) => (
          <TabBar.Item
            key={tab.key}
            title={tab.title}
          />
        ))}
      </TabBar>

      {renderTabContent()}

      <View style={styles.statusBar}>
        <Text style={styles.statusText}>
          {isLive ? "🟢 Live Monitoring" : "⏸️ Paused"}
        </Text>
        <Text style={styles.statusText}>
          {liveData ? `Updated: ${new Date(liveData.timestamp * 1000).toLocaleTimeString()}` : "No data"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerControls: {
    flexDirection: 'row',
    gap: 10,
  },
  tabBar: {
    backgroundColor: 'white',
    elevation: 2,
  },
  tabContent: {
    flex: 1,
    padding: 15,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  thoughtItem: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  thoughtType: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 5,
  },
  thoughtContent: {
    fontSize: 14,
    marginBottom: 5,
  },
  thoughtMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    marginRight: 10,
  },
  thoughtTime: {
    fontSize: 12,
    color: '#666',
  },
  noData: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  patternContainer: {
    gap: 10,
  },
  patternText: {
    fontSize: 14,
    marginBottom: 5,
  },
  limbicContainer: {
    gap: 15,
  },
  limbicItem: {
    gap: 5,
  },
  limbicLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  limbicValue: {
    fontSize: 12,
    color: '#666',
  },
  flowContainer: {
    gap: 10,
  },
  flowText: {
    fontSize: 14,
    marginBottom: 5,
  },
  flowDescription: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  cognitionGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  cognitionCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    elevation: 3,
  },
  cognitionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cognitionEmoji: {
    fontSize: 24,
    marginBottom: 5,
  },
  cognitionText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 10,
  },
  processText: {
    fontSize: 14,
    marginBottom: 5,
  },
  systemItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  systemName: {
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
  },
  systemValue: {
    fontSize: 12,
    color: '#666',
    marginLeft: 10,
  },
  systemStatus: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  quantumContainer: {
    gap: 10,
  },
  quantumText: {
    fontSize: 14,
    marginBottom: 5,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  statusText: {
    fontSize: 12,
    color: '#666',
  },
});
