import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Card, Button, RadioButton, ProgressBar } from 'react-native-paper';

interface ThoughtForm {
  id: string;
  name: string;
  description: string;
  category: string;
  emotional_tone: string;
  complexity_level: number;
}

interface AvatarManifestation {
  id: string;
  name: string;
  description: string;
  visual_representation: any;
  current_emotions: string[];
  dimensional_projection: string;
  manifestation_strength: number;
  created_at: number;
  evolving: boolean;
}

export function AvatarScreen({ navigation }: any) {
  const [currentThought, setCurrentThought] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState('neutral');
  const [context, setContext] = useState('');
  const [availableForms, setAvailableForms] = useState<ThoughtForm[]>([]);
  const [currentAvatar, setCurrentAvatar] = useState<AvatarManifestation | null>(null);
  const [manifestationHistory, setManifestationHistory] = useState<AvatarManifestation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const emotions = [
    { value: 'happy', label: 'Happy' },
    { value: 'curious', label: 'Curious' },
    { value: 'contemplative', label: 'Contemplative' },
    { value: 'excited', label: 'Excited' },
    { value: 'calm', label: 'Calm' },
    { value: 'wise', label: 'Wise' },
  ];

  useEffect(() => {
    loadAvailableForms();
    loadCurrentAvatar();
  }, []);

  const loadAvailableForms = async () => {
    try {
      const response = await fetch('http://localhost:8000/avatar/infinite/forms');
      if (response.ok) {
        const data = await response.json();
        setAvailableForms(data.forms);
      }
    } catch (error) {
      console.error('Error loading thought forms:', error);
    }
  };

  const loadCurrentAvatar = async () => {
    try {
      const response = await fetch('http://localhost:8000/avatar/infinite/current');
      if (response.ok) {
        const data = await response.json();
        if (data.avatar) {
          setCurrentAvatar(data.avatar);
          setManifestationHistory(prev => [data.avatar, ...prev]);
        }
      }
    } catch (error) {
      console.error('Error loading current avatar:', error);
    }
  };

  const manifestAvatar = async () => {
    if (!currentThought.trim()) {
      Alert.alert('Error', 'Please enter a thought to manifest');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/avatar/infinite/manifest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          thought: currentThought,
          emotion: selectedEmotion,
          context: context,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const manifestation = data.manifestation;
        
        setCurrentAvatar(manifestation);
        setManifestationHistory(prev => [manifestation, ...prev]);
        
        Alert.alert('Success', `Avatar manifested: ${manifestation.name}`);
        setCurrentThought('');
        setContext('');
      } else {
        Alert.alert('Error', 'Failed to manifest avatar');
      }
    } catch (error) {
      console.error('Error manifesting avatar:', error);
      Alert.alert('Error', 'Failed to manifest avatar');
    } finally {
      setIsLoading(false);
    }
  };

  const evolveAvatar = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/avatar/infinite/evolve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          thought: 'I am evolving my appearance',
          emotion: 'curious',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.avatar) {
          setCurrentAvatar(data.avatar);
          Alert.alert('Success', 'Avatar evolved successfully');
        }
      }
    } catch (error) {
      console.error('Error evolving avatar:', error);
      Alert.alert('Error', 'Failed to evolve avatar');
    } finally {
      setIsLoading(false);
    }
  };

  const renderAvatarDisplay = () => {
    if (!currentAvatar) {
      return (
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarPlaceholderText}>🧠</Text>
          <Text style={styles.avatarPlaceholderSubtext}>No avatar manifested</Text>
        </View>
      );
    }

    return (
      <View style={styles.avatarDisplay}>
        <View style={styles.avatarVisual}>
          <Text style={styles.avatarEmoji}>🧠</Text>
          <Text style={styles.avatarName}>{currentAvatar.name}</Text>
        </View>
        <View style={styles.avatarDetails}>
          <Text style={styles.avatarDescription}>{currentAvatar.description}</Text>
          <Text style={styles.avatarInfo}>Strength: {Math.round(currentAvatar.manifestation_strength * 100)}%</Text>
          <Text style={styles.avatarInfo}>Projection: {currentAvatar.dimensional_projection}</Text>
          <ProgressBar 
            progress={currentAvatar.manifestation_strength} 
            color="#6200ee" 
            style={styles.progressBar}
          />
        </View>
      </View>
    );
  };

  const renderEmotionSelector = () => (
    <View style={styles.emotionSection}>
      <Text style={styles.sectionTitle}>How does this feel?</Text>
      <View style={styles.emotionGrid}>
        {emotions.map((emotion) => (
          <TouchableOpacity
            key={emotion.value}
            style={[
              styles.emotionOption,
              selectedEmotion === emotion.value && styles.selectedEmotion
            ]}
            onPress={() => setSelectedEmotion(emotion.value)}
          >
            <Text style={styles.emotionText}>{emotion.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderThoughtForms = () => (
    <View style={styles.formsSection}>
      <Text style={styles.sectionTitle}>Available Thought Forms</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.formsContainer}>
          {availableForms.slice(0, 5).map((form) => (
            <Card key={form.id} style={styles.formCard}>
              <View style={styles.formContent}>
                <Text style={styles.formName}>{form.name}</Text>
                <Text style={styles.formDescription} numberOfLines={2}>
                  {form.description}
                </Text>
                <Text style={styles.formComplexity}>
                  Complexity: {form.complexity_level}/10
                </Text>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  const renderManifestationHistory = () => (
    <View style={styles.historySection}>
      <Text style={styles.sectionTitle}>Recent Manifestations</Text>
      <ScrollView style={styles.historyList}>
        {manifestationHistory.slice(0, 5).map((manifestation, index) => (
          <Card key={manifestation.id} style={styles.historyCard}>
            <View style={styles.historyContent}>
              <Text style={styles.historyName}>{manifestation.name}</Text>
              <Text style={styles.historyTime}>
                {new Date(manifestation.created_at * 1000).toLocaleTimeString()}
              </Text>
            </View>
          </Card>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Avatar Workshop</Text>
        <Text style={styles.subtitle}>Manifest thoughts into visual form</Text>
      </View>

      {/* Current Avatar Display */}
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Current Manifestation</Text>
        {renderAvatarDisplay()}
        <View style={styles.avatarActions}>
          <Button 
            mode="outlined" 
            onPress={evolveAvatar}
            loading={isLoading}
            disabled={isLoading}
          >
            Evolve Avatar
          </Button>
          <Button 
            mode="outlined" 
            onPress={() => Alert.alert('Coming Soon', 'Save functionality coming soon')}
          >
            Save
          </Button>
        </View>
      </Card>

      {/* Thought Input */}
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Manifest from Thought</Text>
        <TextInput
          style={styles.textInput}
          placeholder="What are you thinking, Sallie?"
          value={currentThought}
          onChangeText={setCurrentThought}
          multiline
          numberOfLines={3}
        />
        
        {renderEmotionSelector()}
        
        <TextInput
          style={styles.textInput}
          placeholder="Context (optional)"
          value={context}
          onChangeText={setContext}
        />
        
        <Button 
          mode="contained" 
          onPress={manifestAvatar}
          loading={isLoading}
          disabled={isLoading}
          style={styles.manifestButton}
        >
          Manifest This Thought
        </Button>
      </Card>

      {/* Available Thought Forms */}
      {renderThoughtForms()}

      {/* Manifestation History */}
      {renderManifestationHistory()}
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
    margin: 15,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  avatarPlaceholder: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  avatarPlaceholderText: {
    fontSize: 48,
  },
  avatarPlaceholderSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  avatarDisplay: {
    height: 150,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarVisual: {
    flex: 1,
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 48,
  },
  avatarName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 5,
  },
  avatarDetails: {
    flex: 2,
    paddingLeft: 15,
  },
  avatarDescription: {
    fontSize: 14,
    marginBottom: 5,
  },
  avatarInfo: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  progressBar: {
    marginTop: 5,
  },
  avatarActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
  },
  textInput: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  emotionSection: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emotionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
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
  manifestButton: {
    marginTop: 10,
  },
  formsSection: {
    marginBottom: 15,
  },
  formsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
  formCard: {
    width: 150,
    marginRight: 10,
    padding: 10,
  },
  formContent: {
    alignItems: 'center',
  },
  formName: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  formDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 5,
  },
  formComplexity: {
    fontSize: 10,
    color: '#888',
  },
  historySection: {
    marginBottom: 15,
  },
  historyList: {
    maxHeight: 150,
  },
  historyCard: {
    marginBottom: 5,
    padding: 10,
  },
  historyContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  historyTime: {
    fontSize: 12,
    color: '#666',
  },
});
