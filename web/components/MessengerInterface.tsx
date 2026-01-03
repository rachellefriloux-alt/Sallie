import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Animated, Dimensions, Image } from 'react-native';
import { useDesign } from './DesignSystem';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'sallie';
  timestamp: Date;
  type: 'text' | 'voice' | 'video' | 'image';
  metadata?: {
    duration?: number;
    imageUrl?: string;
    voiceUrl?: string;
    emotion?: string;
  };
}

interface SallieAvatar {
  mood: string;
  energy: number;
  emotion: string;
  isTyping: boolean;
  isThinking: boolean;
}

export function MessengerInterface({ navigation }: any) {
  const { tokens, theme, emotionalState, setEmotionalState } = useDesign();
  const styles = createMessengerStyles(theme, emotionalState);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [sallieAvatar, setSallieAvatar] = useState<SallieAvatar>({
    mood: 'happy',
    energy: 80,
    emotion: 'curious',
    isTyping: false,
    isThinking: false,
  });
  
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  
  const { width } = Dimensions.get('window');

  useEffect(() => {
    // Initial animations
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
    
    // Continuous pulse for avatar
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();
    
    // Gemini duality shimmer effect
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmerAnimation.start();
    
    // Welcome message from Sallie
    setTimeout(() => {
      addSallieMessage("Hello! I'm Sallie, your digital companion. I'm here to help you with anything you need. How are you feeling today?");
    }, 1000);
  }, []);

  const addSallieMessage = (text: string, type: 'text' | 'voice' | 'video' | 'image' = 'text') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'sallie',
      timestamp: new Date(),
      type,
      metadata: {
        emotion: sallieAvatar.emotion,
      },
    };
    
    setSallieAvatar(prev => ({ ...prev, isTyping: false, isThinking: false }));
    setMessages(prev => [...prev, newMessage]);
    
    // Auto-scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const sendMessage = () => {
    if (!inputText.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
      type: 'text',
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    
    // Show Sallie thinking
    setSallieAvatar(prev => ({ ...prev, isThinking: true, emotion: 'thoughtful' }));
    
    // Simulate Sallie response
    setTimeout(() => {
      setSallieAvatar(prev => ({ ...prev, isTyping: true, isThinking: false }));
      
      setTimeout(() => {
        const responses = [
          "That's interesting! Tell me more about that.",
          "I understand how you feel. Let me help you with that.",
          "I'm here for you. What would you like to explore together?",
          "That reminds me of something. Let me think about the best way to help.",
          "I appreciate you sharing that with me. You're not alone in this.",
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        addSallieMessage(randomResponse);
        
        // Update Sallie's mood based on conversation
        setSallieAvatar(prev => ({
          ...prev,
          emotion: 'happy',
          mood: 'engaged',
          energy: Math.min(100, prev.energy + 5),
        }));
      }, 2000);
    }, 1000);
  };

  const startVoiceRecording = () => {
    setIsRecording(true);
    // Voice recording logic would go here
    setTimeout(() => {
      setIsRecording(false);
      addSallieMessage("I heard what you said. Let me think about that...", 'voice');
    }, 3000);
  };

  const startVideoCall = () => {
    setIsVideoCall(true);
    // Video call logic would go here
  };

  const renderAvatar = () => (
    <Animated.View style={[styles.avatarContainer, { transform: [{ scale: pulseAnim }] }]}>
      <View style={[styles.avatar, styles.emotionalBackground]}>
        {/* Leopard texture overlay */}
        <View style={styles.leopardTexture} />
        
        {/* Avatar face */}
        <View style={styles.avatarFace}>
          <View style={styles.avatarEyes}>
            <View style={[styles.avatarEye, { backgroundColor: sallieAvatar.isThinking ? tokens.colors.accent[500] : tokens.colors.primary[500] }]} />
            <View style={[styles.avatarEye, { backgroundColor: sallieAvatar.isThinking ? tokens.colors.accent[500] : tokens.colors.primary[500] }]} />
          </View>
          
          {/* Avatar mouth based on mood */}
          <View style={[
            styles.avatarMouth,
            sallieAvatar.mood === 'happy' ? styles.happyMouth :
            sallieAvatar.mood === 'thoughtful' ? styles.thoughtfulMouth :
            sallieAvatar.mood === 'excited' ? styles.excitedMouth :
            styles.neutralMouth
          ]} />
        </View>
        
        {/* Gemini duality shimmer */}
        <Animated.View 
          style={[
            styles.shimmer,
            { transform: [{ translateX: shimmerAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-width, width],
            }) }] }
          ]}
        />
        
        {/* Emotional aura */}
        <View style={[
          styles.emotionalAura,
          { backgroundColor: tokens.colors.emotion[sallieAvatar.emotion as keyof typeof tokens.colors.emotion] || tokens.colors.primary[500] }
        ]} />
      </View>
      
      {/* Avatar status */}
      <View style={styles.avatarStatus}>
        <Text style={styles.avatarMood}>{sallieAvatar.mood}</Text>
        <Text style={styles.avatarEnergy}>Energy: {sallieAvatar.energy}%</Text>
        {sallieAvatar.isTyping && <Text style={styles.typingIndicator}>Sallie is typing...</Text>}
        {sallieAvatar.isThinking && <Text style={styles.thinkingIndicator}>Sallie is thinking...</Text>}
      </View>
    </Animated.View>
  );

  const renderMessage = (message: Message) => (
    <View key={message.id} style={[
      styles.messageContainer,
      message.sender === 'user' ? styles.userMessage : styles.sallieMessage
    ]}>
      <View style={[
        styles.messageBubble,
        message.sender === 'user' ? styles.userBubble : styles.sallieBubble
      ]}>
        {message.type === 'text' && (
          <Text style={[
            styles.messageText,
            message.sender === 'user' ? styles.userText : styles.sallieText
          ]}>
            {message.text}
          </Text>
        )}
        
        {message.type === 'voice' && (
          <View style={styles.voiceMessage}>
            <TouchableOpacity style={styles.playButton}>
              <Text style={styles.playIcon}>▶</Text>
            </TouchableOpacity>
            <Text style={styles.voiceDuration}>0:03</Text>
          </View>
        )}
        
        {message.type === 'image' && (
          <Image 
            source={{ uri: message.metadata?.imageUrl || 'https://via.placeholder.com/200' }}
            style={styles.messageImage}
          />
        )}
        
        <Text style={styles.messageTime}>
          {message.timestamp.toLocaleTimeString()}
        </Text>
      </View>
    </View>
  );

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Header with avatar */}
      <View style={styles.header}>
        {renderAvatar()}
        <View style={styles.headerInfo}>
          <Text style={styles.sallieName}>Sallie</Text>
          <Text style={styles.sallieStatus}>Online • {sallieAvatar.emotion}</Text>
        </View>
        
        {/* Quick actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction} onPress={startVideoCall}>
            <Text style={styles.quickActionIcon}>📹</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction}>
            <Text style={styles.quickActionIcon}>📞</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction}>
            <Text style={styles.quickActionIcon}>ℹ️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
      >
        {messages.map(renderMessage)}
      </ScrollView>

      {/* Input area */}
      <View style={styles.inputContainer}>
        {/* Voice recording button */}
        <TouchableOpacity 
          style={[
            styles.voiceButton,
            isRecording && styles.recordingButton
          ]}
          onPress={startVoiceRecording}
        >
          <Text style={styles.voiceIcon}>🎤</Text>
        </TouchableOpacity>

        {/* Text input */}
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          placeholderTextColor={tokens.colors.gray[400]}
          multiline
          maxLength={1000}
        />

        {/* Send button */}
        <TouchableOpacity 
          style={[
            styles.sendButton,
            inputText.trim() ? styles.sendButtonActive : styles.sendButtonInactive
          ]}
          onPress={sendMessage}
          disabled={!inputText.trim()}
        >
          <Text style={[
            styles.sendIcon,
            inputText.trim() ? styles.sendIconActive : styles.sendIconInactive
          ]}>
            ➤
          </Text>
        </TouchableOpacity>

        {/* Additional actions */}
        <TouchableOpacity style={styles.moreButton}>
          <Text style={styles.moreIcon}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Video call overlay */}
      {isVideoCall && (
        <View style={styles.videoCallOverlay}>
          <View style={styles.videoContainer}>
            <Text style={styles.videoText}>Video Call with Sallie</Text>
            <TouchableOpacity 
              style={styles.endCallButton}
              onPress={() => setIsVideoCall(false)}
            >
              <Text style={styles.endCallText}>End Call</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </Animated.View>
  );
}

