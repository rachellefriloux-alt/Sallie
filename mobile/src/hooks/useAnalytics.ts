import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Application from 'expo-application';

interface AnalyticsEvent {
  id: string;
  type: 'screen_view' | 'tap' | 'scroll' | 'form_submit' | 'search' | 'error' | 'performance' | 'ai_interaction';
  category: string;
  action: string;
  label?: string;
  value?: number;
  timestamp: number;
  userId?: string;
  sessionId: string;
  properties: Record<string, any>;
  metadata: {
    platform: string;
    appVersion: string;
    deviceModel: string;
    osVersion: string;
    carrier?: string;
    networkType: string;
    batteryLevel?: number;
    memoryUsage: number;
    storageUsage: number;
  };
}

interface UserBehavior {
  userId: string;
  sessionId: string;
  events: AnalyticsEvent[];
  startTime: number;
  endTime?: number;
  screenViews: number;
  timeOnScreen: number;
  bounceRate: number;
  conversionRate: number;
  interactions: number;
  errors: number;
  performanceMetrics: PerformanceMetrics;
}

interface PerformanceMetrics {
  appStartTime: number;
  screenRenderTime: number;
  memoryUsage: number;
  storageUsage: number;
  networkLatency: number;
  batteryLevel: number;
  cpuUsage: number;
}

interface AIInsight {
  id: string;
  type: 'recommendation' | 'prediction' | 'anomaly' | 'trend' | 'sentiment';
  title: string;
  description: string;
  confidence: number;
  data: any;
  timestamp: number;
  actionable: boolean;
  category: string;
}

interface AnalyticsConfig {
  enableTracking: boolean;
  enableAI: boolean;
  samplingRate: number;
  batchSize: number;
  flushInterval: number;
  apiEndpoint: string;
  apiKey: string;
  trackPerformance: boolean;
  trackErrors: boolean;
  trackUserBehavior: boolean;
  trackLocation: boolean;
}

const DEFAULT_CONFIG: AnalyticsConfig = {
  enableTracking: true,
  enableAI: true,
  samplingRate: 1.0,
  batchSize: 10,
  flushInterval: 5000,
  apiEndpoint: 'http://192.168.1.47:8742/api/analytics',
  apiKey: 'analytics_key',
  trackPerformance: true,
  trackErrors: true,
  trackUserBehavior: true,
  trackLocation: false,
};

