import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Animated,
  Dimensions,
  Alert,
  Share,
  Clipboard,
  Vibration,
  Platform,
  StatusBar,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
  useSafeAreaFrame,
} from 'react-native-safe-area-context';
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';
import {
  BlurView,
} from '@react-native-community/blur';
import {
  GestureHandlerRootView,
  PanGestureHandler,
  State,
} from 'react-native-gesture-handler';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import {
  useTheme,
  useNavigationBuilder,
} from '@react-navigation/native';

// Enhanced Icons
import {
  Brain,
  Heart,
  MessageSquare,
  Settings,
  Users,
  Shield,
  Zap,
  Activity,
  Database,
  GitBranch,
  Clock,
  Calendar,
  FileText,
  Search,
  Bookmark,
  Star,
  TrendingUp,
  BarChart3,
  PieChart,
  LineChart,
  Cpu,
  MemoryStick,
  HardDrive,
  Wifi,
  WifiOff,
  Battery,
  BatteryCharging,
  Volume2,
  VolumeX,
  Bell,
  BellOff,
  Moon,
  Sun,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Lock,
  Unlock,
  User,
  Bot,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Plus,
  Minus,
  X,
  Check,
  AlertCircle,
  Info,
  HelpCircle,
  Command,
  ZapOff,
  Power,
  PowerOff,
  RefreshCw,
  Download,
  Upload,
  Share,
  Link,
  ExternalLink,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Copy,
  Move,
  RotateCcw,
  Save,
  Folder,
  FolderOpen,
  File,
  FilePlus,
  FileMinus,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FileCode,
  FileArchive,
  FileSpreadsheet,
  FilePresentation,
  FileQuestion,
  FileWarning,
  FileCheck,
  FileX,
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai' | 'system';
  timestamp: number;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'error';
  metadata?: {
    processingTime?: number;
    confidence?: number;
    emotionalTone?: string;
    relatedDimension?: string;
    limbicState?: {
      trust: number;
      warmth: number;
      arousal: number;
      valence: number;
      posture: string;
    };
    reactions?: {
      [key: string]: number;
    };
    bookmarks?: number;
    isEdited?: boolean;
    editHistory?: Array<{
      timestamp: number;
      text: string;
    }>;
  };
}

interface SystemStatus {
  ghostInterface: boolean;
  cliInterface: boolean;
  activeVeto: boolean;
  foundryEval: boolean;
  memoryHygiene: boolean;
  voiceCommands: boolean;
  undoWindow: boolean;
  brainForge: boolean;
}

interface PerformanceMetrics {
  renderTime: number;
  messageLatency: number;
  memoryUsage: number;
  cpuUsage: number;
}

interface DashboardProps {
  systemStatus: SystemStatus;
  performanceMetrics: PerformanceMetrics;
  theme: 'light' | 'dark' | 'auto';
}

