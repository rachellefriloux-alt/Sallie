import { useState, useCallback, useRef } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  messageLatency: number;
  memoryUsage: number;
  cpuUsage: number;
  networkLatency: number;
}

export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    messageLatency: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    networkLatency: 0,
  });

  const startTimeRef = useRef<number>(0);
  const renderCountRef = useRef<number>(0);

  const startMeasure = useCallback(() => {
    startTimeRef.current = performance.now();
    renderCountRef.current += 1;
  }, []);

  const endMeasure = useCallback(() => {
    const endTime = performance.now();
    const renderTime = endTime - startTimeRef.current;
    
    setMetrics(prev => ({
      ...prev,
      renderTime,
      messageLatency: renderTime,
      memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
    }));

    return renderTime;
  }, []);

  const measureNetworkLatency = useCallback(async () => {
    const start = performance.now();
    try {
      await fetch('/api/health');
      const latency = performance.now() - start;
      setMetrics(prev => ({ ...prev, networkLatency: latency }));
      return latency;
    } catch (error) {
      return -1;
    }
  }, []);

  const getMemoryUsage = useCallback(() => {
    if ((performance as any).memory) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
      };
    }
    return null;
  }, []);

  return {
    metrics,
    startMeasure,
    endMeasure,
    measureNetworkLatency,
    getMemoryUsage,
    renderCount: renderCountRef.current,
  };
}
