import { useState, useEffect, useCallback, createContext, useContext } from 'react';

interface AnalyticsEvent {
  id: string;
  type: 'page_view' | 'click' | 'scroll' | 'form_submit' | 'search' | 'error' | 'performance' | 'ai_interaction';
  category: string;
  action: string;
  label?: string;
  value?: number;
  timestamp: number;
  userId?: string;
  sessionId: string;
  properties: Record<string, any>;
  metadata: {
    url: string;
    userAgent: string;
    referrer: string;
    screenResolution: string;
    viewportSize: string;
    language: string;
    timezone: string;
  };
}

interface UserBehavior {
  userId: string;
  sessionId: string;
  events: AnalyticsEvent[];
  startTime: number;
  endTime?: number;
  pageViews: number;
  timeOnPage: number;
  bounceRate: number;
  conversionRate: number;
  interactions: number;
  errors: number;
  performanceMetrics: PerformanceMetrics;
}

interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  memoryUsage: number;
  networkLatency: number;
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

  // Auto-fllush timer
  useEffect(() => {
    const interval = setInterval(() => {
      if (eventQueue.length > 0) {
        flushEvents();
      }
    }, finalConfig.flushInterval);

    return () => clearInterval(interval);
  }, [eventQueue, finalConfig.flushInterval]);

  // Track page unload
  useEffect(() => {
    const handleUnload = () => {
      if (eventQueue.length > 0) {
        flushEvents(true);
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [eventQueue]);

  const initializeAnalytics = useCallback(() => {
    try {
      // Generate or retrieve session ID
      let sessionId = sessionStorage.getItem('analytics_session_id');
      if (!sessionId) {
        sessionId = generateSessionId();
        sessionStorage.setItem('analytics_session_id', sessionId);
      }
      setSessionId(sessionId);

      // Initialize user behavior tracking
      const behavior: UserBehavior = {
        userId: getUserId(),
        sessionId,
        events: [],
        startTime: Date.now(),
        pageViews: 0,
        timeOnPage: 0,
        bounceRate: 0,
        conversionRate: 0,
        interactions: 0,
        errors: 0,
        performanceMetrics: getInitialPerformanceMetrics(),
      };
      setUserBehavior(behavior);

      // Start performance monitoring
      if (finalConfig.trackPerformance) {
        startPerformanceMonitoring();
      }

      // Track initial page view
      trackPageView(window.location.pathname, document.title);

      setIsInitialized(true);
    } catch (error) {
      console.error('Analytics initialization error:', error);
    }
  }, []);

  const generateSessionId = (): string => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const getUserId = (): string => {
    // Try to get user ID from auth context or local storage
    return localStorage.getItem('user_id') || 'anonymous';
  };

  const getInitialPerformanceMetrics = (): PerformanceMetrics => {
    return {
      pageLoadTime: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      cumulativeLayoutShift: 0,
      firstInputDelay: 0,
      memoryUsage: 0,
      networkLatency: 0,
    };
  };

  const startPerformanceMonitoring = () => {
    // Monitor Core Web Vitals
    if ('PerformanceObserver' in window) {
      // First Contentful Paint
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            updatePerformanceMetric('firstContentfulPaint', entry.startTime);
          }
        }
      });
      observer.observe({ entryTypes: ['paint'] });

      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        updatePerformanceMetric('largestContentfulPaint', lastEntry.startTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        updatePerformanceMetric('cumulativeLayoutShift', clsValue);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          updatePerformanceMetric('firstInputDelay', (entry as any).processingStart - entry.startTime);
        }
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
    }

    // Monitor memory usage
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      updatePerformanceMetric('memoryUsage', memory.usedJSHeapSize / 1024 / 1024);
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
      userId: getUserId(),
      sessionId,
      properties,
      metadata: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        screenResolution: `${screen.width}x${screen.height}`,
        viewportSize: `${window.innerWidth}x${window.innerHeight}`,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    };
  };

  const generateEventId = (): string => {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const trackEvent = useCallback((
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

    const event = createEvent(type, category, action, label, value, properties);
    
    setEventQueue(prev => [...prev, event]);
    
    // Update user behavior
    if (userBehavior) {
      const updatedBehavior = { ...userBehavior };
      updatedBehavior.events.push(event);
      
      if (type === 'page_view') updatedBehavior.pageViews++;
      if (type === 'error') updatedBehavior.errors++;
      updatedBehavior.interactions++;
      
      setUserBehavior(updatedBehavior);
    }

    // Track AI interactions for insights
    if (finalConfig.enableAI && type === 'ai_interaction') {
      generateAIInsight(event);
    }
  }, [finalConfig, isInitialized, userBehavior, sessionId]);

  const trackPageView = useCallback((path: string, title: string) => {
    trackEvent('page_view', 'navigation', 'page_view', title, undefined, { path });
  }, [trackEvent]);

  const trackClick = useCallback((element: string, properties: Record<string, any> = {}) => {
    trackEvent('click', 'engagement', 'click', element, undefined, properties);
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

  const trackAIInteraction = useCallback((
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
        keepalive: isSync,
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
    const avgTimeOnPage = userBehavior.pageViews > 0 ? sessionDuration / userBehavior.pageViews : 0;
    const errorRate = userBehavior.interactions > 0 ? (userBehavior.errors / userBehavior.interactions) * 100 : 0;

    return {
      sessionId: userBehavior.sessionId,
      duration: sessionDuration,
      pageViews: userBehavior.pageViews,
      interactions: userBehavior.interactions,
      errors: userBehavior.errors,
      errorRate,
      avgTimeOnPage,
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
      fcp: getPerformanceScore(performanceMetrics.firstContentfulPaint, 1800, 3000),
      lcp: getPerformanceScore(performanceMetrics.largestContentfulPaint, 2500, 4000),
      cls: getPerformanceScore(performanceMetrics.cumulativeLayoutShift, 0.1, 0.25),
      fid: getPerformanceScore(performanceMetrics.firstInputDelay, 100, 300),
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
    trackPageView,
    trackClick,
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
