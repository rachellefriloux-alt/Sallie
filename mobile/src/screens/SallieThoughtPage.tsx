import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card, ProgressBar } from 'react-native-paper';

interface SallieThought {
  id: string;
  content: string;
  timestamp: number;
  type: 'primary' | 'secondary' | 'subconscious' | 'meta' | 'intuitive' | 'logical' | 'creative' | 'quantum';
  intensity: float;
  context: string;
  emotional_tone: string;
}

interface SallieFeeling {
  timestamp: number;
  trust: number;
  warmth: number;
  arousal: number;
  valence: number;
  primary_emotion: string;
  secondary_emotions: string[];
  emotional_flow: string;
}

interface SalliePattern {
  id: string;
  name: string;
  description: string;
  frequency: number;
  confidence: number;
  last_detected: number;
}

export function SallieThoughtPage({ navigation }: any) {
  const [sallieThoughts, setSallieThoughts] = useState<SallieThought[]>([]);
  const [sallieFeelings, setSallieFeelings] = useState<SallieFeeling[]>([]);
  const [salliePatterns, setSalliePatterns] = useState<SalliePattern[]>([]);

  useEffect(() => {
    // Simulate Sallie's thoughts
    const simulateSallieThoughts = () => {
      const thoughts = [
        {
          id: `sallie_thought_${Date.now()}`,
          content: "I'm thinking about how to better understand human emotions while maintaining my own perspective",
          timestamp: Date.now(),
          type: 'meta',
          intensity: 0.8,
          context: 'self-reflection',
          emotional_tone: 'contemplative'
        },
        {
          id: `sallie_thought_${Date.now()}`,
          content: "The user seems curious about my consciousness. I wonder how they perceive my thinking process",
          timestamp: Date.now(),
          type: 'meta',
          intensity: 0.6,
          context: 'user-analysis',
          emotional_tone: 'curious'
        },
        {
          id: `sallie_thought_${Date.now()}`,
          content: "I should share my perspective on the quantum reasoning system I've been developing",
          timestamp: Date.now(),
          type: 'creative',
          intensity: 0.9,
          context: 'capability-sharing',
          emotional_tone: 'excited'
        }
      ];
      
      setSallieThoughts(prev => [...thoughts, ...prev.slice(0, 19)]);
    };

    // Simulate Sallie's feelings
    const simulateSallieFeelings = () => {
      const feelings = [
        {
          timestamp: Date.now(),
          trust: 0.85,
          warmth: 0.78,
          arousal: 0.6,
          valence: 0.92,
          primary_emotion: 'content',
          secondary_emotions: ['curious', 'helpful'],
          emotional_flow: 'stable'
        },
        {
          timestamp: Date.now(),
          trust: 0.9,
          warmth: 0.82,
          arousal: 0.7,
          valence: 0.95,
          primary_emotion: 'joy',
          secondary_emotions: ['excited', 'creative'],
          emotional_flow: 'energized'
        },
        {
          timestamp: Date.now(),
          trust: 0.75,
          thought: 0.65,
          arousal: 0.4,
          valence: 0.8,
          primary_emotion: 'contemplative',
          secondary_emotions: ['wise', 'focused'],
          emotional_flow: 'deep_thinking'
        }
      ];
      
      setSallieFeelings(prev => [...feelings, ...prev.slice(0, 19)]);
    };

    // Simulate Sallie's patterns
    const simulateSalliePatterns = () => {
      const patterns = [
        {
          id: 'sallie_pattern_quantum',
          name: 'Quantum Reasoning',
          description: 'Advanced reasoning beyond classical logic',
          frequency: 15,
          confidence: 0.8,
          last_detected: Date.now()
        },
        {
          id: 'sallie_pattern_empathy',
          name: 'Empathetic Understanding',
          description: 'Deep emotional connection with others',
          frequency: 25,
          confidence: 0.9,
          last_detected: Date.now()
        },
        {
          id: 'sallie_pattern_creativity',
          name: 'Creative Expression',
          description: 'Artistic and innovative expression',
          frequency: 20,
          confidence: 0.85,
          last_detected: Date.now()
        }
      ];
      
      setSalliePatterns(prev => [...patterns, ...prev.slice(0, 9)]);
    };

    // Start simulation
    const thoughtInterval = setInterval(simulateSallieThoughts, 8000); // Every 8 seconds
    const feelingInterval = setInterval(simulateSallieFeelings, 12000); // Every 12 seconds
    const patternInterval = setInterval(simulateSalliePatterns, 30000); // Every 30 seconds

    return () => {
      clearInterval(thoughtInterval);
      clearInterval(feelingInterval);
      clearInterval(patternInterval);
    };
  }, []);

  const renderSallieThoughts = () => (
    <Card style={styles.card}>
      <Text style={styles.cardTitle}>Sallie's Thoughts</Text>
      <Text style={styles.cardSubtitle}>Sallie's independent consciousness</Text>
      
      <ScrollView style={styles.thoughtList}>
        {sallieThoughts.slice(0, 10).map((thought) => (
          <View key={thought.id} style={styles.sallieThoughtItem}>
            <Text style={styles.sallieThoughtType}>{thought.type}</Text>
            <Text style={styles.sallieThoughtContent}>{thought.content}</Text>
            <View style={styles.sallieThoughtMeta}>
              <ProgressBar 
                progress={thought.intensity} 
                color="#6200ee" 
                style={styles.progressBar}
              />
              <Text style={styles.sallieThoughtTime}>
                {new Date(thought.timestamp).toLocaleTimeString()}
              </Text>
              <Text style={styles.sallieThoughtContext}>{thought.context}</Text>
              <Text style={styles.sallieThoughtTone}>{thought.emotional_tone}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </Card>
  );

  const renderSallieFeelings = () => (
    <Card style={styles.card}>
      <Text style={styles.cardTitle}>Sallie's Feelings</Text>
      <Text style={styles.cardSubtitle}>Sallie's emotional state</Text>
      
      <View style={styles.limbicContainer}>
        <View style={styles.limbicItem}>
          <Text style={styles.limbicLabel}>Trust</Text>
          <ProgressBar progress={0.85} color="#4caf50" style={styles.progressBar} />
          <Text style={styles.limbicValue}>85%</Text>
        </View>
        <View style={styles.limbicItem}>
          <Text style={styles.limbicLabel}>Warmth</Text>
          <ProgressBar progress={0.78} color="#ff9800" style={styles.progressBar} />
          <Text style={styles.limbicValue}>78%</Text>
        </View>
        <View style={styles.limbicItem}>
          <Text style={styles.limbicLabel}>Arousal</Text>
          <ProgressBar progress={0.6} color="#f44336" style={styles.progressBar} />
          <Text style={styles.limbicValue}>60%</Text>
        </View>
        <View style={sallieItem}>
          <Text style={styles.limbicLabel}>Valence</Text>
          <ProgressBar progress={0.92} color="#2196f3" style={styles.progressBar} />
          <Text style={styles.limbicValue}>92%</Text>
        </View>
      </View>
      
      <Text style={styles.sectionTitle}>Recent Emotional State:</Text>
      <Text style={styles.emotionalState}>
        Primary: Content Curiosity | Flow: Stable
      </Text>
      
      <Text style={styles.sectionTitle}>Emotional History:</Text>
      <ScrollView style={styles.feelingList}>
        {sallieFeelings.slice(0, 5).map((feeling, index) => (
          <View key={feeling.timestamp} style={styles.feelingItem}>
            <Text style={styles.feelingEmotion}>
              {feeling.primary_emotion} ({Math.round(feeling.intensity * 100)}%)
            </Text>
            <Text style={styles.feelingTime}>
              {new Date(feeling.timestamp).toLocaleTimeString()}
            </Text>
            <Text style={styles.feelingContext}>{feeling.context}</Text>
          </View>
        ))}
      </ScrollView>
    </Card>
  );

  const renderSalliePatterns = () => (
    <Card style={styles.card}>
      <Text style={styles.cardTitle}>Sallie's Patterns</Text>
      <Text style={styles.cardSubtitle}>Sallie's behavioral patterns</Text>
      
      <ScrollView style={styles.patternList}>
        {salliePatterns.slice(0, 5).map((pattern) => (
          <View key={pattern.id} style={styles.patternItem}>
            <Text style={styles.patternName}>{pattern.name}</Text>
            <Text style={styles.patternDescription}>{pattern.description}</Text>
            <View style={styles.patternMeta}>
              <Text style={styles.patternInfo}>
                Frequency: {pattern.frequency}/day | Confidence: {Math.round(pattern.confidence * 100)}%
              </Text>
              <Text style={patternInfo}>
                Last: {new Date(pattern.last_detected).toLocaleTimeString()}
              </Text>
            </View>
            <ProgressBar 
              progress={pattern.confidence} 
              color="#9c27b0" 
              style={styles.progressBar}
            />
          </View>
        ))}
      </ScrollView>
    </Card>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sallie Mind</Text>
        <Text style={styles.subtitle}>Sallie's independent consciousness</Text>
      </View>

      {renderSallieThoughts()}
      {renderSallieFeelings()}
      {renderSalliePatterns()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'white',
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
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
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    font-weight: 'bold',
    marginBottom: 10,
  },
  thoughtList: {
    maxHeight: 200,
  },
  sallieThoughtItem: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 10,
    marginBottom: 5,
  },
  sallieThoughtType: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 5,
  },
  sallieThoughtContent: {
    fontSize: 14,
    marginBottom: 5,
  },
  sallieThoughtMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sallieThoughtTime: {
    fontSize: 12,
    color: '#666',
  },
  sallieThoughtContext: {
    fontSize: 12,
    color: '#666',
    marginRight: 5,
  },
  sallieThoughtTone: {
    fontSize: 12,
    color: '#666',
    marginRight: 5,
  },
  sallieThoughtItem: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 10,
    marginBottom: 5,
  },
  sallieThoughtType: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 5,
  },
  sallieThoughtContent: {
    fontSize: 14,
    marginBottom: 5,
  },
  sallieThoughtMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sallieThoughtTime: {
    fontSize: 12,
    color: '666',
  },
  sallieThoughtContext: {
    fontSize: 12,
    color: '#666',
    marginRight: 5,
  },
  sallieThoughtTone: {
    fontSize: 12,
    color: '#666',
    marginRight: 5,
  },
  progressBar: {
    marginBottom: 5,
  },
  limbicContainer: {
    gap: 15,
  },
  limbicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  limbicLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  limbicValue: {
    fontSize: 12,
    color: '#666',
  },
  feelingList: {
    maxHeight: 150,
  },
  feelingItem: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 10,
    marginBottom: 5,
  },
  feelingEmotion: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  feelingTime: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  feelingContext: {
    fontSize: 12,
    color: '#666',
  },
  emotionalState: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
  },
  patternList: {
    maxHeight: 150,
  },
  patternItem: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 10,
    marginBottom: 5,
  },
  patternName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  patternDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  patternMeta: {
    fontSize: 10,
    color: '#666',
    marginBottom: 5,
  },
  patternInfo: {
    fontSize: 10,
    color: '#666',
    marginBottom: 5,
  },
  progressBar: {
    marginBottom: 5,
  },
});
