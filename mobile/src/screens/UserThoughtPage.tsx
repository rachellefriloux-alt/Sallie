import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Card, Button, ProgressBar } from 'react-native-paper';

interface UserThought {
  id: string;
  content: string;
  timestamp: number;
  type: 'thought' | 'feeling' | 'insight' | 'goal';
  intensity: number;
  tags: string[];
}

interface UserFeeling {
  id: string;
  emotion: string;
  intensity: number;
  timestamp: number;
  triggers: string[];
  context: string;
}

interface UserPattern {
  id: string;
  name: string;
  description: string;
  frequency: number;
  last_seen: number;
  confidence: number;
}

export function UserThoughtPage({ navigation }: any) {
  const [currentThought, setCurrentThought] = useState('');
  const [thoughtType, setThoughtType] = useState<'thought' | 'feeling' | 'insight' | 'goal'>('thought');
  const [intensity, setIntensity] = useState(0.5);
  const [tags, setTags] = useState<string[]>([]);
  const [userThoughts, setUserThoughts] = useState<UserThought[]>([]);
  const [userFeelings, setUserFeelings] = useState<UserFeeling[]>([]);
  const [userPatterns, setUserPatterns] = useState<UserPattern[]>([]);

  const emotions = [
    { value: 'happy', label: 'Happy' },
    { value: 'curious', label: 'Curious' },
    { value: 'contemplative', label: 'Contemplative' },
    { value: 'excited', label: 'Excited' },
    { value: 'calm', label: 'Calm' },
    { value: 'frustrated', label: 'Frustrated' },
    { value: 'anxious', label: 'Anxious' },
    { value: 'confident', label: 'Confident' },
    { value: 'grateful', label: 'Grateful' },
    { value: 'thoughtful', label: 'Thoughtful' },
  ];

  const thoughtTypes = [
    { value: 'thought', label: 'Thought' },
    { value: 'feeling', label: 'Feeling' },
    {Value: 'insight', label: 'Insight' },
    { value: 'goal', label: 'Goal' },
  ];

  const logThought = () => {
    if (!currentThought.trim()) {
      Alert.alert('Error', 'Please enter a thought');
      return;
    }

    const newThought: UserThought = {
      id: `user_thought_${Date.now()}`,
      content: currentThought,
      timestamp: Date.now(),
      type: thoughtType,
      intensity: intensity,
      tags: tags,
    };

    setUserThoughts(prev => [newThought, ...prev.slice(0, 99)]);
    
    // Analyze for patterns
    analyzePatterns(newThought);
    
    // Clear form
    setCurrentThought('');
    setIntensity(0.5);
    setTags([]);
  };

  const logFeeling = (emotion: string, intensity: number) => {
    const newFeeling: UserFeeling = {
      id: `user_feeling_${Date.now()}`,
      emotion: emotion,
      intensity: intensity,
      timestamp: Date.now(),
      triggers: [],
      context: 'manual',
    };

    setUserFeelings(prev => [newFeeling, ...prev.slice(0, 99)]);
  };

  const analyzePatterns = (thought: UserThought) => {
    // Simple pattern detection
    const content = thought.content.toLowerCase();
    
    // Check for recurring themes
    const themes = ['work', 'family', 'health', 'learning', 'creativity', 'relationships'];
    const foundThemes = themes.filter(theme => content.includes(theme));
    
    if (foundThemes.length > 0) {
      foundThemes.forEach(theme => {
        const existingPattern = userPatterns.find(p => p.name === theme);
        if (existingPattern) {
          // Update frequency
          const updatedPattern = {
            ...existingPattern,
            frequency: existingPattern.frequency + 1,
            last_seen: Date.now(),
            confidence: Math.min(1.0, existingPattern.confidence + 0.1),
          };
          setUserPatterns(prev => 
            prev.map(p => p.name === theme ? updatedPattern : p)
          );
        } else {
          // Create new pattern
          const newPattern: UserPattern = {
            id: `pattern_${theme}_${Date.now()}`,
            name: theme,
            description: `Recurring theme about ${theme}`,
            frequency: 1,
            last_seen: Date.now(),
            confidence: 0.1,
          };
          setUserPatterns(prev => [...prev, newPattern]);
        }
      });
    }
  };

  const renderThoughtInput = () => (
    <Card style={styles.card}>
      <Text style={styles.cardTitle}>Log Your Thought</Text>
      
      <Text style={styles.sectionTitle}>Type:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
        {thoughtTypes.map((type) => (
          <TouchableOpacity
            key={type.value}
            style={[
              styles.typeOption,
              thoughtType === type.value && styles.selectedType
            ]}
            onPress={() => setThoughtType(type.value)}
          >
            <Text style={styles.typeText}>{type.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TextInput
        style={styles.textInput}
        placeholder="What are you thinking right now?"
        value={currentThought}
        onChangeText={setCurrentThought}
        multiline
        numberOfLines={4}
      />
      
      <Text style={styles.sectionTitle}>Intensity:</Text>
      <Slider
        value={intensity}
        onValue={setIntensity}
        minimum={0}
        maximum={1}
        step={0.1}
        style={styles.slider}
      />
      
      <Text style={styles.sectionTitle}>Tags:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagScroll}>
        {['important', 'work', 'personal', 'creative', 'learning', 'health', 'relationship', 'goal'].map((tag) => (
          <TouchableOpacity
            key={tag}
            style={[
              styles.tagOption,
              tags.includes(tag) && styles.selectedTag
            ]}
            onPress={() => {
              setTags(prev => 
                tags.includes(tag) 
                  ? prev.filter(t => t !== tag)
                  : [...prev, tag]
              );
            }}
          >
            <Text style={styles.tagText}>{tag}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <Button 
        mode="contained" 
        onPress={logThought}
        style={styles.logButton}
      >
        Log Thought
      </Button>
    </Card>
  );

  const renderFeelings = () => (
    <Card style={styles.card}>
      <Text style={styles.cardTitle}>Your Feelings</Text>
      
      <View style={styles.emotionGrid}>
        {emotions.map((emotion) => (
          <TouchableOpacity
            key={emotion.value}
            style={[
              styles.emotionOption,
              userFeelings.some(f => f.emotion === emotion.value) && styles.selectedEmotion
            ]}
            onPress={() => logFeeling(emotion.value, 0.7)}
          >
            <Text style={styles.emotionText}>{emotion.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <Text style={styles.sectionTitle}>Recent Feelings:</Text>
      <ScrollView style={styles.feelingList}>
        {userFeelings.slice(0, 5).map((feeling) => (
          <View key={feeling.id} style={styles.feelingItem}>
            <Text style={styles.feelingEmotion}>{feeling.emotion}</Text>
            <Text style={styles.feelingTime}>
              {new Date(feeling.timestamp).toLocaleTimeString()}
            </Text>
            <ProgressBar 
              progress={feeling.intensity} 
              color="#6200ee" 
              style={styles.progressBar}
            />
          </View>
        ))}
      </ScrollView>
    </Card>
  );

  const renderPatterns = () => (
    <Card style={styles.card}>
      <Text style={styles.cardTitle}>Your Patterns</Text>
      
      <Text style={styles.sectionTitle}>Detected Patterns:</Text>
      <ScrollView style={styles.patternList}>
        {userPatterns.slice(0, 5).map((pattern) => (
          <View key={pattern.id} style={styles.patternItem}>
            <Text style={styles.patternName}>{pattern.name}</Text>
            <Text style={styles.patternDescription}>{pattern.description}</Text>
            <Text style={patternInfo}>
              Frequency: {pattern.frequency} | Confidence: {Math.round(pattern.confidence * 100)}%
            </Text>
            <ProgressBar 
              progress={pattern.confidence} 
              color="#4caf50" 
              style={styles.progressBar}
            />
          </View>
        ))}
      </ScrollView>
      
      <Button 
        mode="outlined" 
        onPress={() => Alert.alert('Coming Soon', 'Pattern analysis coming soon')}
      >
        Analyze Patterns
      </Button>
    </Card>
  );

  const renderRecentThoughts = () => (
    <Card style={styles.card}>
      <Text style={styles.cardTitle}>Recent Thoughts</Text>
      <ScrollView style={styles.thoughtList}>
        {userThoughts.slice(0, 10).map((thought) => (
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
                {new Date(thought.timestamp).toLocaleTimeString()}
              </Text>
            </View>
            {thought.tags.length > 0 && (
              <View style={styles.thoughtTags}>
                {thought.tags.map((tag, index) => (
                  <Text key={index} style={styles.tag}>#{tag}</Text>
                ))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </Card>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Mind</Text>
        <Text style={styles.subtitle}>Your private thought and feeling space</Text>
      </View>

      {renderThoughtInput()}
      {renderFeelings()}
      {renderPatterns()}
      {renderRecentThoughts()}
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  typeScroll: {
    marginBottom: 10,
  },
  typeOption: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    marginRight: 10,
  },
  selectedType: {
    backgroundColor: '#6200ee',
  },
  selectedTag: {
    backgroundColor: '#6200ee',
  },
  typeText: {
    fontSize: 14,
    color: '#333',
  },
  textInput: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  slider: {
    marginBottom: 15,
  },
  tagScroll: {
    marginBottom: 10,
  },
  tagOption: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: '#e0e0e0',
    marginRight: 5,
  },
  selectedTag: {
    backgroundColor: '#6200ee',
  },
  tagText: {
    fontSize: 12,
    color: '#333',
  },
  logButton: {
    marginTop: 10,
  },
  emotionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 15,
  },
  emotionOption: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
  selectedEmotion: {
    backgroundColor: '#6200ee',
  },
  emotionText: {
    fontSize: 14,
    color: '#333',
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
  progressBar: {
    marginBottom: 5,
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
  patternInfo: {
    fontSize: 10,
    color: '#666',
    marginBottom: 5,
  },
  thoughtList: {
    maxHeight: 200,
  },
  thoughtItem: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 10,
    marginBottom: 5,
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
    alignItems: 'center',
    gap: 10,
  },
  thoughtTime: {
    fontSize: 12,
    color: '#666',
  },
  thoughtTags: {
    flexDirection: 'row',
    gap: 5,
  },
  tag: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginRight: 5,
  },
});
