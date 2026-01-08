import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  networkLatency: number;
  messageLatency: number;
  fps: number;
  cpuUsage: number;
}

interface PerformanceAlert {
  type: 'high_memory' | 'high_cpu' | 'slow_render' | 'network_slow';
  message: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    networkLatency: 0,
    messageLatency: 0,
    fps: 60,
    cpuUsage: 0,
  });
  
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  
  const renderStartTime = useRef<number>(Date.now());
  const frameCount = useRef<number>(0);
  const lastFrameTime = useRef<number>(Date.now());
  const metricsInterval = useRef<NodeJS.Timeout | null>(null);
  const fpsInterval = useRef<NodeJS.Timeout | null>(null);

  // Start performance monitoring
  const startMonitoring = useCallback(() => {
    if (isMonitoring) return;
    
    setIsMonitoring(true);
    
    // Calculate FPS
    const calculateFPS = () => {
      frameCount.current++;
      const now = Date.now();
      const delta = now - lastFrameTime.current;
      
      if (delta >= 1000) {
        const fps = Math.round((frameCount.current * 1000) / delta);
        
        setMetrics(prev => ({
          ...prev,
          fps,
        }));
        
        frameCount.current = 0;
        lastFrameTime.current = now;
        
        // Check for low FPS
        if (fps < 30) {
          addAlert('slow_render', `Low FPS detected: ${fps}`, getSeverity(fps, 30, 15));
        }
      }
      
      requestAnimationFrame(calculateFPS);
    };
    
    requestAnimationFrame(calculateFPS);
    
    // Update metrics periodically
    metricsInterval.current = setInterval(() => {
      updateMetrics();
    }, 1000);
  }, [isMonitoring]);

  // Stop performance monitoring
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
    
    if (metricsInterval.current) {
      clearInterval(metricsInterval.current);
      metricsInterval.current = null;
    }
  }, []);

  // Update performance metrics
  const updateMetrics = useCallback(async () => {
    try {
      const newMetrics: Partial<PerformanceMetrics> = {};
      
      // Memory usage (platform-specific)
      if (Platform.OS === 'web') {
        if ('memory' in performance) {
          const memory = (performance as any).memory;
          newMetrics.memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
        }
      } else {
        // For native platforms, we'd need to use native modules
        // For now, simulate memory usage
        newMetrics.memoryUsage = Math.random() * 100 + 50;
      }
      
      // CPU usage (simulated for demo)
      newMetrics.cpuUsage = Math.random() * 100;
      
      // Network latency (measure with a ping)
      const start = Date.now();
      try {
        await fetch('https://httpbin.org/delay/0', { method: 'HEAD' });
        newMetrics.networkLatency = Date.now() - start;
      } catch (error) {
        newMetrics.networkLatency = -1; // Error
      }
      
      setMetrics(prev => ({
        ...prev,
        ...newMetrics,
      }));
      
      // Check for performance issues
      checkPerformanceThresholds(newMetrics);
      
    } catch (error) {
      console.error('Error updating performance metrics:', error);
    }
  }, []);

  // Check performance thresholds and create alerts
  const checkPerformanceThresholds = useCallback((newMetrics: Partial<PerformanceMetrics>) => {
    // Memory usage check
    if (newMetrics.memoryUsage && newMetrics.memoryUsage > 200) {
      addAlert(
        'high_memory', 
        `High memory usage: ${newMetrics.memoryUsage.toFixed(2)} MB`,
        getSeverity(newMetrics.memoryUsage, 200, 400)
      );
    }
    
    // CPU usage check
    if (newMetrics.cpuUsage && newMetrics.cpuUsage > 80) {
      addAlert(
        'high_cpu',
        `High CPU usage: ${newMetrics.cpuUsage.toFixed(1)}%`,
        getSeverity(newMetrics.cpuUsage, 80, 95)
      );
    }
    
    // Network latency check
    if (newMetrics.networkLatency && newMetrics.networkLatency > 1000) {
      addAlert(
        'network_slow',
        `High network latency: ${newMetrics.networkLatency}ms`,
        getSeverity(newMetrics.networkLatency, 1000, 3000)
      );
    }
  }, []);

  // Add performance alert
  const addAlert = useCallback((type: PerformanceAlert['type'], message: string, severity: PerformanceAlert['severity']) => {
    const alert: PerformanceAlert = {
      type,
      message,
      timestamp: new Date(),
      severity,
    };
    
    setAlerts(prev => {
      // Remove duplicate alerts of the same type
      const filtered = prev.filter(a => a.type !== type);
      return [...filtered, alert].slice(-10); // Keep only last 10 alerts
    });
  }, []);

  // Get severity based on value
  const getSeverity = useCallback((value: number, threshold: number, critical: number): PerformanceAlert['severity'] => {
    if (value >= critical) return 'critical';
    if (value >= threshold) return 'high';
    if (value >= threshold * 0.7) return 'medium';
    return 'low';
  }, []);

  // Measure render time
  const measureRenderTime = useCallback(() => {
    const renderTime = Date.now() - renderStartTime.current;
    renderStartTime.current = Date.now();
    
    setMetrics(prev => ({
      ...prev,
      renderTime,
    }));
    
    if (renderTime > 100) {
      addAlert('slow_render', `Slow render time: ${renderTime}ms`, getSeverity(renderTime, 100, 200));
    }
    
    return renderTime;
  }, [addAlert, getSeverity]);

  // Measure message latency
  const measureMessageLatency = useCallback(async (messageFunction: () => Promise<any>) => {
    const start = Date.now();
    try {
      await messageFunction();
      const latency = Date.now() - start;
      
      setMetrics(prev => ({
        ...prev,
        messageLatency: latency,
      }));
      
      if (latency > 5000) {
        addAlert('network_slow', `Slow message response: ${latency}ms`, getSeverity(latency, 5000, 10000));
      }
      
      return latency;
    } catch (error) {
      const latency = Date.now() - start;
      addAlert('network_slow', `Message failed after ${latency}ms`, 'high');
      throw error;
    }
  }, [addAlert, getSeverity]);

  // Clear alerts
  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // Clear alert by type
  const clearAlertByType = useCallback((type: PerformanceAlert['type']) => {
    setAlerts(prev => prev.filter(alert => alert.type !== type));
  }, []);

  // Get performance score
  const getPerformanceScore = useCallback(() => {
    const weights = {
      fps: 0.3,
      memoryUsage: 0.2,
      cpuUsage: 0.2,
      networkLatency: 0.15,
      renderTime: 0.15,
    };
    
    let score = 100;
    
    // FPS score (60 = 100, 30 = 50, 0 = 0)
    score -= (60 - Math.max(0, metrics.fps)) * weights.fps * 1.67;
    
    // Memory score (100MB = 100, 200MB = 50, 400MB = 0)
    score -= Math.max(0, metrics.memoryUsage - 100) * weights.memoryUsage * 0.5;
    
    // CPU score (0% = 100, 50% = 50, 100% = 0)
    score -= metrics.cpuUsage * weights.cpuUsage;
    
    // Network score (0ms = 100, 1000ms = 50, 3000ms = 0)
    if (metrics.networkLatency > 0) {
      score -= Math.min(metrics.networkLatency, 3000) * weights.networkLatency * 0.033;
    }
    
    // Render time score (0ms = 100, 100ms = 50, 200ms = 0)
    score -= Math.min(metrics.renderTime, 200) * weights.renderTime * 0.5;
    
    return Math.max(0, Math.round(score));
  }, [metrics]);

  // Get performance grade
  const getPerformanceGrade = useCallback(() => {
    const score = getPerformanceScore();
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }, [getPerformanceScore]);

  // Auto-start monitoring on mount
  useEffect(() => {
    startMonitoring();
    
    return () => {
      stopMonitoring();
    };
  }, [startMonitoring, stopMonitoring]);

  return {
    metrics,
    alerts,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    measureRenderTime,
    measureMessageLatency,
    clearAlerts,
    clearAlertByType,
    getPerformanceScore,
    getPerformanceGrade,
  };
}

// Performance monitoring context for global access
import { createContext, useContext } from 'react';

const PerformanceContext = createContext<ReturnType<typeof usePerformanceMonitor> | null>(null);

export const PerformanceProvider = ({ children }: { children: React.ReactNode }) => {
  const performance = usePerformanceMonitor();
  
  return (
    <PerformanceContext.Provider value={performance}>
      {children}
    </PerformanceContext.Provider>
  );
};

export const usePerformance = () => {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
};
