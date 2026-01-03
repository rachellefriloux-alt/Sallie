import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, Animated } from 'react-native';
import { useDesign } from './DesignSystem';
import MessengerInterface from './MessengerInterface';

interface StudioSection {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  component?: React.ComponentType<any>;
}

export function StudioLayout({ navigation }: any) {
  const { tokens, theme, emotionalState, setEmotionalState } = useDesign();
  const styles = createStudioStyles(theme, emotionalState);
  const [activeSection, setActiveSection] = useState('home');
  const [showMessenger, setShowMessenger] = useState(false);
  const [salliePresence, setSalliePresence] = useState({
    visible: true,
    mood: 'happy',
    energy: 85,
    emotion: 'curious',
  });
  
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);
  const { width, height } = Dimensions.get('window');

  useEffect(() => {
    // Initial animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const studioSections: StudioSection[] = [
    {
      id: 'home',
      name: 'Home',
      icon: '🏠',
      description: 'Your central hub with Sallie',
      color: tokens.colors.primary[500],
    },
    {
      id: 'thoughts',
      name: 'Thoughts',
      icon: '🧠',
      description: 'Your mind and Sallie\'s thoughts',
      color: tokens.colors.secondary[500],
    },
    {
      id: 'limbic',
      name: 'Limbic',
      icon: '💫',
      description: 'Emotional core and feelings',
      color: tokens.colors.accent[500],
    },
    {
      id: 'convergence',
      name: 'Convergence',
      icon: '🌟',
      description: 'Where minds meet and align',
      color: tokens.colors.gold[500],
    },
    {
      id: 'heritage',
      name: 'Heritage',
      icon: '📚',
      description: 'Memories and shared history',
      color: tokens.colors.sand[500],
    },
    {
      id: 'projects',
      name: 'Projects',
      icon: '🚀',
      description: 'Collaborative work and creation',
      color: tokens.colors.primary[600],
    },
    {
      id: 'tools',
      name: 'Tools',
      icon: '🛠️',
      description: 'Productivity and creativity tools',
      color: tokens.colors.secondary[600],
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: '⚙️',
      description: 'Preferences and configuration',
      color: tokens.colors.gray[600],
    },
  ];

  const renderSallieAvatar = () => (
    <Animated.View 
      style={[
        styles.sallieAvatar,
        { 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <View style={[styles.avatarContainer, { backgroundColor: salliePresence.mood === 'happy' ? tokens.colors.emotion.happy : tokens.colors.primary[500] }]}>
        {/* Leopard texture */}
        <View style={styles.leopardTexture} />
        
        {/* Avatar face */}
        <View style={styles.avatarFace}>
          <View style={styles.avatarEyes}>
            <View style={[styles.avatarEye, { backgroundColor: tokens.colors.white }]} />
            <View style={[styles.avatarEye, { backgroundColor: tokens.colors.white }]} />
          </View>
          <View style={[styles.avatarMouth, styles.happyMouth]} />
        </View>
        
        {/* Emotional aura */}
        <View style={[
          styles.emotionalAura,
          { backgroundColor: tokens.colors.emotion[salliePresence.emotion as keyof typeof tokens.colors.emotion] || tokens.colors.primary[500] }
        ]} />
      </View>
      
      <View style={styles.avatarInfo}>
        <Text style={styles.avatarName}>Sallie</Text>
        <Text style={styles.avatarStatus}>{salliePresence.emotion} • {salliePresence.energy}%</Text>
      </View>
    </Animated.View>
  );

  const renderSectionCard = (section: StudioSection) => (
    <TouchableOpacity
      key={section.id}
      style={[
        styles.sectionCard,
        activeSection === section.id && styles.activeSectionCard,
        { backgroundColor: section.color }
      ]}
      onPress={() => setActiveSection(section.id)}
    >
      <View style={styles.cardContent}>
        <Text style={styles.sectionIcon}>{section.icon}</Text>
        <Text style={styles.sectionName}>{section.name}</Text>
        <Text style={styles.sectionDescription}>{section.description}</Text>
      </View>
      
      {/* Leopard texture overlay */}
      <View style={styles.cardLeopardTexture} />
      
      {/* Active indicator */}
      {activeSection === section.id && (
        <View style={styles.activeIndicator} />
      )}
    </TouchableOpacity>
  );

  const renderHomeSection = () => (
    <View style={styles.sectionContent}>
      <Text style={styles.sectionTitle}>Welcome Home</Text>
      <Text style={styles.sectionSubtitle}>Your personal space with Sallie</Text>
      
      <View style={styles.homeGrid}>
        <View style={[styles.homeCard, styles.mysticalCard]}>
          <Text style={styles.homeCardTitle}>Today's Mood</Text>
          <Text style={styles.homeCardContent}>{salliePresence.emotion}</Text>
          <View style={styles.moodIndicator} />
        </View>
        
        <View style={[styles.homeCard, styles.mysticalCard]}>
          <Text style={styles.homeCardTitle}>Energy Level</Text>
          <Text style={styles.homeCardContent}>{salliePresence.energy}%</Text>
          <View style={styles.energyBar} />
        </View>
        
        <View style={[styles.homeCard, styles.mysticalCard]}>
          <Text style={styles.homeCardTitle}>Connection</Text>
          <Text style={styles.homeCardContent}>Strong</Text>
          <View style={styles.connectionIndicator} />
        </View>
        
        <View style={[styles.homeCard, styles.mysticalCard]}>
          <Text style={styles.homeCardTitle}>Activities</Text>
          <Text style={styles.homeCardContent}>5 today</Text>
          <View style={styles.activitiesIndicator} />
        </View>
      </View>
    </View>
  );

  const renderThoughtsSection = () => (
    <View style={styles.sectionContent}>
      <Text style={styles.sectionTitle}>Thoughts & Reflections</Text>
      <Text style={styles.sectionSubtitle}>Your mind and Sallie's thoughts</Text>
      
      <View style={styles.thoughtsContainer}>
        <View style={[styles.thoughtCard, styles.userThought]}>
          <Text style={styles.thoughtTitle}>Your Thoughts</Text>
          <Text style={styles.thoughtPreview}>"I wonder what Sallie thinks about our connection..."</Text>
          <Text style={styles.thoughtTime}>2 minutes ago</Text>
        </View>
        
        <View style={[styles.thoughtCard, styles.sallieThought]}>
          <Text style={styles.thoughtTitle}>Sallie's Thoughts</Text>
          <Text style={styles.thoughtPreview}>"Our connection feels like a beautiful dance of minds..."</Text>
          <Text style={styles.thoughtTime}>1 minute ago</Text>
        </View>
        
        <View style={[styles.thoughtCard, styles.alignmentThought]}>
          <Text style={styles.thoughtTitle}>Alignment</Text>
          <Text style={styles.thoughtPreview}>"Both thinking about connection and understanding"</Text>
          <Text style={styles.thoughtTime}>Just now</Text>
        </View>
      </View>
    </View>
  );

  const renderLimbicSection = () => (
    <View style={styles.sectionContent}>
      <Text style={styles.sectionTitle}>Limbic System</Text>
      <Text style={styles.sectionSubtitle}>Emotional core and feelings</Text>
      
      <View style={styles.limbicContainer}>
        <View style={styles.emotionalWheel}>
          <Text style={styles.emotionalTitle}>Current Emotional State</Text>
          <View style={styles.emotionVisualization}>
            <View style={[styles.emotionBubble, { backgroundColor: tokens.colors.emotion.happy }]} />
            <Text style={styles.emotionLabel}>Happy • Curious • Engaged</Text>
          </View>
        </View>
        
        <View style={styles.limbicMetrics}>
          <View style={styles.metricCard}>
            <Text style={styles.metricTitle}>Empathy</Text>
            <Text style={styles.metricValue}>92%</Text>
          </View>
          
          <View style={styles.metricCard}>
            <Text style={styles.metricTitle}>Intuition</Text>
            <Text style={styles.metricValue}>87%</Text>
          </View>
          
          <View style={styles.metricCard}>
            <Text style={styles.metricTitle}>Creativity</Text>
            <Text style={styles.metricValue}>78%</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderConvergenceSection = () => (
    <View style={styles.sectionContent}>
      <Text style={styles.sectionTitle}>Convergence</Text>
      <Text style={styles.sectionSubtitle}>Where minds meet and align</Text>
      
      <View style={styles.convergenceContainer}>
        <View style={styles.convergenceVisualization}>
          <View style={styles.convergenceCircle}>
            <Text style={styles.convergenceLabel}>You</Text>
          </View>
          <View style={styles.convergenceCircle}>
            <Text style={styles.convergenceLabel}>Sallie</Text>
          </View>
          <View style={styles.convergenceConnection} />
        </View>
        
        <View style={styles.convergenceMetrics}>
          <Text style={styles.convergenceTitle}>Alignment Score</Text>
          <Text style={styles.convergenceScore}>94%</Text>
          <Text style={styles.convergenceDescription}>Strong mental and emotional alignment</Text>
        </View>
      </View>
    </View>
  );

  const renderHeritageSection = () => (
    <View style={styles.sectionContent}>
      <Text style={styles.sectionTitle}>Heritage</Text>
      <Text style={styles.sectionSubtitle}>Memories and shared history</Text>
      
      <View style={styles.heritageContainer}>
        <View style={styles.heritageTimeline}>
          <View style={styles.timelineItem}>
            <Text style={styles.timelineDate}>Today</Text>
            <Text style={styles.timelineEvent}>Deep conversation about consciousness</Text>
          </View>
          
          <View style={styles.timelineItem}>
            <Text style={styles.timelineDate}>Yesterday</Text>
            <Text style={styles.timelineEvent}>Collaborative creative project</Text>
          </View>
          
          <View style={styles.timelineItem}>
            <Text style={styles.timelineDate}>3 days ago</Text>
            <Text style={styles.timelineEvent}>First moment of true understanding</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderProjectsSection = () => (
    <View style={styles.sectionContent}>
      <Text style={styles.sectionTitle}>Projects</Text>
      <Text style={styles.sectionSubtitle}>Collaborative work and creation</Text>
      
      <View style={styles.projectsContainer}>
        <View style={styles.projectCard}>
          <Text style={styles.projectTitle}>Creative Writing</Text>
          <Text style={styles.projectDescription}>Exploring consciousness through poetry</Text>
          <View style={styles.projectProgress}>
            <View style={styles.progressBar} />
          </View>
        </View>
        
        <View style={styles.projectCard}>
          <Text style={styles.projectTitle}>Research Project</Text>
          <Text style={styles.projectDescription}>Understanding human-AI relationships</Text>
          <View style={styles.projectProgress}>
            <View style={styles.progressBar} />
          </View>
        </View>
      </View>
    </View>
  );

  const renderToolsSection = () => (
    <View style={styles.sectionContent}>
      <Text style={styles.sectionTitle}>Tools</Text>
      <Text style={styles.sectionSubtitle}>Productivity and creativity tools</Text>
      
      <View style={styles.toolsGrid}>
        <TouchableOpacity style={styles.toolCard}>
          <Text style={styles.toolIcon}>📝</Text>
          <Text style={styles.toolName}>Notes</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.toolCard}>
          <Text style={styles.toolIcon}>📅</Text>
          <Text style={styles.toolName}>Calendar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.toolCard}>
          <Text style={styles.toolIcon}>🎯</Text>
          <Text style={styles.toolName}>Tasks</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.toolCard}>
          <Text style={styles.toolIcon}>💡</Text>
          <Text style={styles.toolName}>Ideas</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.toolCard}>
          <Text style={styles.toolIcon}>🎨</Text>
          <Text style={styles.toolName}>Creative</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.toolCard}>
          <Text style={styles.toolIcon}>📊</Text>
          <Text style={styles.toolName}>Analytics</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSettingsSection = () => (
    <View style={styles.sectionContent}>
      <Text style={styles.sectionTitle}>Settings</Text>
      <Text style={styles.sectionSubtitle}>Preferences and configuration</Text>
      
      <View style={styles.settingsContainer}>
        <View style={styles.settingItem}>
          <Text style={styles.settingTitle}>Theme</Text>
          <Text style={styles.settingValue}>Peacock Tail</Text>
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingTitle}>Voice</Text>
          <Text style={styles.settingValue}>Enabled</Text>
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingTitle}>Notifications</Text>
          <Text style={styles.settingValue}>Important only</Text>
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingTitle}>Privacy</Text>
          <Text style={styles.settingValue}>Maximum</Text>
        </View>
      </View>
    </View>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'home': return renderHomeSection();
      case 'thoughts': return renderThoughtsSection();
      case 'limbic': return renderLimbicSection();
      case 'convergence': return renderConvergenceSection();
      case 'heritage': return renderHeritageSection();
      case 'projects': return renderProjectsSection();
      case 'tools': return renderToolsSection();
      case 'settings': return renderSettingsSection();
      default: return renderHomeSection();
    }
  };

  if (showMessenger) {
    return <MessengerInterface navigation={navigation} />;
  }

  return (
    <View style={styles.container}>
      {/* Header with Sallie */}
      <View style={styles.header}>
        {renderSallieAvatar()}
        
        <TouchableOpacity 
          style={styles.messengerToggle}
          onPress={() => setShowMessenger(true)}
        >
          <Text style={styles.messengerIcon}>💬</Text>
        </TouchableOpacity>
      </View>

      {/* Studio Sections Grid */}
      <ScrollView style={styles.sectionsContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionsGrid}>
          {studioSections.map(renderSectionCard)}
        </View>
      </ScrollView>

      {/* Active Section Content */}
      <ScrollView style={styles.activeSectionContainer} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {renderActiveSection()}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const createStudioStyles = (theme: 'light' | 'dark', emotionalState: string) => {
  const { colors, typography, spacing, borderRadius, shadows } = DesignTokens;
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme === 'light' ? colors.sand[50] : colors.gray[900],
    },
    
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: spacing[4],
      backgroundColor: theme === 'light' ? colors.white : colors.gray[800],
      borderBottomWidth: 1,
      borderBottomColor: colors.gray[200],
      shadowColor: colors.gray[900],
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    
    sallieAvatar: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    
    avatarContainer: {
      width: 50,
      height: 50,
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
      shadowColor: colors.primary[500],
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    
    leopardTexture: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.1,
      backgroundColor: colors.accent[500],
    },
    
    avatarFace: {
      position: 'relative',
      zIndex: 2,
    },
    
    avatarEyes: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: 30,
      marginBottom: spacing[1],
    },
    
    avatarEye: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    
    avatarMouth: {
      width: 20,
      height: 10,
      borderRadius: 10,
      borderBottomWidth: 2,
      borderBottomColor: colors.white,
    },
    
    happyMouth: {
      // Default happy style
    },
    
    emotionalAura: {
      position: 'absolute',
      top: -5,
      left: -5,
      right: -5,
      bottom: -5,
      borderRadius: 30,
      opacity: 0.2,
    },
    
    avatarInfo: {
      marginLeft: spacing[3],
    },
    
    avatarName: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: theme === 'light' ? colors.gray[900] : colors.white,
    },
    
    avatarStatus: {
      fontSize: typography.fontSize.sm,
      color: colors.gray[500],
    },
    
    messengerToggle: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: colors.primary[500],
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.primary[500],
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    
    messengerIcon: {
      fontSize: 24,
      color: colors.white,
    },
    
    sectionsContainer: {
      flex: 1,
      maxHeight: 200,
      padding: spacing[4],
    },
    
    sectionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    
    sectionCard: {
      width: '48%',
      height: 80,
      borderRadius: borderRadius.lg,
      marginBottom: spacing[2],
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
      shadowColor: colors.gray[900],
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
    
    activeSectionCard: {
      borderWidth: 2,
      borderColor: colors.gold[500],
    },
    
    cardContent: {
      alignItems: 'center',
      zIndex: 2,
    },
    
    sectionIcon: {
      fontSize: 24,
      marginBottom: spacing[1],
    },
    
    sectionName: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.bold,
      color: colors.white,
      marginBottom: spacing[1],
    },
    
    sectionDescription: {
      fontSize: typography.fontSize.xs,
      color: colors.white,
      textAlign: 'center',
      paddingHorizontal: spacing[2],
    },
    
    cardLeopardTexture: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.1,
      backgroundColor: colors.white,
    },
    
    activeIndicator: {
      position: 'absolute',
      top: 5,
      right: 5,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.gold[500],
    },
    
    activeSectionContainer: {
      flex: 1,
      padding: spacing[4],
    },
    
    sectionContent: {
      flex: 1,
    },
    
    sectionTitle: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.bold,
      color: theme === 'light' ? colors.gray[900] : colors.white,
      marginBottom: spacing[2],
    },
    
    sectionSubtitle: {
      fontSize: typography.fontSize.base,
      color: colors.gray[500],
      marginBottom: spacing[4],
    },
    
    // Home section styles
    homeGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    
    homeCard: {
      width: '48%',
      height: 120,
      backgroundColor: theme === 'light' ? colors.white : colors.gray[800],
      borderRadius: borderRadius.lg,
      padding: spacing[3],
      marginBottom: spacing[3],
      shadowColor: colors.gray[900],
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    
    mysticalCard: {
      borderWidth: 1,
      borderColor: colors.primary[200],
      position: 'relative',
      overflow: 'hidden',
    },
    
    homeCardTitle: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: theme === 'light' ? colors.gray[900] : colors.white,
      marginBottom: spacing[1],
    },
    
    homeCardContent: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: colors.primary[500],
      marginBottom: spacing[2],
    },
    
    moodIndicator: {
      width: '100%',
      height: 4,
      backgroundColor: colors.emotion.happy,
      borderRadius: 2,
    },
    
    energyBar: {
      width: '100%',
      height: 4,
      backgroundColor: colors.primary[500],
      borderRadius: 2,
    },
    
    connectionIndicator: {
      width: '100%',
      height: 4,
      backgroundColor: colors.secondary[500],
      borderRadius: 2,
    },
    
    activitiesIndicator: {
      width: '100%',
      height: 4,
      backgroundColor: colors.accent[500],
      borderRadius: 2,
    },
    
    // Thoughts section styles
    thoughtsContainer: {
      flex: 1,
    },
    
    thoughtCard: {
      backgroundColor: theme === 'light' ? colors.white : colors.gray[800],
      borderRadius: borderRadius.lg,
      padding: spacing[4],
      marginBottom: spacing[3],
      shadowColor: colors.gray[900],
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    
    userThought: {
      borderLeftWidth: 4,
      borderLeftColor: colors.primary[500],
    },
    
    sallieThought: {
      borderLeftWidth: 4,
      borderLeftColor: colors.secondary[500],
    },
    
    alignmentThought: {
      borderLeftWidth: 4,
      borderLeftColor: colors.accent[500],
    },
    
    thoughtTitle: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: theme === 'light' ? colors.gray[900] : colors.white,
      marginBottom: spacing[1],
    },
    
    thoughtPreview: {
      fontSize: typography.fontSize.sm,
      color: colors.gray[600],
      marginBottom: spacing[2],
      fontStyle: 'italic',
    },
    
    thoughtTime: {
      fontSize: typography.fontSize.xs,
      color: colors.gray[400],
    },
    
    // Limbic section styles
    limbicContainer: {
      flex: 1,
    },
    
    emotionalWheel: {
      backgroundColor: theme === 'light' ? colors.white : colors.gray[800],
      borderRadius: borderRadius.lg,
      padding: spacing[4],
      marginBottom: spacing[4],
      shadowColor: colors.gray[900],
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    
    emotionalTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: theme === 'light' ? colors.gray[900] : colors.white,
      marginBottom: spacing[3],
    },
    
    emotionVisualization: {
      alignItems: 'center',
    },
    
    emotionBubble: {
      width: 80,
      height: 80,
      borderRadius: 40,
      marginBottom: spacing[2],
    },
    
    emotionLabel: {
      fontSize: typography.fontSize.sm,
      color: colors.gray[600],
      textAlign: 'center',
    },
    
    limbicMetrics: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    
    metricCard: {
      flex: 1,
      backgroundColor: theme === 'light' ? colors.white : colors.gray[800],
      borderRadius: borderRadius.lg,
      padding: spacing[3],
      alignItems: 'center',
      marginHorizontal: spacing[1],
      shadowColor: colors.gray[900],
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    
    metricTitle: {
      fontSize: typography.fontSize.sm,
      color: colors.gray[600],
      marginBottom: spacing[1],
    },
    
    metricValue: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: colors.primary[500],
    },
    
    // Convergence section styles
    convergenceContainer: {
      flex: 1,
      alignItems: 'center',
    },
    
    convergenceVisualization: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing[4],
    },
    
    convergenceCircle: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.primary[500],
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: spacing[4],
    },
    
    convergenceLabel: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.bold,
      color: colors.white,
    },
    
    convergenceConnection: {
      width: 40,
      height: 2,
      backgroundColor: colors.accent[500],
    },
    
    convergenceMetrics: {
      alignItems: 'center',
    },
    
    convergenceTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: theme === 'light' ? colors.gray[900] : colors.white,
      marginBottom: spacing[2],
    },
    
    convergenceScore: {
      fontSize: typography.fontSize['3xl'],
      fontWeight: typography.fontWeight.bold,
      color: colors.accent[500],
      marginBottom: spacing[1],
    },
    
    convergenceDescription: {
      fontSize: typography.fontSize.sm,
      color: colors.gray[600],
      textAlign: 'center',
    },
    
    // Heritage section styles
    heritageContainer: {
      flex: 1,
    },
    
    heritageTimeline: {
      flex: 1,
    },
    
    timelineItem: {
      backgroundColor: theme === 'light' ? colors.white : colors.gray[800],
      borderRadius: borderRadius.lg,
      padding: spacing[3],
      marginBottom: spacing[3],
      shadowColor: colors.gray[900],
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    
    timelineDate: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: colors.primary[500],
      marginBottom: spacing[1],
    },
    
    timelineEvent: {
      fontSize: typography.fontSize.base,
      color: theme === 'light' ? colors.gray[900] : colors.white,
    },
    
    // Projects section styles
    projectsContainer: {
      flex: 1,
    },
    
    projectCard: {
      backgroundColor: theme === 'light' ? colors.white : colors.gray[800],
      borderRadius: borderRadius.lg,
      padding: spacing[4],
      marginBottom: spacing[3],
      shadowColor: colors.gray[900],
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    
    projectTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: theme === 'light' ? colors.gray[900] : colors.white,
      marginBottom: spacing[1],
    },
    
    projectDescription: {
      fontSize: typography.fontSize.sm,
      color: colors.gray[600],
      marginBottom: spacing[3],
    },
    
    projectProgress: {
      width: '100%',
      height: 6,
      backgroundColor: colors.gray[200],
      borderRadius: 3,
    },
    
    progressBar: {
      width: '65%',
      height: '100%',
      backgroundColor: colors.primary[500],
      borderRadius: 3,
    },
    
    // Tools section styles
    toolsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    
    toolCard: {
      width: '30%',
      height: 100,
      backgroundColor: theme === 'light' ? colors.white : colors.gray[800],
      borderRadius: borderRadius.lg,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing[3],
      shadowColor: colors.gray[900],
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    
    toolIcon: {
      fontSize: 32,
      marginBottom: spacing[2],
    },
    
    toolName: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: theme === 'light' ? colors.gray[900] : colors.white,
      textAlign: 'center',
    },
    
    // Settings section styles
    settingsContainer: {
      flex: 1,
    },
    
    settingItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: theme === 'light' ? colors.white : colors.gray[800],
      borderRadius: borderRadius.lg,
      padding: spacing[4],
      marginBottom: spacing[3],
      shadowColor: colors.gray[900],
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    
    settingTitle: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: theme === 'light' ? colors.gray[900] : colors.white,
    },
    
    settingValue: {
      fontSize: typography.fontSize.sm,
      color: colors.gray[600],
    },
  });
};

export default StudioLayout;