export function useAnalytics(config: Partial<AnalyticsConfig> = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [eventQueue, setEventQueue] = useState<AnalyticsEvent[]>([]);
  const [userBehavior, setUserBehavior] = useState<UserBehavior | null>(null);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);

  // Initialize analytics
  useEffect(() => {
    if (finalConfig.enableTracking) {
      initializeAnalytics();
    }
  }, []);

  // Flush events periodically
  useEffect(() => {
    if (eventQueue.length >= finalConfig.batchSize) {
      flushEvents();
    }
  }, [eventQueue]);

  // Auto-flush timer
  useEffect(() => {
    const interval = setInterval(() => {
      if (eventQueue.length > 0) {
        flushEvents();
      }
    }, finalConfig.flushInterval);

    return () => clearInterval(interval);
  }, [eventQueue, finalConfig.flushInterval]);

  // Track app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'background' && eventQueue.length > 0) {
        flushEvents();
      }
    };

    // In a real app, you'd use AppState.addEventListener
    // For now, we'll simulate this
    return () => {};
  }, [eventQueue]);

  const initializeAnalytics = useCallback(async () => {
    try {
      // Generate or retrieve session ID
      let sessionId = await AsyncStorage.getItem('analytics_session_id');
      if (!sessionId) {
        sessionId = generateSessionId();
        await AsyncStorage.setItem('analytics_session_id', sessionId);
      }
      setSessionId(sessionId);

      // Initialize user behavior tracking
      const behavior: UserBehavior = {
        userId: await getUserId(),
        sessionId,
        events: [],
        startTime: Date.now(),
        screenViews: 0,
        timeOnScreen: 0,
        bounceRate: 0,
        conversionRate: 0,
        interactions: 0,
        errors: 0,
        performanceMetrics: await getInitialPerformanceMetrics(),
      };
      setUserBehavior(behavior);

      // Start performance monitoring
      if (finalConfig.trackPerformance) {
        startPerformanceMonitoring();
      }

      // Track initial screen view
      trackScreenView('Home', 'Home Screen');

      setIsInitialized(true);
    } catch (error) {
      console.error('Analytics initialization error:', error);
    }
  }, []);

  const generateSessionId = (): string => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const getUserId = async (): Promise<string> => {
    // Try to get user ID from auth context or async storage
    try {
      const userId = await AsyncStorage.getItem('user_id');
      return userId || 'anonymous';
    } catch {
      return 'anonymous';
    }
  };

  const getInitialPerformanceMetrics = async (): Promise<PerformanceMetrics> => {
    try {
      const memoryUsage = await getMemoryUsage();
      const storageUsage = await getStorageUsage();
      const batteryLevel = await getBatteryLevel();

      return {
        appStartTime: 0,
        screenRenderTime: 0,
        memoryUsage,
        storageUsage,
        networkLatency: 0,
        batteryLevel,
        cpuUsage: 0,
      };
    } catch (error) {
      console.error('Error getting initial performance metrics:', error);
      return {
        appStartTime: 0,
        screenRenderTime: 0,
        memoryUsage: 0,
        storageUsage: 0,
        networkLatency: 0,
        batteryLevel: 0,
        cpuUsage: 0,
      };
    }
  };

  const startPerformanceMonitoring = async () => {
    try {
      // Monitor memory usage
      setInterval(async () => {
        const memoryUsage = await getMemoryUsage();
        updatePerformanceMetric('memoryUsage', memoryUsage);
      }, 10000);

      // Monitor storage usage
      setInterval(async () => {
        const storageUsage = await getStorageUsage();
        updatePerformanceMetric('storageUsage', storageUsage);
      }, 30000);

      // Monitor battery level
      setInterval(async () => {
        const batteryLevel = await getBatteryLevel();
        updatePerformanceMetric('batteryLevel', batteryLevel);
      }, 60000);

      // Monitor network latency
      setInterval(async () => {
        const latency = await measureNetworkLatency();
        updatePerformanceMetric('networkLatency', latency);
      }, 30000);
    } catch (error) {
      console.error('Error starting performance monitoring:', error);
    }
  };

  const getMemoryUsage = async (): Promise<number> => {
    try {
      // In a real app, you'd use a library like react-native-performance
      // For now, we'll simulate memory usage
      return Math.random() * 100 + 50; // MB
    } catch {
      return 0;
    }
  };

  const getStorageUsage = async (): Promise<number> => {
    try {
      // In a real app, you'd use expo-file-system
      // For now, we'll simulate storage usage
      return Math.random() * 1000 + 100; // MB
    } catch {
      return 0;
    }
  };

  const getBatteryLevel = async (): Promise<number> => {
    try {
      // In a real app, you'd use expo-battery
      // For now, we'll simulate battery level
      return Math.random() * 100; // Percentage
    } catch {
      return 0;
    }
  };

  const measureNetworkLatency = async (): Promise<number> => {
    try {
      const startTime = Date.now();
      const response = await fetch('https://httpbin.org/delay/0', { method: 'HEAD' });
      const endTime = Date.now();
      return endTime - startTime;
    } catch {
      return 0;
    }
  };

  const updatePerformanceMetric = (metric: keyof PerformanceMetrics, value: number) => {
    setPerformanceMetrics(prev => ({
      ...prev!,
      [metric]: value,
    }));
  };

  const createEvent = (
    type: AnalyticsEvent['type'],
    category: string,
    action: string,
    label?: string,
    value?: number,
    properties: Record<string, any> = {}
  ): AnalyticsEvent => {
    return {
      id: generateEventId(),
      type,
      category,
      action,
      label,
      value,
      timestamp: Date.now(),
      userId: undefined, // Will be set asynchronously
      sessionId,
      properties,
      metadata: {
        platform: Platform.OS,
        appVersion: Application.version || '1.0.0',
        deviceModel: Device.modelName || 'Unknown',
        osVersion: Device.osVersion || 'Unknown',
        networkType: 'unknown', // Would use expo-network
        memoryUsage: performanceMetrics?.memoryUsage || 0,
        storageUsage: performanceMetrics?.storageUsage || 0,
      },
    };
  };

  const generateEventId = (): string => {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const trackEvent = useCallback(async (
    type: AnalyticsEvent['type'],
    category: string,
    action: string,
    label?: string,
    value?: number,
    properties: Record<string, any> = {}
  ) => {
    if (!finalConfig.enableTracking || !isInitialized) return;

    // Apply sampling
    if (Math.random() > finalConfig.samplingRate) return;

    const userId = await getUserId();
    const event = createEvent(type, category, action, label, value, properties);
    event.userId = userId;
    
    setEventQueue(prev => [...prev, event]);
    
    // Update user behavior
    if (userBehavior) {
      const updatedBehavior = { ...userBehavior };
      updatedBehavior.events.push(event);
      
      if (type === 'screen_view') updatedBehavior.screenViews++;
      if (type === 'error') updatedBehavior.errors++;
      updatedBehavior.interactions++;
      
      setUserBehavior(updatedBehavior);
    }

    // Track AI interactions for insights
    if (finalConfig.enableAI && type === 'ai_interaction') {
      generateAIInsight(event);
    }
  }, [finalConfig, isInitialized, userBehavior, sessionId]);

  const trackScreenView = useCallback((screenName: string, screenClass: string) => {
    trackEvent('screen_view', 'navigation', 'screen_view', screenName, undefined, { screenClass });
  }, [trackEvent]);

  const trackTap = useCallback((element: string, properties: Record<string, any> = {}) => {
    trackEvent('tap', 'engagement', 'tap', element, undefined, properties);
  }, [trackEvent]);

  const trackFormSubmit = useCallback((formName: string, success: boolean) => {
    trackEvent('form_submit', 'conversion', 'form_submit', formName, success ? 1 : 0, { success });
  }, [trackEvent]);

  const trackSearch = useCallback((query: string, resultsCount: number) => {
    trackEvent('search', 'engagement', 'search', query, resultsCount, { query, resultsCount });
  }, [trackEvent]);

  const trackError = useCallback((error: Error, context: string) => {
    trackEvent('error', 'system', 'error', error.name, undefined, {
      message: error.message,
      stack: error.stack,
      context,
    });
  }, [trackEvent]);

  const trackPerformance = useCallback((metric: string, value: number) => {
    trackEvent('performance', 'performance', metric, undefined, value, { metric });
  }, [trackEvent]);

  const trackAIInteraction = useCallback(async (
    action: string,
    model: string,
    input: string,
    output: string,
    confidence: number,
    responseTime: number
  ) => {
    trackEvent('ai_interaction', 'ai', action, model, confidence, {
      input: input.substring(0, 100),
      output: output.substring(0, 100),
      responseTime,
    });
  }, [trackEvent]);

  const generateAIInsight = async (event: AnalyticsEvent) => {
    try {
      // Call AI service to generate insights
      const response = await fetch(`${finalConfig.apiEndpoint}/ai-insights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${finalConfig.apiKey}`,
        },
        body: JSON.stringify({
          event,
          userBehavior,
          performanceMetrics,
        }),
      });

      if (response.ok) {
        const insights: AIInsight[] = await response.json();
        setAiInsights(prev => [...prev, ...insights]);
      }
    } catch (error) {
      console.error('Error generating AI insights:', error);
    }
  };

  const flushEvents = async (isSync = false) => {
    if (eventQueue.length === 0) return;

    const eventsToSend = [...eventQueue];
    setEventQueue([]);

    try {
      const response = await fetch(`${finalConfig.apiEndpoint}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${finalConfig.apiKey}`,
        },
        body: JSON.stringify({
          events: eventsToSend,
          sessionId,
          userBehavior,
          performanceMetrics,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      // Clear sent events from queue
      setEventQueue(prev => prev.filter(event => !eventsToSend.includes(event)));
    } catch (error) {
      console.error('Error flushing analytics events:', error);
      // Re-add failed events to queue
      setEventQueue(prev => [...eventsToSend, ...prev]);
    }
  };

  const getAnalyticsSummary = useCallback(() => {
    if (!userBehavior) return null;

    const now = Date.now();
    const sessionDuration = now - userBehavior.startTime;
    const avgTimeOnScreen = userBehavior.screenViews > 0 ? sessionDuration / userBehavior.screenViews : 0;
    const errorRate = userBehavior.interactions > 0 ? (userBehavior.errors / userBehavior.interactions) * 100 : 0;

    return {
      sessionId: userBehavior.sessionId,
      duration: sessionDuration,
      screenViews: userBehavior.screenViews,
      interactions: userBehavior.interactions,
      errors: userBehavior.errors,
      errorRate,
      avgTimeOnScreen,
      performanceMetrics,
      aiInsights: aiInsights.length,
    };
  }, [userBehavior, performanceMetrics, aiInsights]);

  const getAIRecommendations = useCallback((category?: string) => {
    return aiInsights.filter(insight => 
      insight.actionable && 
      insight.type === 'recommendation' &&
      (!category || insight.category === category)
    );
  }, [aiInsights]);

  const getPerformanceReport = useCallback(() => {
    if (!performanceMetrics) return null;

    const scores = {
      memory: getPerformanceScore(performanceMetrics.memoryUsage, 100, 200),
      storage: getPerformanceScore(performanceMetrics.storageUsage, 500, 1000),
      battery: getPerformanceScore(100 - performanceMetrics.batteryLevel, 20, 50),
      network: getPerformanceScore(performanceMetrics.networkLatency, 500, 1500),
    };

    const overallScore = Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length;

    return {
      metrics: performanceMetrics,
      scores,
      overallScore,
      grade: getPerformanceGrade(overallScore),
    };
  }, [performanceMetrics]);

  const getPerformanceScore = (value: number, good: number, poor: number): number => {
    if (value <= good) return 100;
    if (value >= poor) return 0;
    return Math.round(((poor - value) / (poor - good)) * 100);
  };

  const getPerformanceGrade = (score: number): string => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  return {
    // State
    isInitialized,
    sessionId,
    eventQueue,
    userBehavior,
    aiInsights,
    performanceMetrics,
    
    // Tracking methods
    trackEvent,
    trackScreenView,
    trackTap,
    trackFormSubmit,
    trackSearch,
    trackError,
    trackPerformance,
    trackAIInteraction,
    
    // Analytics methods
    flushEvents,
    getAnalyticsSummary,
    getAIRecommendations,
    getPerformanceReport,
  };
}

// Analytics context
const AnalyticsContext = createContext<ReturnType<typeof useAnalytics> | null>(null);

export const AnalyticsProvider = ({ children, config }: { 
  children: React.ReactNode;
  config?: Partial<AnalyticsConfig>;
}) => {
  const analytics = useAnalytics(config);
  
  return (
    <AnalyticsContext.Provider value={analytics}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};
