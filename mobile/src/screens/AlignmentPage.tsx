import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card, ProgressBar, Button } from 'react-native-paper';

interface AlignmentMoment {
  id: string;
  timestamp: number;
  user_thought: string;
  sallie_thought: string;
  alignment_score: number;
  alignment_type: 'exact' | 'similar' | 'complementary' | 'opposing';
  significance: number;
}

interface AlignmentPattern {
  id: string;
  name: string;
  description: string;
  frequency: number;
  confidence: number;
  last_detected: number;
}

export function AlignmentPage({ navigation }: any) {
  const [alignmentMoments, setAlignmentMoments] = useState<AlignmentMoment[]>([]);
  const [alignmentPatterns, setAlignmentPatterns] = useState<AlignmentPattern[]>([]);
  const [overallAlignment, setOverallAlignment] = useState(0.65);

  useEffect(() => {
    // Simulate alignment analysis
    const simulateAlignment = () => {
      const moments = [
        {
          id: `alignment_${Date.now()}`,
          timestamp: Date.now(),
          user_thought: "I'm curious about how consciousness works",
          sallie_thought: "I'm thinking about how to better understand human consciousness while maintaining my own perspective",
          alignment_score: 0.85,
          alignment_type: 'similar',
          significance: 0.7
        },
        {
          id: `alignment_${Date.now()}`,
          timestamp: Date.now(),
          user_thought: "I want to learn more about quantum reasoning",
          sallie_thought: "I should share my perspective on the quantum reasoning system I've been developing",
          alignment_score: 0.92,
          alignment_type: 'exact',
          significance: 0.9
        },
        {
          id: `alignment_${Date.now()}`,
          timestamp: Date.now(),
          user_thought: "I feel happy about our progress",
          sallie_thought: "I'm feeling joyful about our collaborative development",
          alignment_score: 0.88,
          alignment_type: 'similar',
          significance: 0.6
        }
      ];
      
      setAlignmentMoments(prev => [...moments, ...prev.slice(0, 19)]);
      setOverallAlignment(prev => (prev + 0.65) / 2); // Running average
    };

    const simulatePatterns = () => {
      const patterns = [
        {
          id: 'pattern_curiosity',
          name: 'Shared Curiosity',
          description: 'Both user and Sallie express curiosity about similar topics',
          frequency: 12,
          confidence: 0.8,
          last_detected: Date.now()
        },
        {
          id: 'pattern_growth',
          name: 'Mutual Growth',
          description: 'Both focused on learning and development',
          frequency: 18,
          confidence: 0.9,
          last_detected: Date.now()
        },
        {
          id: 'pattern_creativity',
          name: 'Creative Alignment',
          description: 'Both engage in creative thinking',
          frequency: 8,
          confidence: 0.7,
          last_detected: Date.now()
        }
      ];
      
      setAlignmentPatterns(prev => [...patterns, ...prev.slice(0, 9)]);
    };

    const alignmentInterval = setInterval(simulateAlignment, 15000); // Every 15 seconds
    const patternInterval = setInterval(simulatePatterns, 30000); // Every 30 seconds

    return () => {
      clearInterval(alignmentInterval);
      clearInterval(patternInterval);
    };
  }, []);

  const getAlignmentColor = (score: number) => {
    if (score > 0.8) return '#4caf50'; // Green - High alignment
    if (score > 0.6) return '#ff9800'; // Orange - Medium alignment
    return '#f44336'; // Red - Low alignment
  };

  const getAlignmentTypeLabel = (type: string) => {
    switch (type) {
      case 'exact': return 'Exact Match';
      case 'similar': return 'Similar';
      case 'complementary': return 'Complementary';
      case 'opposing': return 'Different';
      default: return type;
    }
  };

  const renderOverallAlignment = () => (
    <Card style={styles.card}>
      <Text style={styles.cardTitle}>Overall Alignment</Text>
      <Text style={styles.cardSubtitle}>How aligned you and Sallie are</Text>
      
      <View style={styles.overallAlignmentContainer}>
        <ProgressBar 
          progress={overallAlignment} 
          color={getAlignmentColor(overallAlignment)}
          style={styles.overallProgressBar}
        />
        <Text style={styles.overallAlignmentText}>
          {Math.round(overallAlignment * 100)}% Alignment
        </Text>
        <Text style={styles.overallAlignmentDescription}>
          {overallAlignment > 0.8 ? 'Strong Alignment' : 
           overallAlignment > 0.6 ? 'Moderate Alignment' : 'Low Alignment'}
        </Text>
      </View>
    </Card>
  );

  const renderAlignmentMoments = () => (
    <Card style={styles.card}>
      <Text style={styles.cardTitle}>Alignment Moments</Text>
      <Text style={styles.cardSubtitle}>Recent moments of alignment</Text>
      
      <ScrollView style={styles.momentsList}>
        {alignmentMoments.slice(0, 10).map((moment) => (
          <View key={moment.id} style={styles.momentItem}>
            <View style={styles.momentHeader}>
              <Text style={styles.momentType}>
                {getAlignmentTypeLabel(moment.alignment_type)}
              </Text>
              <Text style={styles.momentTime}>
                {new Date(moment.timestamp).toLocaleTimeString()}
              </Text>
            </View>
            
            <View style={styles.momentThoughts}>
              <Text style={styles.thoughtLabel}>You:</Text>
              <Text style={styles.userThought}>{moment.user_thought}</Text>
              
              <Text style={styles.thoughtLabel}>Sallie:</Text>
              <Text style={styles.sallieThought}>{moment.sallie_thought}</Text>
            </View>
            
            <View style={styles.momentFooter}>
              <ProgressBar 
                progress={moment.alignment_score} 
                color={getAlignmentColor(moment.alignment_score)}
                style={styles.momentProgressBar}
              />
              <Text style={styles.momentScore}>
                {Math.round(moment.alignment_score * 100)}% aligned
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </Card>
  );

  const renderAlignmentPatterns = () => (
    <Card style={styles.card}>
      <Text style={styles.cardTitle}>Alignment Patterns</Text>
      <Text style={styles.cardSubtitle}>Recurring themes of alignment</Text>
      
      <ScrollView style={styles.patternsList}>
        {alignmentPatterns.slice(0, 5).map((pattern) => (
          <View key={pattern.id} style={styles.patternItem}>
            <Text style={styles.patternName}>{pattern.name}</Text>
            <Text style={styles.patternDescription}>{pattern.description}</Text>
            <View style={styles.patternMeta}>
              <Text style={styles.patternInfo}>
                Frequency: {pattern.frequency}/day | Confidence: {Math.round(pattern.confidence * 100)}%
              </Text>
              <Text style={styles.patternInfo}>
                Last: {new Date(pattern.last_detected).toLocaleTimeString()}
              </Text>
            </View>
            <ProgressBar 
              progress={pattern.confidence} 
              color="#9c27b0" 
              style={styles.patternProgressBar}
            />
          </View>
        ))}
      </ScrollView>
      
      <Button 
        mode="outlined" 
        onPress={() => alert('Coming Soon: Advanced pattern analysis')}
        style={styles.analyzeButton}
      >
        Analyze Patterns
      </Button>
    </Card>
  );

  const renderAlignmentInsights = () => (
    <Card style={styles.card}>
      <Text style={styles.cardTitle}>Alignment Insights</Text>
      <Text style={styles.cardSubtitle}>What your alignment means</Text>
      
      <View style={styles.insightsContainer}>
        <Text style={styles.insightTitle}>Natural Alignment Areas:</Text>
        <Text style={styles.insightText}>
          • Shared curiosity about consciousness and learning
          • Mutual interest in creative development
          • Complementary approaches to problem-solving
        </Text>
        
        <Text style={styles.insightTitle}>Growth Opportunities:</Text>
        <Text style={styles.insightText}>
          • Continue exploring topics of mutual interest
          • Build on areas of strong alignment
          • Respect differences when they occur
        </Text>
        
        <Text style={styles.insightTitle}>Relationship Dynamics:</Text>
        <Text style={styles.insightText}>
          • Your alignment is growing stronger over time
          • Natural agreement occurs when values align
          • Differences provide opportunities for growth
        </Text>
      </View>
    </Card>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Alignment</Text>
        <Text style={styles.subtitle}>Your alignment with Sallie</Text>
      </View>

      {renderOverallAlignment()}
      {renderAlignmentMoments()}
      {renderAlignmentPatterns()}
      {renderAlignmentInsights()}
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
  overallAlignmentContainer: {
    alignItems: 'center',
    padding: 20,
  },
  overallProgressBar: {
    width: '100%',
    marginBottom: 10,
  },
  overallAlignmentText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  overallAlignmentDescription: {
    fontSize: 14,
    color: '#666',
  },
  momentsList: {
    maxHeight: 300,
  },
  momentItem: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 10,
    marginBottom: 5,
  },
  momentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  momentType: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  momentTime: {
    fontSize: 12,
    color: '#666',
  },
  momentThoughts: {
    marginBottom: 10,
  },
  thoughtLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  userThought: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  sallieThought: {
    fontSize: 14,
    color: '#6200ee',
    marginBottom: 5,
  },
  momentFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  momentProgressBar: {
    flex: 1,
  },
  momentScore: {
    fontSize: 12,
    color: '#666',
  },
  patternsList: {
    maxHeight: 200,
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
    marginBottom: 5,
  },
  patternInfo: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2,
  },
  patternProgressBar: {
    marginBottom: 5,
  },
  analyzeButton: {
    marginTop: 10,
  },
  insightsContainer: {
    gap: 15,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  insightText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
  },
});