const createMessengerStyles = (theme: 'light' | 'dark', emotionalState: string) => {
  const { colors, typography, spacing, borderRadius, shadows } = DesignTokens;
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme === 'light' ? colors.sand[50] : colors.gray[900],
    },
    
    header: {
      flexDirection: 'row',
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
    
    avatarContainer: {
      marginRight: spacing[3],
    },
    
    avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: colors.primary[500],
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
      height: 2,
      backgroundColor: colors.white,
      borderRadius: 1,
    },
    
    happyMouth: {
      height: 10,
      borderRadius: 10,
      borderBottomWidth: 2,
      borderBottomColor: colors.white,
    },
    
    thoughtfulMouth: {
      width: 15,
      marginLeft: 2.5,
    },
    
    excitedMouth: {
      height: 15,
      borderRadius: 15,
      borderBottomWidth: 2,
      borderBottomColor: colors.white,
    },
    
    neutralMouth: {
      // Default style
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
    
    shimmer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '200%',
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
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
    
    emotionalBackground: {
      backgroundColor: colors.emotion[emotionalState as keyof typeof colors.emotion] || colors.primary[100],
    },
    
    avatarStatus: {
      flex: 1,
    },
    
    avatarMood: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: theme === 'light' ? colors.gray[900] : colors.white,
    },
    
    avatarEnergy: {
      fontSize: typography.fontSize.xs,
      color: colors.gray[500],
    },
    
    typingIndicator: {
      fontSize: typography.fontSize.xs,
      color: colors.primary[500],
      fontStyle: 'italic',
    },
    
    thinkingIndicator: {
      fontSize: typography.fontSize.xs,
      color: colors.accent[500],
      fontStyle: 'italic',
    },
    
    headerInfo: {
      flex: 1,
    },
    
    sallieName: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: theme === 'light' ? colors.gray[900] : colors.white,
    },
    
    sallieStatus: {
      fontSize: typography.fontSize.sm,
      color: colors.gray[500],
    },
    
    quickActions: {
      flexDirection: 'row',
    },
    
    quickAction: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.gray[100],
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: spacing[2],
    },
    
    quickActionIcon: {
      fontSize: 18,
    },
    
    messagesContainer: {
      flex: 1,
      padding: spacing[4],
    },
    
    messageContainer: {
      marginBottom: spacing[3],
    },
    
    userMessage: {
      alignItems: 'flex-end',
    },
    
    sallieMessage: {
      alignItems: 'flex-start',
    },
    
    messageBubble: {
      maxWidth: '80%',
      padding: spacing[3],
      borderRadius: borderRadius.lg,
      position: 'relative',
    },
    
    userBubble: {
      backgroundColor: colors.primary[500],
      borderBottomRightRadius: borderRadius.sm,
    },
    
    sallieBubble: {
      backgroundColor: theme === 'light' ? colors.gray[100] : colors.gray[700],
      borderBottomLeftRadius: borderRadius.sm,
    },
    
    messageText: {
      fontSize: typography.fontSize.base,
      lineHeight: typography.lineHeight.normal,
    },
    
    userText: {
      color: colors.white,
    },
    
    sallieText: {
      color: theme === 'light' ? colors.gray[900] : colors.white,
    },
    
    messageTime: {
      fontSize: typography.fontSize.xs,
      color: colors.gray[500],
      marginTop: spacing[1],
    },
    
    voiceMessage: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    
    playButton: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: colors.primary[500],
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing[2],
    },
    
    playIcon: {
      color: colors.white,
      fontSize: 12,
    },
    
    voiceDuration: {
      fontSize: typography.fontSize.sm,
      color: colors.gray[500],
    },
    
    messageImage: {
      width: 200,
      height: 150,
      borderRadius: borderRadius.md,
    },
    
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      padding: spacing[4],
      backgroundColor: theme === 'light' ? colors.white : colors.gray[800],
      borderTopWidth: 1,
      borderTopColor: colors.gray[200],
    },
    
    voiceButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.gray[100],
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing[2],
    },
    
    recordingButton: {
      backgroundColor: colors.error[500],
    },
    
    voiceIcon: {
      fontSize: 18,
    },
    
    textInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.gray[300],
      borderRadius: borderRadius.lg,
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[2],
      fontSize: typography.fontSize.base,
      color: theme === 'light' ? colors.gray[900] : colors.white,
      backgroundColor: theme === 'light' ? colors.white : colors.gray[700],
      maxHeight: 100,
    },
    
    sendButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: spacing[2],
    },
    
    sendButtonActive: {
      backgroundColor: colors.primary[500],
    },
    
    sendButtonInactive: {
      backgroundColor: colors.gray[200],
    },
    
    sendIcon: {
      fontSize: 18,
    },
    
    sendIconActive: {
      color: colors.white,
    },
    
    sendIconInactive: {
      color: colors.gray[400],
    },
    
    moreButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.gray[100],
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: spacing[2],
    },
    
    moreIcon: {
      fontSize: 18,
      color: colors.gray[600],
    },
    
    videoCallOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    
    videoContainer: {
      alignItems: 'center',
    },
    
    videoText: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.bold,
      color: colors.white,
      marginBottom: spacing[4],
    },
    
    endCallButton: {
      backgroundColor: colors.error[500],
      paddingHorizontal: spacing[6],
      paddingVertical: spacing[3],
      borderRadius: borderRadius.lg,
    },
    
    endCallText: {
      color: colors.white,
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
    },
  });
};

export default MessengerInterface;
