import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDesign } from '../hooks/useDesign';

interface MotionPattern {
  id: string;
  type: string;
  style: string;
  duration: number;
  confidence: number;
  keyframes: number;
  created_at: string;
}

interface MotionAnalysis {
  id: string;
  motion_type: string;
  confidence: number;
  emotions: string[];
  context: string;
  timestamp: string;
}

export function MotionAIScreen() {
  const navigation = useNavigation();
  const { tokens, theme, emotionalState, setEmotionalState } = useDesign();
  const styles = createMotionStyles(theme, emotionalState);
  const [activeTab, setActiveTab] = useState<'analyze' | 'generate' | 'patterns'>('analyze');
  const [motionData, setMotionData] = useState<MotionPattern[]>([]);
  const [analyses, setAnalyses] = useState<MotionAnalysis[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const fadeAnim = new Animated.Value(0);
  const { width, height } = Dimensions.get('window');

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleAnalyzeMotion = async () => {
    setIsAnalyzing(true);
    try {
      // Simulate motion analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newAnalysis: MotionAnalysis = {
        id: `motion_${Date.now()}`,
        motion_type: 'dance',
        confidence: 0.85,
        emotions: ['joy', 'energy', 'grace'],
        context: 'Performance analysis',
        timestamp: new Date().toISOString()
      };
      
      setAnalyses([newAnalysis, ...analyses]);
    } catch (error) {
      console.error('Motion analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateMotion = async () => {
    setIsGenerating(true);
    try {
      // Simulate motion generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const newPattern: MotionPattern = {
        id: `pattern_${Date.now()}`,
        type: 'dance',
        style: 'stylized',
        duration: 10.0,
        confidence: 0.9,
        keyframes: 3,
        created_at: new Date().toISOString()
      };
      
      setMotionData([newPattern, ...motionData]);
    } catch (error) {
      console.error('Motion generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const renderTabButton = (tab: 'analyze' | 'generate' | 'patterns', title: string) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        activeTab === tab && styles.activeTabButton
      ]}
      onPress={() => setActiveTab(tab)}
    >
      <Text style={[
        styles.tabButtonText,
        activeTab === tab && styles.activeTabButtonText
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderAnalyzeTab = () => (
    <ScrollView style={styles.tabContent}>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={handleAnalyzeMotion}
        disabled={isAnalyzing}
      >
        <Text style={styles.actionButtonText}>
          {isAnalyzing ? 'Analyzing...' : 'Analyze Motion'}
        </Text>
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Motion Analyses</Text>
        {analyses.map((analysis, index) => (
          <View key={analysis.id} style={styles.analysisCard}>
            <Text style={styles.analysisType}>{analysis.motion_type}</Text>
            <Text style={styles.analysisConfidence}>
              Confidence: {Math.round(analysis.confidence * 100)}%
            </Text>
            <Text style={styles.analysisEmotions}>
              Emotions: {analysis.emotions.join(', ')}
            </Text>
            <Text style={styles.analysisContext}>{analysis.context}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderGenerateTab = () => (
    <ScrollView style={styles.tabContent}>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={handleGenerateMotion}
        disabled={isGenerating}
      >
        <Text style={styles.actionButtonText}>
          {isGenerating ? 'Generating...' : 'Generate Motion'}
        </Text>
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Generated Patterns</Text>
        {motionData.map((pattern, index) => (
          <View key={pattern.id} style={styles.patternCard}>
            <Text style={styles.patternType}>{pattern.type}</Text>
            <Text style={styles.patternStyle}>{pattern.style}</Text>
            <Text style={styles.patternDuration}>
              Duration: {pattern.duration}s
            </Text>
            <Text style={styles.patternConfidence}>
              Confidence: {Math.round(pattern.confidence * 100)}%
            </Text>
            <Text style={styles.patternKeyframes}>
              Keyframes: {pattern.keyframes}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderPatternsTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Motion Patterns Library</Text>
        <Text style={styles.patternDescription}>
          Browse and manage motion patterns for various activities.
        </Text>
        
        <View style={styles.patternLibrary}>
          {['Dance', 'Sports', 'Gestures', 'Expressions', 'Locomotion'].map((type) => (
            <TouchableOpacity key={type} style={styles.patternTypeCard}>
              <Text style={styles.patternTypeTitle}>{type}</Text>
              <Text style={styles.patternTypeDescription}>
                {type.toLowerCase()} motion patterns
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Motion AI</Text>
          <Text style={styles.subtitle}>Analyze and generate human-like motion</Text>
        </View>

        <View style={styles.tabContainer}>
          {renderTabButton('analyze', 'Analyze')}
          {renderTabButton('generate', 'Generate')}
          {renderTabButton('patterns', 'Patterns')}
        </View>

        {activeTab === 'analyze' && renderAnalyzeTab()}
        {activeTab === 'generate' && renderGenerateTab()}
        {activeTab === 'patterns' && renderPatternsTab()}
      </Animated.View>
    </SafeAreaView>
  );
}

const createMotionStyles = (theme: any, emotionalState: string) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    margin: 20,
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: theme.primary,
  },
  tabButtonText: {
    fontSize: 14,
    color: theme.textSecondary,
    fontWeight: '500',
  },
  activeTabButtonText: {
    color: theme.onPrimary,
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  actionButton: {
    backgroundColor: theme.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  actionButtonText: {
    color: theme.onPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 12,
  },
  analysisCard: {
    backgroundColor: theme.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  analysisType: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 4,
  },
  analysisConfidence: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 4,
  },
  analysisEmotions: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 4,
  },
  analysisContext: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  patternCard: {
    backgroundColor: theme.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  patternType: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 4,
  },
  patternStyle: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 4,
  },
  patternDuration: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 4,
  },
  patternConfidence: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 4,
  },
  patternKeyframes: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  patternDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  patternLibrary: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  patternTypeCard: {
    width: '48%',
    backgroundColor: theme.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  patternTypeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 4,
  },
  patternTypeDescription: {
    fontSize: 12,
    color: theme.textSecondary,
    textAlign: 'center',
  },
});