export function DashboardPremium({ systemStatus, performanceMetrics, theme }: DashboardProps) {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const frame = useSafeAreaFrame();
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm Sallie, your AI companion. How can I help you today?",
      sender: 'ai',
      timestamp: Date.now() - 60000,
      status: 'delivered',
      metadata: {
        processingTime: 45,
        confidence: 0.95,
        emotionalTone: 'warm',
        limbicState: {
          trust: 0.8,
          warmth: 0.7,
          arousal: 0.6,
          valence: 0.7,
          posture: 'companion'
        }
      }
    },
    {
      id: '2',
      text: "Hi Sallie! I'd like to know more about your capabilities.",
      sender: 'user',
      timestamp: Date.now() - 55000,
      status: 'delivered'
    },
    {
      id: '3',
      text: "I'm here to assist you with various tasks including conversation, analysis, creative work, and much more. I'm designed to be a helpful and intelligent companion.",
      sender: 'ai',
      timestamp: Date.now() - 50000,
      status: 'delivered',
      metadata: {
        processingTime: 32,
        confidence: 0.98,
        emotionalTone: 'helpful',
        limbicState: {
          trust: 0.85,
          warmth: 0.8,
          arousal: 0.7,
          valence: 0.8,
          posture: 'companion'
        }
      }
    }
  ]);
  
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [showSystemPanel, setShowSystemPanel] = useState(false);
  const [showPerformancePanel, setShowPerformancePanel] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark' | 'auto'>('dark');
  
  // Animated values
  const scrollY = useSharedValue(0);
  const headerHeight = useSharedValue(80);
  const inputHeight = useSharedValue(80);
  const sidebarWidth = useSharedValue(280);
  const sidebarOpacity = useSharedValue(1);
  
  // Refs
  const scrollViewRef = useRef<ScrollView>(null);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const textInputRef = useRef<TextInput>(null);
  
  // Calculate system health
  const systemHealth = useMemo(() => {
    const activeSystems = Object.values(systemStatus).filter(Boolean).length;
    const totalSystems = Object.keys(systemStatus).length;
    return (activeSystems / totalSystems) * 100;
  }, [systemStatus]);
  
  // Calculate performance score
  const performanceScore = useMemo(() => {
    const { renderTime, messageLatency, memoryUsage, cpuUsage } = performanceMetrics;
    
    const renderScore = Math.max(0, 100 - renderTime);
    const latencyScore = Math.max(0, 100 - messageLatency / 10);
    const memoryScore = Math.max(0, 100 - (memoryUsage / 1024 / 1024 / 100));
    const cpuScore = Math.max(0, 100 - cpuUsage);
    
    return (renderScore + latencyScore + memoryScore + cpuScore) / 4;
  }, [performanceMetrics]);
  
  // Enhanced message sending
  const handleSend = useCallback(async () => {
    if (!inputText.trim() || !isConnected) return;
    
    const messageText = inputText.trim();
    setInputText('');
    
    try {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: messageText,
        sender: 'user',
        timestamp: Date.now(),
        status: 'sending',
        metadata: {
          limbicState: {
            trust: 0.8,
            warmth: 0.7,
            arousal: 0.6,
            valence: 0.7,
            posture: 'companion'
          }
        }
      };
      
      setMessages(prev => [...prev, newMessage]);
      
      // Simulate API call
      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, status: 'delivered' }
            : msg
        ));
        
        // Simulate AI response
        setTimeout(() => {
          setIsTyping(true);
          
          setTimeout(() => {
            const aiResponse: Message = {
              id: (Date.now() + 1).toString(),
              text: "I understand! Let me help you with that. I'm designed to be a helpful and intelligent companion.",
              sender: 'ai',
              timestamp: Date.now(),
              status: 'delivered',
              metadata: {
                processingTime: 38,
                confidence: 0.96,
                emotionalTone: 'helpful',
                limbicState: {
                  trust: 0.9,
                  warmth: 0.85,
                  arousal: 0.75,
                  valence: 0.85,
                  posture: 'companion'
                }
              }
            };
            
            setMessages(prev => [...prev, aiResponse]);
            setIsTyping(false);
          }, 2000);
        }, 500);
      }, 100);
      
    } catch (error) {
      console.error('Error sending message:', error);
      setInputText(messageText);
    }
  }, [inputText, isConnected]);
  
  // Enhanced voice recording
  const handleVoiceToggle = useCallback(() => {
    setIsRecording(!isRecording);
    if (Platform.OS === 'ios') {
      Vibration.vibrate(0);
    }
    // Voice recording logic would go here
  }, [isRecording]);
  
  // Enhanced keyboard handling
  const handleKeyPress = useCallback((e: any) => {
    if (e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
      handleSend();
    }
  }, [handleSend]);
  
  // Enhanced message formatting
  const formatMessage = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`(.*?)`/g, '$1');
  };
  
  // Enhanced message status
  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'sending':
        return <Clock size={12} color="#9CA3AF" />;
      case 'sent':
        return <Check size={12} color="#3B82F6" />;
      case 'delivered':
        return <CheckCheck size={12} color="#10B981" />;
      case 'read':
        return <CheckCheck size={12} color="#8B5CF6" />;
      case 'error':
        return <AlertCircle size={12} color="#EF4444" />;
      default:
        return null;
    }
  };
  
  // Enhanced scroll handling
  const handleScroll = useCallback((event: any) => {
    scrollY.value = event.nativeEvent.contentOffset.y;
  }, []);
  
  const scrollToBottom = useCallback(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, []);
  
  // Auto-scroll when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);
  
  // Enhanced message item component
  const MessageItem = useCallback(({ message, index }: { message: Message; index: number }) => {
    const isUser = message.sender === 'user';
    const animatedValue = useSharedValue(0);
    
    useEffect(() => {
      animatedValue.value = withSpring(animatedValue.value, 1);
    }, []);
    
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        {
          translateY: interpolate(animatedValue.value, [0, 1], [20, 0], Extrapolate.CLAMP),
          opacity: interpolate(animatedValue.value, [0, 1], [0, 1], Extrapolate.CLAMP),
        },
      ],
    }));
    
    return (
      <Animated.View style={[styles.messageContainer, animatedStyle]}>
        <View style={isUser ? styles.userMessage : styles.aiMessage}>
          {/* Avatar */}
          <View style={[styles.avatar, isUser ? styles.userAvatar : styles.aiAvatar]}>
            {isUser ? (
              <User size={16} color="#FFFFFF" />
            ) : (
              <Bot size={16} color="#FFFFFF" />
            )}
          </View>
          
          {/* Message Content */}
          <View style={styles.messageContent}>
            <Text style={styles.messageText}>
              {formatMessage(message.text)}
            </Text>
            
            {/* Metadata */}
            {message.metadata && (
              <View style={styles.messageMetadata}>
                {message.metadata.processingTime && (
                  <View style={styles.metadataItem}>
                    <Zap size={12} color="#10B981" />
                    <Text style={styles.metadataText}>
                      {message.metadata.processingTime.toFixed(0)}ms
                    </Text>
                  </View>
                )}
                {message.metadata.confidence && (
                  <View style={styles.metadataItem}>
                    <Brain size={12} color="#3B82F6" />
                    <Text style={styles.metadataText}>
                      {(message.metadata.confidence * 100).toFixed(0)}%
                    </Text>
                  </View>
                )}
                {message.metadata.emotionalTone && (
                  <View style={styles.metadataItem}>
                    <Heart size={12} color="#EC4899" />
                    <Text style={styles.metadataText}>
                      {message.metadata.emotionalTone}
                    </Text>
                  </View>
                )}
              </View>
            )}
            
            {/* Status */}
            <View style={styles.messageStatus}>
              {getStatusIcon(message.status)}
              <Text style={styles.timestamp}>
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>
    );
  }, []);
  
  // Enhanced system status component
  const SystemStatusItem = useCallback(({ icon, label, isActive }: { icon: React.ReactNode; label: string; isActive: boolean }) => (
    <View style={[styles.systemStatusItem, isActive ? styles.systemStatusActive : styles.systemStatusInactive]}>
      <View style={styles.systemStatusIcon}>{icon}</View>
      <View style={styles.systemStatusInfo}>
        <Text style={styles.systemStatusLabel}>{label}</Text>
        <Text style={styles.systemStatusValue}>{isActive ? 'Active' : 'Inactive'}</Text>
      </View>
    </View>
  ), []);
  
  // Enhanced render item
  const renderMessage = useCallback(({ item, index }: { item: Message; index: number }) => (
    <MessageItem message={item} index={index} />
  ), []);
  
  // Enhanced header animation
  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(scrollY.value, [0, 100], [0, -20], Extrapolate.CLAMP),
        opacity: interpolate(scrollY.value, [0, 100], [1, 0.8], Extrapolate.CLAMP),
      },
    ],
  }));
  
  // Enhanced input animation
  const inputAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(scrollY.value, [0, 100], [0, 20], Extrapolate.CLAMP),
      },
    ],
  ));
  
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <StatusBar
          barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
          backgroundColor={theme === 'dark' ? '#1F2937' : '#F3F4F6'}
        />
        
        {/* Enhanced Header */}
        <Animated.View style={[styles.header, headerAnimatedStyle]}>
          <BlurView intensity={20} style={styles.headerBlur}>
            <View style={styles.headerContent}>
              {/* Logo and Title */}
              <View style={styles.headerLeft}>
                <View style={styles.logo}>
                  <Brain size={24} color="#FFFFFF" />
                </View>
                <View style={styles.headerTitle}>
                  <Text style={styles.headerMainTitle}>Sallie Studio</Text>
                  <Text style={styles.headerSubtitle}>Your AI companion</Text>
                </View>
              </View>
              
              {/* Status and Controls */}
              <View style={styles.headerRight}>
                {/* Connection Status */}
                <View style={styles.connectionStatus}>
                  <View style={[styles.statusDot, isConnected ? styles.statusActive : styles.statusInactive]} />
                  <Text style={[styles.statusText, isConnected ? styles.statusTextActive : styles.statusTextInactive]}>
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </Text>
                </View>
                
                {/* System Health */}
                <View style={styles.systemHealth}>
                  <Shield size={16} color="#10B981" />
                  <Text style={styles.systemHealthText}>{systemHealth.toFixed(0)}%</Text>
                </View>
                
                {/* Performance Score */}
                <View style={styles.performanceScore}>
                  <Zap size={16} color="#3B82F6" />
                  <Text style={styles.performanceScoreText}>{performanceScore.toFixed(0)}%</Text>
                </View>
                
                {/* Menu Button */}
                <TouchableOpacity
                  style={styles.menuButton}
                  onPress={() => setShowSystemPanel(!showSystemPanel)}
                >
                  <Settings size={20} color="#E5E7EB" />
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
        </Animated.View>
        
        {/* Enhanced System Status Bar */}
        {showSystemPanel && (
          <Animated.View
            entering={Spring}
            style={styles.systemStatusPanel}
          >
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.systemStatusContainer}>
                <SystemStatusItem
                  icon={<Text style={styles.systemStatusIconText}>👻</Text>}
                  label="Ghost Interface"
                  isActive={systemStatus.ghostInterface}
                />
                <SystemStatusItem
                  icon={<Text style={styles.systemStatusIconText}>💻</Text>}
                  label="CLI Interface"
                  isActive={systemStatus.cliInterface}
                />
                <SystemStatusItem
                  icon={<Text style={styles.systemStatusIconText}>🗳️</Text>}
                  label="Active Veto"
                  isActive={systemStatus.activeVeto}
                />
                <SystemStatusItem
                  icon={<Text style={styles.systemStatusIconText}>🔨</Text>}
                  label="Foundry"
                  isActive={systemStatus.foundryEval}
                />
                <SystemStatusItem
                  icon={<Text style={styles.systemStatusIconText}>🧹</Text>}
                  label="Memory Hygiene"
                  isActive={systemStatus.memoryHygiene}
                />
                <SystemStatusItem
                  icon={<Text style={styles.systemStatusIconText}>🎤</Text>}
                  label="Voice Commands"
                  isActive={systemStatus.voiceCommands}
                />
                <SystemStatusItem
                  icon={<Text style={systemStatusIconText}>⏰</Text>}
                  label="Undo Window"
                  isActive={systemStatus.undoWindow}
                />
                <SystemStatusItem
                  icon={<Text style={styles.systemStatusIconText}>🧠</Text>}
                  label="Brain Forge"
                  isActive={systemStatus.brainForge}
                />
              </View>
            </ScrollView>
          </Animated.View>
        )}
        
        {/* Enhanced Messages Area */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          onScroll={handleScroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.messagesList}>
            <FlatList
              data={messages}
              renderItem={({ item, index }) => renderMessage({ item, index })}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.messageListContainer}
              showsVerticalScrollIndicator={false}
            />
            
            {/* Typing Indicator */}
            {isTyping && (
              <Animated.View
                entering={Spring}
                style={styles.typingIndicator}
              >
                <View style={styles.typingContent}>
                  <View style={styles.typingDots}>
                    <Animated.View
                      style={styles.typingDot}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 800, repeat: true }}
                    />
                    <Animated.View
                      style={styles.typingDot}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 800, repeat: true, delay: 200 }}
                    />
                    <Animated.View
                      style={styles.typingDot}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 800, repeat: true, delay: 400 }}
                    />
                  </View>
                  <Text style={styles.typingText}>Sallie is thinking...</Text>
                </View>
              </Animated.View>
            )}
          </View>
        </ScrollView>
        
        {/* Enhanced Input Area */}
        <Animated.View style={[styles.inputContainer, inputAnimatedStyle]}>
          <BlurView intensity={20} style={styles.inputBlur}>
            <View style={styles.inputContent}>
              {/* Attachment Button */}
              <TouchableOpacity style={styles.inputButton}>
                <FileText size={20} color="#E5E7EB" />
              </TouchableOpacity>
              
              {/* Text Input */}
              <TextInput
                ref={textInputRef}
                style={styles.textInput}
                value={inputText}
                onChangeText={setInputText}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                placeholderTextColor="#9CA3AF"
                multiline
                textAlignVertical="center"
                maxLength={2000}
              />
              
              {/* Character Count */}
              {inputText.length > 0 && (
                <Text style={styles.characterCount}>
                  {inputText.length}/2000
                </Text>
              )}
              
              {/* Control Buttons */}
              <View style={styles.inputButtons}>
                <TouchableOpacity
                  style={[styles.inputButton, isRecording ? styles.recordingButton : null]}
                  onPress={handleVoiceToggle}
                >
                  {isRecording ? (
                    <MicOff size={20} color="#EF4444" />
                  ) : (
                    <Mic size={20} color="#E5E7EB" />
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.inputButton}
                  onPress={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  <Smile size={20} color="#E5E7EB" />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.sendButton, inputText.trim() ? styles.sendButtonActive : null]}
                  onPress={handleSend}
                  disabled={!inputText.trim() || !isConnected}
                >
                  <Send size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
        </Animated.View>
        
        {/* Enhanced Performance Panel */}
        {showPerformancePanel && (
          <Animated.View
            entering={Spring}
            style={styles.performancePanel}
          >
            <BlurView intensity={20} style={styles.performanceBlur}>
              <View style={styles.performanceContent}>
                <Text style={styles.performanceTitle}>Performance Metrics</Text>
                <View style={styles.performanceMetrics}>
                  <View style={styles.performanceMetric}>
                    <Activity size={16} color="#10B981" />
                    <Text style={styles.performanceText}>Render: {performanceMetrics.renderTime.toFixed(2)}ms</Text>
                  </View>
                  <View style={styles.performanceMetric}>
                    <MemoryStick size={16} color="#3B82F6" />
                    <Text style={styles.performanceText}>Memory: {(performanceMetrics.memoryUsage / 1024 / 1024).toFixed(1)}MB</Text>
                  </View>
                  <View style={styles.performanceMetric}>
                    <Zap size={16} color="#F59E0B" />
                    <Text style={styles.performanceText}>CPU: {performanceMetrics.cpuUsage.toFixed(1)}%</Text>
                  </View>
                  <View style={styles.performanceMetric}>
                    <Globe size={16} color="#8B5CF6" />
                    <Text style={styles.performanceText}>Latency: {performanceMetrics.messageLatency}ms</Text>
                  </View>
                </View>
              </View>
            </BlurView>
          </Animated.View>
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    zIndex: 100,
  },
  headerBlur: {
    flex: 1,
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: '#4C1D95',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    space: 12,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
  },
  headerMainTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    space: 16,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    space: 6,
    backgroundColor: '#1F2937',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusActive: {
    backgroundColor: '#10B981',
  },
  statusInactive: {
    backgroundColor: '#EF4444',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusTextActive: {
    color: '#10B981',
  },
  statusTextInactive: {
    color: '#EF4444',
  },
  systemHealth: {
    flexDirection: 'row',
    alignItems: 'center',
    space: 6,
    backgroundColor: '#065F46',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  systemHealthText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#10B981',
  },
  performanceScore: {
    flexDirection: 'row',
    alignItems: 'center',
    space: 6,
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  performanceScoreText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#3B82F6',
  },
  menuButton: {
    padding: 8,
    backgroundColor: '#374151',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  systemStatusPanel: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#4C1D95',
    zIndex: 90,
  },
  systemStatusContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  systemStatusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    space: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 8,
  },
  systemStatusActive: {
    backgroundColor: '#065F46',
  },
  systemStatusInactive: {
    backgroundColor: '#7F1D1D',
  },
  systemStatusIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  systemStatusIconText: {
    fontSize: 16,
  },
  systemStatusInfo: {
    flex: 1,
  },
  systemStatusLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#E5E7EB',
  },
  systemStatusValue: {
    fontSize: 8,
    color: '#9CA3AF',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 96,
    paddingBottom: 100,
  },
  messagesList: {
    paddingBottom: 16,
  },
  messageListContainer: {
    paddingHorizontal: 0,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  userMessage: {
    flexDirection: 'row-reverse',
  },
  aiMessage: {
    flexDirection: 'row',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    marginRight: 8,
  },
  userAvatar: {
    backgroundColor: '#8B5CF6',
  },
  aiAvatar: {
    backgroundColor: '#3B82F6',
  },
  messageContent: {
    flex: 1,
    maxWidth: width * 0.8,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#4C1D95',
  },
  messageText: {
    fontSize: 14,
    color: '#E5E7EB',
    lineHeight: 20,
  },
  messageMetadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    space: 4,
  },
  metadataText: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  messageStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 4,
  },
  timestamp: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  typingIndicator: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 12,
  },
  typingContent: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#4C1D95',
    flexDirection: 'row',
    alignItems: 'center',
    space: 8,
  },
  typingDots: {
    flexDirection: 'row',
    space: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8B5CF6',
  },
  typingText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    zIndex: 100,
  },
  inputBlur: {
    flex: 1,
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    borderTopWidth: 1,
    borderTopColor: '#4C1D95',
  },
  inputContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#374151',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#E5E7EB',
    borderWidth: 1,
    borderColor: '#4B5563',
    maxHeight: 60,
  },
  characterCount: {
    fontSize: 10,
    color: '#9CA3AF',
    position: 'absolute',
    bottom: 4,
    right: 16,
  },
  inputButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingButton: {
    backgroundColor: '#EF4444',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#8B5CF6',
  },
  performancePanel: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    height: 120,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#4C1D95',
    zIndex: 90,
  },
  performanceBlur: {
    flex: 1,
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderRadius: 16,
  },
  performanceContent: {
    flex: 1,
    padding: 16,
  },
  performanceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E5E7EB',
    marginBottom: 12,
  },
  performanceMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  performanceMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    space: 6,
  },
  performanceText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});
