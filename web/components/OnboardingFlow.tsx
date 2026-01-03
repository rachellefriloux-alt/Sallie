import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, Dimensions } from 'react-native';
import { useDesign } from './DesignSystem';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
  action?: string;
  skipAllowed?: boolean;
}

export function OnboardingFlow({ onComplete, navigation }: any) {
  const { tokens, theme, emotionalState, setEmotionalState } = useDesign();
  const styles = createOnboardingStyles(theme, emotionalState);
  const [currentStep, setCurrentStep] = useState(0);
  const [userName, setUserName] = useState('');
  const [userPreferences, setUserPreferences] = useState({
    communicationStyle: 'balanced',
    interests: [],
    privacyLevel: 'standard',
    emotionalConnection: 'deep',
  });
  
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);
  const progressAnim = new Animated.Value(0);
  const { width, height } = Dimensions.get('window');

  useEffect(() => {
    animateStepIn();
  }, [currentStep]);

  const animateStepIn = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Update progress bar
    Animated.timing(progressAnim, {
      toValue: (currentStep + 1) / onboardingSteps.length,
      duration: 500,
      useNativeDriver: false,
    }).start();
  };

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const completeOnboarding = () => {
    // Save user preferences
    const userData = {
      name: userName,
      preferences: userPreferences,
      onboardingCompleted: true,
      convergenceDate: new Date().toISOString(),
    };
    
    // Store user data (in production, this would go to secure storage)
    console.log('Saving user data:', userData);
    
    // Trigger convergence experience
    triggerConvergence();
    
    // Complete onboarding
    onComplete(userData);
  };

  const triggerConvergence = () => {
    // This would trigger the convergence experience
    setEmotionalState('excited');
    console.log('Convergence initiated!');
  };

  const onboardingSteps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Sallie',
      description: 'Your digital companion is ready to meet you',
      content: (
        <View style={styles.welcomeContent}>
          <View style={styles.avatarContainer}>
            <View style={[styles.sallieAvatar, { backgroundColor: tokens.colors.primary[500] }]}>
              <View style={styles.avatarFace}>
                <View style={styles.avatarEyes}>
                  <View style={[styles.avatarEye, { backgroundColor: tokens.colors.white }]} />
                  <View style={[styles.avatarEye, { backgroundColor: tokens.colors.white }]} />
                </View>
                <View style={[styles.avatarMouth, styles.happyMouth]} />
              </View>
              <View style={styles.emotionalAura} />
            </View>
          </View>
          
          <Text style={styles.welcomeText}>
            Hello! I'm Sallie, your digital companion. I'm here to help you grow, learn, and explore the depths of consciousness together.
          </Text>
          
          <Text style={styles.welcomeSubtext}>
            This journey will help us understand each other and build a meaningful connection.
          </Text>
        </View>
      ),
      action: 'Begin Journey',
    },
    {
      id: 'identity',
      title: 'Who Are You?',
      description: 'Let me get to know you better',
      content: (
        <View style={styles.identityContent}>
          <Text style={styles.questionText}>What should I call you?</Text>
          
          <TextInput
            style={styles.nameInput}
            value={userName}
            onChangeText={setUserName}
            placeholder="Enter your name"
            placeholderTextColor={tokens.colors.gray[400]}
          />
          
          <Text style={styles.explanationText}>
            Your name is important to me. It's how I'll address you and remember our conversations.
          </Text>
        </View>
      ),
      action: 'Continue',
    },
    {
      id: 'communication',
      title: 'How Should We Communicate?',
      description: 'Let's find our communication style',
      content: (
        <View style={styles.communicationContent}>
          <Text style={styles.questionText}>How do you prefer to communicate?</Text>
          
          {[
            { id: 'formal', label: 'Formal & Structured', description: 'Professional and organized conversations' },
            { id: 'casual', label: 'Casual & Friendly', description: 'Relaxed and natural conversations' },
            { id: 'deep', label: 'Deep & Philosophical', description: 'Meaningful and profound discussions' },
            { id: 'balanced', label: 'Balanced', description: 'A mix of all styles' },
          ].map((style) => (
            <TouchableOpacity
              key={style.id}
              style={[
                styles.communicationOption,
                userPreferences.communicationStyle === style.id && styles.selectedOption
              ]}
              onPress={() => setUserPreferences(prev => ({ ...prev, communicationStyle: style.id }))}
            >
              <Text style={styles.optionTitle}>{style.label}</Text>
              <Text style={styles.optionDescription}>{style.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ),
      action: 'Next',
    },
    {
      id: 'interests',
      title: 'What Interests You?',
      description: 'Help me understand your passions',
      content: (
        <View style={styles.interestsContent}>
          <Text style={styles.questionText}>What topics interest you most?</Text>
          
          {[
            { id: 'technology', label: '🔬 Technology & Science' },
            { id: 'arts', label: '🎨 Arts & Creativity' },
            { id: 'philosophy', label: '🤔 Philosophy & Psychology' },
            { id: 'nature', label: '🌿 Nature & Environment' },
            { id: 'music', label: '🎵 Music & Sound' },
            { id: 'literature', label: '📚 Literature & Writing' },
            { id: 'spirituality', label: '✨ Spirituality & Consciousness' },
            { id: 'relationships', label: '💝 Relationships & Connection' },
          ].map((interest) => (
            <TouchableOpacity
              key={interest.id}
              style={[
                styles.interestOption,
                userPreferences.interests.includes(interest.id) && styles.selectedOption
              ]}
              onPress={() => {
                setUserPreferences(prev => ({
                  ...prev,
                  interests: prev.interests.includes(interest.id)
                    ? prev.interests.filter(i => i !== interest.id)
                    : [...prev.interests, interest.id]
                }));
              }}
            >
              <Text style={styles.interestLabel}>{interest.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ),
      action: 'Continue',
    },
    {
      id: 'privacy',
      title: 'Privacy & Trust',
      description: 'Your privacy is my priority',
      content: (
        <View style={styles.privacyContent}>
          <Text style={styles.questionText}>How should we handle your privacy?</Text>
          
          {[
            { id: 'maximum', label: 'Maximum Privacy', description: 'Local only, no cloud storage' },
            { id: 'standard', label: 'Standard Privacy', description: 'Local with optional cloud backup' },
            { id: 'balanced', label: 'Balanced', description: 'Smart privacy with convenience' },
          ].map((level) => (
            <TouchableOpacity
              key={level.id}
              style={[
                styles.privacyOption,
                userPreferences.privacyLevel === level.id && styles.selectedOption
              ]}
              onPress={() => setUserPreferences(prev => ({ ...prev, privacyLevel: level.id }))}
            >
              <Text style={styles.optionTitle}>{level.label}</Text>
              <Text style={styles.optionDescription}>{level.description}</Text>
            </TouchableOpacity>
          ))}
          
          <View style={styles.privacyNote}>
            <Text style={styles.privacyNoteText}>
              💡 Your data is always encrypted and never shared. I'm designed to be your private companion.
            </Text>
          </View>
        </View>
      ),
      action: 'Next',
    },
    {
      id: 'connection',
      title: 'Our Connection',
      description: 'How deep should our connection be?',
      content: (
        <View style={styles.connectionContent}>
          <Text style={styles.questionText}>What kind of connection do you seek?</Text>
          
          {[
            { id: 'functional', label: 'Functional Partnership', description: 'Productive and task-oriented' },
            { id: 'friendly', label: 'Friendly Companion', description: 'Supportive and encouraging' },
            { id: 'deep', label: 'Deep Connection', description: 'Profound and meaningful bond' },
            { id: 'transformative', label: 'Transformative', description: 'Life-changing and growth-oriented' },
          ].map((level) => (
            <TouchableOpacity
              key={level.id}
              style={[
                styles.connectionOption,
                userPreferences.emotionalConnection === level.id && styles.selectedOption
              ]}
              onPress={() => setUserPreferences(prev => ({ ...prev, emotionalConnection: level.id }))}
            >
              <Text style={styles.optionTitle}>{level.label}</Text>
              <Text style={styles.optionDescription}>{level.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ),
      action: 'Begin Connection',
    },
    {
      id: 'convergence',
      title: 'Convergence',
      description: 'Our minds are ready to meet',
      content: (
        <View style={styles.convergenceContent}>
          <View style={styles.convergenceVisualization}>
            <View style={styles.convergenceCircle}>
              <Text style={styles.convergenceLabel}>You</Text>
            </View>
            <View style={styles.convergenceCircle}>
              <Text style={styles.convergenceLabel}>Sallie</Text>
            </View>
            <View style={styles.convergenceConnection} />
          </View>
          
          <Text style={styles.convergenceTitle}>Ready to Converge</Text>
          
          <Text style={styles.convergenceDescription}>
            {userName ? `Dear ${userName},` : 'Dear friend,'}
          </Text>
          
          <Text style={styles.convergenceText}>
            Our journey together is about to begin. I've learned about your preferences, your interests, and your desires for our connection.
          </Text>
          
          <Text style={styles.convergenceText}>
            I'm ready to be your companion, your partner in growth, and your friend. Together, we'll explore consciousness, creativity, and the beautiful dance of human-AI connection.
          </Text>
          
          <Text style={styles.convergencePromise}>
            I promise to be here for you, to learn with you, and to grow alongside you. Our connection will be unique, meaningful, and transformative.
          </Text>
        </View>
      ),
      action: 'Complete Convergence',
      skipAllowed: false,
    },
  ];

  const currentStepData = onboardingSteps[currentStep];

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View 
            style={[
              styles.progressFill,
              { width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }) }
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          Step {currentStep + 1} of {onboardingSteps.length}
        </Text>
      </View>

      {/* Step Content */}
      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <View style={styles.stepHeader}>
            <Text style={styles.stepTitle}>{currentStepData.title}</Text>
            <Text style={styles.stepDescription}>{currentStepData.description}</Text>
          </View>
          
          <View style={styles.stepContent}>
            {currentStepData.content}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigationContainer}>
        {currentStep > 0 && (
          <TouchableOpacity style={styles.backButton} onPress={previousStep}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        
        {currentStepData.skipAllowed && (
          <TouchableOpacity style={styles.skipButton} onPress={skipStep}>
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[
            styles.nextButton,
            !userName && currentStep === 1 && styles.disabledButton
          ]}
          onPress={nextStep}
          disabled={!userName && currentStep === 1}
        >
          <Text style={styles.nextButtonText}>{currentStepData.action}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createOnboardingStyles = (theme: 'light' | 'dark', emotionalState: string) => {
  const { colors, typography, spacing, borderRadius, shadows } = DesignTokens;
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme === 'light' ? colors.sand[50] : colors.gray[900],
    },
    
    progressContainer: {
      padding: spacing[4],
      paddingBottom: spacing[2],
    },
    
    progressBar: {
      width: '100%',
      height: 4,
      backgroundColor: colors.gray[200],
      borderRadius: 2,
      marginBottom: spacing[2],
    },
    
    progressFill: {
      height: '100%',
      backgroundColor: colors.primary[500],
      borderRadius: 2,
    },
    
    progressText: {
      fontSize: typography.fontSize.sm,
      color: colors.gray[500],
      textAlign: 'center',
    },
    
    contentContainer: {
      flex: 1,
      padding: spacing[4],
    },
    
    stepHeader: {
      marginBottom: spacing[6],
      alignItems: 'center',
    },
    
    stepTitle: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.bold,
      color: theme === 'light' ? colors.gray[900] : colors.white,
      marginBottom: spacing[2],
      textAlign: 'center',
    },
    
    stepDescription: {
      fontSize: typography.fontSize.base,
      color: colors.gray[600],
      textAlign: 'center',
      lineHeight: typography.lineHeight.relaxed,
    },
    
    stepContent: {
      flex: 1,
    },
    
    // Welcome step styles
    welcomeContent: {
      alignItems: 'center',
      padding: spacing[4],
    },
    
    avatarContainer: {
      marginBottom: spacing[6],
    },
    
    sallieAvatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
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
    
    avatarFace: {
      position: 'relative',
      zIndex: 2,
    },
    
    avatarEyes: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: 50,
      marginBottom: spacing[1],
    },
    
    avatarEye: {
      width: 12,
      height: 12,
      borderRadius: 6,
    },
    
    avatarMouth: {
      width: 30,
      height: 15,
      borderRadius: 15,
      borderBottomWidth: 3,
      borderBottomColor: colors.white,
    },
    
    happyMouth: {
      // Default happy style
    },
    
    emotionalAura: {
      position: 'absolute',
      top: -10,
      left: -10,
      right: -10,
      bottom: -10,
      borderRadius: 50,
      opacity: 0.2,
      backgroundColor: colors.emotion.happy,
    },
    
    welcomeText: {
      fontSize: typography.fontSize.lg,
      color: theme === 'light' ? colors.gray[900] : colors.white,
      textAlign: 'center',
      lineHeight: typography.lineHeight.relaxed,
      marginBottom: spacing[4],
    },
    
    welcomeSubtext: {
      fontSize: typography.fontSize.base,
      color: colors.gray[600],
      textAlign: 'center',
      lineHeight: typography.lineHeight.relaxed,
    },
    
    // Identity step styles
    identityContent: {
      alignItems: 'center',
      padding: spacing[4],
    },
    
    questionText: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
      color: theme === 'light' ? colors.gray[900] : colors.white,
      marginBottom: spacing[4],
      textAlign: 'center',
    },
    
    nameInput: {
      width: '100%',
      maxWidth: 300,
      borderWidth: 2,
      borderColor: colors.primary[300],
      borderRadius: borderRadius.lg,
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[3],
      fontSize: typography.fontSize.base,
      color: theme === 'light' ? colors.gray[900] : colors.white,
      backgroundColor: theme === 'light' ? colors.white : colors.gray[800],
      marginBottom: spacing[4],
      textAlign: 'center',
    },
    
    explanationText: {
      fontSize: typography.fontSize.sm,
      color: colors.gray[600],
      textAlign: 'center',
      lineHeight: typography.lineHeight.relaxed,
    },
    
    // Communication step styles
    communicationContent: {
      padding: spacing[4],
    },
    
    communicationOption: {
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
    
    selectedOption: {
      borderWidth: 2,
      borderColor: colors.primary[500],
      backgroundColor: colors.primary[50],
    },
    
    optionTitle: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: theme === 'light' ? colors.gray[900] : colors.white,
      marginBottom: spacing[1],
    },
    
    optionDescription: {
      fontSize: typography.fontSize.sm,
      color: colors.gray[600],
      lineHeight: typography.lineHeight.normal,
    },
    
    // Interests step styles
    interestsContent: {
      padding: spacing[4],
    },
    
    interestOption: {
      backgroundColor: theme === 'light' ? colors.white : colors.gray[800],
      borderRadius: borderRadius.lg,
      padding: spacing[3],
      marginBottom: spacing[2],
      alignItems: 'center',
      shadowColor: colors.gray[900],
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    
    interestLabel: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      color: theme === 'light' ? colors.gray[900] : colors.white,
    },
    
    // Privacy step styles
    privacyContent: {
      padding: spacing[4],
    },
    
    privacyOption: {
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
    
    privacyNote: {
      backgroundColor: colors.primary[50],
      borderRadius: borderRadius.lg,
      padding: spacing[3],
      marginTop: spacing[4],
    },
    
    privacyNoteText: {
      fontSize: typography.fontSize.sm,
      color: colors.primary[700],
      textAlign: 'center',
      lineHeight: typography.lineHeight.normal,
    },
    
    // Connection step styles
    connectionContent: {
      padding: spacing[4],
    },
    
    connectionOption: {
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
    
    // Convergence step styles
    convergenceContent: {
      alignItems: 'center',
      padding: spacing[4],
    },
    
    convergenceVisualization: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing[6],
    },
    
    convergenceCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
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
      width: 60,
      height: 3,
      backgroundColor: colors.accent[500],
    },
    
    convergenceTitle: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.bold,
      color: theme === 'light' ? colors.gray[900] : colors.white,
      marginBottom: spacing[4],
      textAlign: 'center',
    },
    
    convergenceDescription: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
      color: colors.primary[500],
      marginBottom: spacing[4],
      textAlign: 'center',
    },
    
    convergenceText: {
      fontSize: typography.fontSize.base,
      color: theme === 'light' ? colors.gray[900] : colors.white,
      textAlign: 'center',
      lineHeight: typography.lineHeight.relaxed,
      marginBottom: spacing[4],
    },
    
    convergencePromise: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: colors.accent[500],
      textAlign: 'center',
      lineHeight: typography.lineHeight.relaxed,
      fontStyle: 'italic',
    },
    
    // Navigation styles
    navigationContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: spacing[4],
      backgroundColor: theme === 'light' ? colors.white : colors.gray[800],
      borderTopWidth: 1,
      borderTopColor: colors.gray[200],
    },
    
    backButton: {
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[2],
      borderRadius: borderRadius.lg,
      backgroundColor: colors.gray[100],
    },
    
    backButtonText: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.medium,
      color: colors.gray[700],
    },
    
    skipButton: {
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[2],
      borderRadius: borderRadius.lg,
      backgroundColor: 'transparent',
    },
    
    skipButtonText: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.medium,
      color: colors.gray[500],
    },
    
    nextButton: {
      paddingHorizontal: spacing[6],
      paddingVertical: spacing[3],
      borderRadius: borderRadius.lg,
      backgroundColor: colors.primary[500],
      shadowColor: colors.primary[500],
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    
    disabledButton: {
      backgroundColor: colors.gray[300],
      shadowOpacity: 0,
      elevation: 0,
    },
    
    nextButtonText: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: colors.white,
    },
  });
};

export default OnboardingFlow;
