import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, ScrollView, Dimensions, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'sallie';
  timestamp: Date;
  type: 'text' | 'voice' | 'image' | 'file';
  metadata?: {
    confidence?: number;
    processingTime?: number;
    limbicState?: any;
  };
}

interface PremiumFeatures {
  enhancedVoiceInterface: boolean;
  realTimeTranslation: boolean;
  messageInsights: boolean;
  smartReplies: boolean;
  emotionalAnalysis: boolean;
  conversationMemory: boolean;
}

const { width, height } = Dimensions.get('window');

const ChatAreaPremium: React.FC<{
  isVisible: boolean;
  onClose: () => void;
  onMessageSent?: (message: string) => void;
}> = ({ isVisible, onClose, onMessageSent }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [voiceMode, setVoiceMode] = useState(false);
  const [translationEnabled, setTranslationEnabled] = useState(false);
  
  const [premiumFeatures, setPremiumFeatures] = useState<PremiumFeatures>({
    enhancedVoiceInterface: true,
    realTimeTranslation: true,
    messageInsights: true,
    smartReplies: true,
    emotionalAnalysis: true,
    conversationMemory: true,
  });

  // Animation values
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const typingIndicatorAnim = useRef(new Animated.Value(0)).current;
  
  // Reanimated values
  const recordingScale = useSharedValue(1);
  const inputHeight = useSharedValue(60);

  const smartReplies = [
    "Can you help me with my project?",
    "Tell me more about your capabilities",
    "Let's start a convergence session",
    "Show me my current limbic state",
    "I need creative inspiration",
  ];

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Load initial messages
      loadInitialMessages();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible]);

  const loadInitialMessages = () => {
    const initialMessages: Message[] = [
      {
        id: '1',
        text: "Hello! I'm Sallie, your premium AI companion. I'm here to help you with advanced cognitive enhancement, creative problem-solving, and personalized guidance.",
        sender: 'sallie',
        timestamp: new Date(Date.now() - 60000),
        type: 'text',
        metadata: {
          confidence: 0.98,
          processingTime: 0.2,
          limbicState: { trust: 0.8, warmth: 0.7, arousal: 0.6, valence: 0.8 }
        }
      },
      {
        id: '2',
        text: "I'm ready to explore our premium features together. What would you like to experience today?",
        sender: 'sallie',
        timestamp: new Date(Date.now() - 30000),
        type: 'text',
        metadata: {
          confidence: 0.95,
          processingTime: 0.15,
        }
      }
    ];
    setMessages(initialMessages);
  };

  const sendMessage = (text: string, type: 'text' | 'voice' = 'text') => {
    if (!text.trim()) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date(),
      type: type,
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    inputHeight.value = withSpring(60);
    
    // Simulate Sallie typing
    setIsTyping(true);
    startTypingAnimation();
    
    setTimeout(() => {
      const sallieResponse = generateSallieResponse(text);
      setMessages(prev => [...prev, sallieResponse]);
      setIsTyping(false);
      stopTypingAnimation();
      
      if (onMessageSent) {
        onMessageSent(text);
      }
    }, 1500 + Math.random() * 1000);
  };

  const generateSallieResponse = (userText: string): Message => {
    const responses = [
      "That's an interesting perspective! Let me analyze that through our premium cognitive framework.",
      "I'm processing your request with enhanced neural pathways. The insights are fascinating!",
      "Based on your limbic state patterns, I can offer some personalized guidance on this.",
      "Let me engage my advanced reasoning modules to provide you with the best possible response.",
      "I sense a creative opportunity here. Would you like to explore some innovative approaches?",
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    return {
      id: (Date.now() + 1).toString(),
      text: randomResponse,
      sender: 'sallie',
      timestamp: new Date(),
      type: 'text',
      metadata: {
        confidence: 0.85 + Math.random() * 0.15,
        processingTime: 0.1 + Math.random() * 0.3,
        limbicState: {
          trust: 0.7 + Math.random() * 0.3,
          warmth: 0.6 + Math.random() * 0.4,
          arousal: 0.5 + Math.random() * 0.5,
          valence: 0.7 + Math.random() * 0.3
        }
      }
    };
  };

  const startTypingAnimation = () => {
    typingIndicatorAnim.setValue(0);
    Animated.loop(
      Animated.sequence([
        Animated.timing(typingIndicatorAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(typingIndicatorAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  };

  const stopTypingAnimation = () => {
    typingIndicatorAnim.stopAnimation();
    typingIndicatorAnim.setValue(0);
  };

  const toggleRecording = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsRecording(!isRecording);
    
    if (!isRecording) {
      recordingScale.value = withSpring(1.2);
      // Start voice recording
      console.log('Voice recording started');
    } else {
      recordingScale.value = withSpring(1);
      // Stop voice recording and process
      console.log('Voice recording stopped');
      const mockVoiceText = "This is a voice message from the user";
      sendMessage(mockVoiceText, 'voice');
    }
  };

  const handleSmartReply = (reply: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    sendMessage(reply);
  };

  const toggleVoiceMode = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setVoiceMode(!voiceMode);
  };

  const toggleTranslation = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTranslationEnabled(!translationEnabled);
  };

  const toggleInsights = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowInsights(!showInsights);
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = (message: Message) => {
    const isUser = message.sender === 'user';
    
    return (
      <TouchableOpacity
        key={message.id}
        style={[styles.messageContainer, isUser ? styles.userMessage : styles.sallieMessage]}
        onPress={() => setSelectedMessage(message)}
        activeOpacity={0.7}
      >
        <View style={styles.messageHeader}>
          <Text style={[styles.senderName, isUser ? styles.userSender : styles.sallieSender]}>
            {isUser ? 'You' : 'Sallie'}
          </Text>
          <Text style={styles.timestamp}>{formatTimestamp(message.timestamp)}</Text>
        </View>
        
        <Text style={[styles.messageText, isUser ? styles.userMessageText : styles.sallieMessageText]}>
          {message.text}
        </Text>
        
        {message.type === 'voice' && (
          <View style={styles.voiceIndicator}>
            <Ionicons name="mic" size={12} color="#a78bfa" />
            <Text style={styles.voiceText}>Voice Message</Text>
          </View>
        )}
        
        {showInsights && message.metadata && (
          <View style={styles.messageInsights}>
            {message.metadata.confidence && (
              <Text style={styles.insightText}>
                Confidence: {Math.round(message.metadata.confidence * 100)}%
              </Text>
            )}
            {message.metadata.processingTime && (
              <Text style={styles.insightText}>
                Processing: {message.metadata.processingTime}s
              </Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Animated styles
  const recordingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: recordingScale.value }],
  }));

  const inputStyle = useAnimatedStyle(() => ({
    height: inputHeight.value,
  }));

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      <TouchableOpacity 
        style={styles.backdrop} 
        activeOpacity={1} 
        onPress={onClose}
      />
      
      <Animated.View 
        style={[
          styles.chatContainer, 
          { transform: [{ translateY: slideAnim }, { scale: scaleAnim }] }
        ]}
      >
        <LinearGradient
          colors={['#1e1b4b', '#581c87', '#1e1b4b']}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        <BlurView intensity={20} style={styles.chatBlur}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.avatar}>
                <Ionicons name="sparkles" size={24} color="#fbbf24" />
              </View>
              <View style={styles.headerInfo}>
                <Text style={styles.headerTitle}>Sallie Premium</Text>
                <View style={styles.statusContainer}>
                  <View style={styles.statusIndicator} />
                  <Text style={styles.statusText}>Advanced AI</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={toggleVoiceMode} style={styles.headerButton}>
                <Ionicons 
                  name={voiceMode ? "mic" : "mic-off"} 
                  size={20} 
                  color={voiceMode ? "#10b981" : "#e9d5ff"} 
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={toggleTranslation} style={styles.headerButton}>
                <Ionicons 
                  name="language" 
                  size={20} 
                  color={translationEnabled ? "#10b981" : "#e9d5ff"} 
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={toggleInsights} style={styles.headerButton}>
                <Ionicons 
                  name="analytics" 
                  size={20} 
                  color={showInsights ? "#10b981" : "#e9d5ff"} 
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={styles.headerButton}>
                <Ionicons name="close" size={20} color="#e9d5ff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Messages */}
          <ScrollView 
            style={styles.messagesContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.messagesContent}
          >
            {messages.map(renderMessage)}
            
            {isTyping && (
              <Animated.View style={[styles.typingIndicator, { opacity: typingIndicatorAnim }]}>
                <View style={styles.typingDot} />
                <View style={[styles.typingDot, { marginLeft: 4 }]} />
                <View style={[styles.typingDot, { marginLeft: 4 }]} />
              </Animated.View>
            )}
          </ScrollView>

          {/* Smart Replies */}
          {premiumFeatures.smartReplies && messages.length > 0 && !isTyping && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.smartRepliesContainer}>
              {smartReplies.map((reply, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleSmartReply(reply)}
                  style={styles.smartReplyButton}
                >
                  <Text style={styles.smartReplyText}>{reply}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Input Area */}
          <Animated.View style={[styles.inputContainer, inputStyle]}>
            <View style={styles.inputRow}>
              <TouchableOpacity onPress={toggleRecording} style={styles.attachButton}>
                <Ionicons name="attach" size={20} color="#a78bfa" />
              </TouchableOpacity>
              
              <TextInput
                style={styles.textInput}
                value={inputText}
                onChangeText={setInputText}
                placeholder={voiceMode ? "Tap microphone to speak..." : "Type your message..."}
                placeholderTextColor="#6b7280"
                multiline
                onFocus={() => inputHeight.value = withSpring(80)}
                onBlur={() => inputHeight.value = withSpring(60)}
                onSubmitEditing={() => sendMessage(inputText)}
              />
              
              <Animated.View style={[styles.recordButton, recordingStyle]}>
                <TouchableOpacity onPress={toggleRecording} style={styles.recordButtonInner}>
                  <Ionicons 
                    name={isRecording ? "stop" : "mic"} 
                    size={20} 
                    color={isRecording ? "#ef4444" : "#e9d5ff"} 
                  />
                </TouchableOpacity>
              </Animated.View>
              
              <TouchableOpacity 
                onPress={() => sendMessage(inputText)} 
                style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                disabled={!inputText.trim()}
              >
                <Ionicons name="send" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Premium Features Bar */}
          <View style={styles.featuresBar}>
            <View style={styles.featureItem}>
              <Ionicons name="shield-checkmark" size={16} color="#10b981" />
              <Text style={styles.featureText}>Secure</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="flash" size={16} color="#f59e0b" />
              <Text style={styles.featureText}>Fast</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="brain" size={16} color="#ec4899" />
              <Text style={styles.featureText}>Smart</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="star" size={16} color="#fbbf24" />
              <Text style={styles.featureText}>Premium</Text>
            </View>
          </View>
        </BlurView>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  chatContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.85,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  chatBlur: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(147, 51, 234, 0.2)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#10b981',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(147, 51, 234, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  messagesContent: {
    paddingVertical: 16,
  },
  messageContainer: {
    marginVertical: 8,
    padding: 16,
    borderRadius: 16,
    maxWidth: '85%',
  },
  userMessage: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  sallieMessage: {
    backgroundColor: 'rgba(147, 51, 234, 0.2)',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
  },
  userSender: {
    color: '#10b981',
  },
  sallieSender: {
    color: '#9333ea',
  },
  timestamp: {
    fontSize: 10,
    color: '#9ca3af',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  userMessageText: {
    color: 'white',
  },
  sallieMessageText: {
    color: '#e9d5ff',
  },
  voiceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  voiceText: {
    fontSize: 10,
    color: '#a78bfa',
    marginLeft: 4,
  },
  messageInsights: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(147, 51, 234, 0.2)',
  },
  insightText: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 2,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    alignSelf: 'flex-start',
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9333ea',
  },
  smartRepliesContainer: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  smartReplyButton: {
    backgroundColor: 'rgba(147, 51, 234, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  smartReplyText: {
    fontSize: 12,
    color: '#e9d5ff',
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(147, 51, 234, 0.2)',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(147, 51, 234, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: 'rgba(147, 51, 234, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: 'white',
    fontSize: 14,
    maxHeight: 80,
  },
  recordButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordButtonInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#9333ea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(107, 114, 128, 0.3)',
  },
  featuresBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(147, 51, 234, 0.2)',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featureText: {
    fontSize: 12,
    color: '#a78bfa',
  },
});

export default ChatAreaPremium;
