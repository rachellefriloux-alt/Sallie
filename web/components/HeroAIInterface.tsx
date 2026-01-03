import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, Dimensions } from 'react-native';
import { useDesign } from './DesignSystem';

interface HeroProfile {
  id: string;
  name: string;
  archetype: string;
  primary_traits: string[];
  secondary_traits: string[];
  skills: string[];
  strengths: string[];
  weaknesses: string[];
  motivations: string[];
  fears: string[];
  values: string[];
  personality_type: string;
  moral_alignment: string;
  confidence_score: number;
  created_at: string;
}

interface HeroJourney {
  id: string;
  hero_id: string;
  title: string;
  description: string;
  stages: any[];
  challenges: any[];
  allies: string[];
  enemies: string[];
  rewards: string[];
  lessons: string[];
  current_stage: string;
  completion_percentage: number;
  created_at: string;
}

interface HeroNarrative {
  id: string;
  hero_id: string;
  title: string;
  genre: string;
  theme: string;
  plot_summary: string;
  moral_lesson: string;
  created_at: string;
}

export function HeroAIInterface({ navigation }: any) {
  const { tokens, theme, emotionalState, setEmotionalState } = useDesign();
  const styles = createHeroStyles(theme, emotionalState);
  const [activeTab, setActiveTab] = useState<'profiles' | 'journeys' | 'narratives'>('profiles');
  const [profiles, setProfiles] = useState<HeroProfile[]>([]);
  const [journeys, setJourneys] = useState<HeroJourney[]>([]);
  const [narratives, setNarratives] = useState<HeroNarrative[]>([]);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [isCreatingJourney, setIsCreatingJourney] = useState(false);
  
  const fadeAnim = new Animated.Value(0);
  const { width, height } = Dimensions.get('window');

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleCreateHeroProfile = async () => {
    setIsCreatingProfile(true);
    try {
      // Simulate hero profile creation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newProfile: HeroProfile = {
        id: `profile_${Date.now()}`,
        name: 'AI-Generated Hero',
        archetype: 'warrior',
        primary_traits: ['courage', 'strength', 'honor'],
        secondary_traits: ['wisdom', 'compassion'],
        skills: ['combat', 'strategy', 'leadership'],
        strengths: ['bravery', 'determination', 'loyalty'],
        weaknesses: ['impatience', 'stubbornness'],
        motivations: ['justice', 'protection', 'honor'],
        fears: ['defeat', 'dishonor', 'weakness'],
        values: ['honor', 'courage', 'justice', 'loyalty'],
        personality_type: 'ISTP',
        moral_alignment: 'Lawful Good',
        confidence_score: 0.85,
        created_at: new Date().toISOString()
      };
      
      setProfiles([newProfile, ...profiles]);
    } catch (error) {
      console.error('Hero profile creation failed:', error);
    } finally {
      setIsCreatingProfile(false);
    }
  };

  const handleCreateHeroJourney = async () => {
    setIsCreatingJourney(true);
    try {
      // Simulate hero journey creation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const newJourney: HeroJourney = {
        id: `journey_${Date.now()}`,
        hero_id: profiles[0]?.id || 'default',
        title: 'The Hero\'s Journey',
        description: 'A classic hero\'s journey narrative',
        stages: [
          { name: 'Ordinary World', description: 'The hero\'s normal life' },
          { name: 'Call to Adventure', description: 'The journey begins' },
          { name: 'Trials', description: 'Facing challenges' },
          { name: 'Transformation', description: 'Hero\'s growth' },
          { name: 'Return', description: 'Coming home changed' }
        ],
        challenges: [
          { name: 'The Dragon', description: 'Facing the ultimate challenge' },
          { name: 'Self-Doubt', description: 'Overcoming inner obstacles' }
        ],
        allies: ['Mentor', 'Companions'],
        enemies: ['Shadow', 'Antagonist'],
        rewards: ['Wisdom', 'Love', 'Victory'],
        lessons: ['Courage', 'Humility', 'Wisdom'],
        current_stage: 'Call to Adventure',
        completion_percentage: 20,
        created_at: new Date().toISOString()
      };
      
      setJourneys([newJourney, ...journeys]);
    } catch (error) {
      console.error('Hero journey creation failed:', error);
    } finally {
      setIsCreatingJourney(false);
    }
  };

  const handleGenerateNarrative = async () => {
    try {
      // Simulate narrative generation
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      const newNarrative: HeroNarrative = {
        id: `narrative_${Date.now()}`,
        hero_id: profiles[0]?.id || 'default',
        title: 'Hero\'s Tale',
        genre: 'fantasy',
        theme: 'courage and transformation',
        plot_summary: 'A young hero embarks on an epic journey to save their kingdom from darkness.',
        moral_lesson: 'True courage comes from within, not from external validation.',
        created_at: new Date().toISOString()
      };
      
      setNarratives([newNarrative, ...narratives]);
    } catch (error) {
      console.error('Narrative generation failed:', error);
    }
  };

  const renderTabButton = (tab: 'profiles' | 'journeys' | 'narratives', title: string) => (
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

  const renderProfilesTab = () => (
    <ScrollView style={styles.tabContent}>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={handleCreateHeroProfile}
        disabled={isCreatingProfile}
      >
        <Text style={styles.actionButtonText}>
          {isCreatingProfile ? 'Creating...' : 'Create Hero Profile'}
        </Text>
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hero Profiles</Text>
        {profiles.map((profile, index) => (
          <View key={profile.id} style={styles.profileCard}>
            <Text style={styles.profileName}>{profile.name}</Text>
            <Text style={styles.profileArchetype}>{profile.archetype}</Text>
            
            <View style={styles.profileSection}>
              <Text style={styles.sectionSubtitle}>Primary Traits</Text>
              <View style={styles.traitsContainer}>
                {profile.primary_traits.map((trait, idx) => (
                  <Text key={idx} style={styles.trait}>{trait}</Text>
                ))}
              </View>
            </View>
            
            <View style={styles.profileSection}>
              <Text style={styles.sectionSubtitle}>Skills</Text>
              <View style={styles.traitsContainer}>
                {profile.skills.map((skill, idx) => (
                  <Text key={idx} style={styles.trait}>{skill}</Text>
                ))}
              </View>
            </View>
            
            <View style={styles.profileSection}>
              <Text style={styles.sectionSubtitle}>Motivations</Text>
              <View style={styles.traitsContainer}>
                {profile.motivations.map((motivation, idx) => (
                  <Text key={idx} style={styles.trait}>{motivation}</Text>
                ))}
              </View>
            </View>
            
            <Text style={styles.profilePersonality}>
              {profile.personality_type} • {profile.moral_alignment}
            </Text>
            <Text style={styles.profileConfidence}>
              Confidence: {Math.round(profile.confidence_score * 100)}%
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderJourneysTab = () => (
    <ScrollView style={styles.tabContent}>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={handleCreateHeroJourney}
        disabled={isCreatingJourney}
      >
        <Text style={styles.actionButtonText}>
          {isCreatingJourney ? 'Creating...' : 'Create Hero Journey'}
        </Text>
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hero Journeys</Text>
        {journeys.map((journey, index) => (
          <View key={journey.id} style={styles.journeyCard}>
            <Text style={styles.journeyTitle}>{journey.title}</Text>
            <Text style={styles.journeyDescription}>{journey.description}</Text>
            
            <View style={styles.journeyProgress}>
              <Text style={styles.progressText}>
                Progress: {journey.completion_percentage}%
              </Text>
              <Text style={styles.currentStage}>
                Current: {journey.current_stage}
              </Text>
            </View>
            
            <View style={styles.journeySection}>
              <Text style={styles.sectionSubtitle}>Stages</Text>
              {journey.stages.map((stage, idx) => (
                <Text key={idx} style={styles.stage}>
                  {stage.name}: {stage.description}
                </Text>
              ))}
            </View>
            
            <View style={styles.journeySection}>
              <Text style={styles.sectionSubtitle}>Lessons Learned</Text>
              {journey.lessons.map((lesson, idx) => (
                <Text key={idx} style={styles.lesson}>{lesson}</Text>
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderNarrativesTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hero Narratives</Text>
        <Text style={styles.narrativeDescription}>
          AI-generated stories and narratives featuring your hero profiles.
        </Text>
        
        {narratives.map((narrative, index) => (
          <View key={narrative.id} style={styles.narrativeCard}>
            <Text style={styles.narrativeTitle}>{narrative.title}</Text>
            <Text style={styles.narrativeGenre}>{narrative.genre}</Text>
            <Text style={styles.narrativeTheme}>Theme: {narrative.theme}</Text>
            
            <View style={styles.narrativeSection}>
              <Text style={styles.sectionSubtitle}>Plot Summary</Text>
              <Text style={styles.plotSummary}>{narrative.plot_summary}</Text>
            </View>
            
            <View style={styles.narrativeSection}>
              <Text style={styles.sectionSubtitle}>Moral Lesson</Text>
              <Text style={styles.moralLesson}>{narrative.moral_lesson}</Text>
            </View>
            
            <TouchableOpacity
              style={styles.generateButton}
              onPress={handleGenerateNarrative}
            >
              <Text style={styles.generateButtonText}>Generate New Narrative</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Hero AI</Text>
        <Text style={styles.subtitle}>Hero analysis and narrative generation</Text>
      </View>

      <View style={styles.tabContainer}>
        {renderTabButton('profiles', 'Profiles')}
        {renderTabButton('journeys', 'Journeys')}
        {renderTabButton('narratives', 'Narratives')}
      </View>

      {activeTab === 'profiles' && renderProfilesTab()}
      {activeTab === 'journeys' && renderJourneysTab()}
      {activeTab === 'narratives' && renderNarrativesTab()}
    </Animated.View>
  );
}

const createHeroStyles = (theme: any, emotionalState: string) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
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
  profileCard: {
    backgroundColor: theme.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.textPrimary,
    marginBottom: 4,
  },
  profileArchetype: {
    fontSize: 16,
    color: theme.primary,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  profileSection: {
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 6,
  },
  traitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  trait: {
    backgroundColor: theme.background,
    color: theme.textSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
    fontSize: 12,
  },
  profilePersonality: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 4,
  },
  profileConfidence: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  journeyCard: {
    backgroundColor: theme.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  journeyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.textPrimary,
    marginBottom: 4,
  },
  journeyDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 12,
  },
  journeyProgress: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  progressText: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  currentStage: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  journeySection: {
    marginBottom: 12,
  },
  stage: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 4,
  },
  lesson: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 4,
    fontStyle: 'italic',
  },
  narrativeDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  narrativeCard: {
    backgroundColor: theme.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  narrativeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.textPrimary,
    marginBottom: 4,
  },
  narrativeGenre: {
    fontSize: 14,
    color: theme.primary,
    marginBottom: 4,
  },
  narrativeTheme: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 12,
  },
  narrativeSection: {
    marginBottom: 12,
  },
  plotSummary: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  moralLesson: {
    fontSize: 14,
    color: theme.textSecondary,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  generateButton: {
    backgroundColor: theme.secondary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  generateButtonText: {
    color: theme.onSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
});
