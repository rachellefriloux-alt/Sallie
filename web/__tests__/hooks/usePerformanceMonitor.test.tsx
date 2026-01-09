import { renderHook, act } from '@testing-library/react'
import { usePerformanceMonitor } from '../../hooks/usePerformanceMonitor'

// Mock performance API
const mockPerformance = {
  now: jest.fn(() => Date.now()),
  getEntriesByType: jest.fn(),
  getEntriesByName: jest.fn(),
  mark: jest.fn(),
  measure: jest.fn(),
  clearMarks: jest.fn(),
  clearMeasures: jest.fn(),
}

Object.defineProperty(window, 'performance', {
  value: mockPerformance,
  writable: true,
})

// Mock Navigation Timing API
const mockNavigationTiming = {
  domContentLoadedEventEnd: 1000,
  loadEventEnd: 2000,
  fetchStart: 100,
  responseStart: 300,
  responseEnd: 500,
}

mockPerformance.getEntriesByType.mockReturnValue([mockNavigationTiming])

// Mock Memory API
const mockMemory = {
  usedJSHeapSize: 1000000,
  totalJSHeapSize: 2000000,
  jsHeapSizeLimit: 4000000,
}

Object.defineProperty(window, 'performance', {
  value: { ...mockPerformance, memory: mockMemory },
  writable: true,
})

// Mock IntersectionObserver for FPS monitoring
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

describe('usePerformanceMonitor', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('Core Web Vitals', () => {
    it('should measure LCP (Largest Contentful Paint)', () => {
      const { result } = renderHook(() => usePerformanceMonitor())

      const mockLCPEntry = {
        startTime: 1500,
        renderTime: 1800,
        loadTime: 2000,
        size: 50000,
        element: 'img',
        url: 'https://example.com/image.jpg',
      }

      mockPerformance.getEntriesByName.mockReturnValue([mockLCPEntry])

      act(() => {
        const lcp = result.current.measureLCP()
        expect(lcp).toBeGreaterThan(0)
      })
    })

    it('should measure FID (First Input Delay)', () => {
      const { result } = renderHook(() => usePerformanceMonitor())

      const mockFIDEntry = {
        startTime: 1000,
        processingStart: 1050,
        processingEnd: 1070,
        duration: 70,
        name: 'click',
        entryType: 'first-input',
      }

      mockPerformance.getEntriesByType.mockReturnValue([mockFIDEntry])

      act(() => {
        const fid = result.current.measureFID()
        expect(fid).toBe(50) // processingStart - startTime
      })
    })

    it('should measure CLS (Cumulative Layout Shift)', () => {
      const { result } = renderHook(() => usePerformanceMonitor())

      const mockCLSEntries = [
        { value: 0.1, startTime: 1000 },
        { value: 0.05, startTime: 1500 },
        { value: 0.02, startTime: 2000 },
      ]

      mockPerformance.getEntriesByType.mockReturnValue(mockCLSEntries)

      act(() => {
        const cls = result.current.measureCLS()
        expect(cls).toBe(0.17) // Sum of all layout shift values
      })
    })

    it('should measure TTFB (Time to First Byte)', () => {
      const { result } = renderHook(() => usePerformanceMonitor())

      act(() => {
        const ttfb = result.current.measureTTFB()
        expect(ttfb).toBe(200) // responseStart - fetchStart
      })
    })
  })

  describe('Memory Monitoring', () => {
    it('should get memory usage', () => {
      const { result } = renderHook(() => usePerformanceMonitor())

      act(() => {
        const memory = result.current.getMemoryUsage()
        expect(memory).toMatchObject({
          used: 1000000,
          total: 2000000,
          limit: 4000000,
          percentage: 50, // (used / total) * 100
        })
      })
    })

    it('should detect memory leaks', () => {
      const { result } = renderHook(() => usePerformanceMonitor())

      // Simulate increasing memory usage
      mockMemory.usedJSHeapSize = 1500000

      act(() => {
        const leak = result.current.detectMemoryLeak()
        expect(leak).toBe(true)
      })
    })

    it('should track memory over time', () => {
      const { result } = renderHook(() => usePerformanceMonitor())

      act(() => {
        result.current.startMemoryTracking()
      })

      // Simulate memory changes
      mockMemory.usedJSHeapSize = 1200000
      act(() => {
        jest.advanceTimersByTime(1000)
      })

      mockMemory.usedJSHeapSize = 1400000
      act(() => {
        jest.advanceTimersByTime(1000)
      })

      act(() => {
        result.current.stopMemoryTracking()
      })

      const history = result.current.getMemoryHistory()
      expect(history.length).toBeGreaterThan(0)
      expect(history[0]).toHaveProperty('timestamp')
      expect(history[0]).toHaveProperty('usage')
    })
  })

  describe('Network Performance', () => {
    it('should measure network latency', async () => {
      const { result } = renderHook(() => usePerformanceMonitor())

      // Mock fetch for latency test
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ timestamp: Date.now() }),
      })

      await act(async () => {
        const latency = await result.current.measureNetworkLatency()
        expect(typeof latency).toBe('number')
        expect(latency).toBeGreaterThanOrEqual(0)
      })
    })

    it('should track API response times', () => {
      const { result } = renderHook(() => usePerformanceMonitor())

      act(() => {
        result.current.startAPITiming('test-api')
      })

      act(() => {
        jest.advanceTimersByTime(150)
      })

      act(() => {
        const duration = result.current.endAPITiming('test-api')
        expect(duration).toBe(150)
      })

      const metrics = result.current.getAPIMetrics()
      expect(metrics['test-api']).toBeDefined()
      expect(metrics['test-api'].count).toBe(1)
      expect(metrics['test-api'].average).toBe(150)
    })

    it('should detect slow API calls', () => {
      const { result } = renderHook(() => usePerformanceMonitor())

      act(() => {
        result.current.startAPITiming('slow-api')
      })

      act(() => {
        jest.advanceTimersByTime(2000) // 2 seconds
      })

      act(() => {
        result.current.endAPITiming('slow-api')
      })

      const slowCalls = result.current.getSlowAPICalls(1000) // threshold 1 second
      expect(slowCalls).toContain('slow-api')
    })
  })

  describe('FPS Monitoring', () => {
    it('should measure FPS', () => {
      const { result } = renderHook(() => usePerformanceMonitor())

      act(() => {
        result.current.startFPSMonitoring()
      })

      // Simulate frame updates
      for (let i = 0; i < 60; i++) {
        act(() => {
          jest.advanceTimersByTime(16) // ~60 FPS
        })
      }

      act(() => {
        result.current.stopFPSMonitoring()
      })

      const fps = result.current.getCurrentFPS()
      expect(fps).toBeGreaterThan(0)
      expect(fps).toBeLessThanOrEqual(120)
    })

    it('should detect FPS drops', () => {
      const { result } = renderHook(() => usePerformanceMonitor())

      act(() => {
        result.current.startFPSMonitoring()
      })

      // Simulate frame drops
      for (let i = 0; i < 30; i++) {
        act(() => {
          jest.advanceTimersByTime(33) // ~30 FPS
        })
      }

      act(() => {
        result.current.stopFPSMonitoring()
      })

      const drops = result.current.getFPSDrops(30) // threshold 30 FPS
      expect(drops.length).toBeGreaterThan(0)
    })
  })

  describe('Performance Scoring', () => {
    it('should calculate performance score', () => {
      const { result } = renderHook(() => usePerformanceMonitor())

      act(() => {
        const score = result.current.calculatePerformanceScore()
        expect(typeof score).toBe('number')
        expect(score).toBeGreaterThanOrEqual(0)
        expect(score).toBeLessThanOrEqual(100)
      })
    })

    it('should provide performance recommendations', () => {
      const { result } = renderHook(() => usePerformanceMonitor())

      // Simulate poor performance metrics
      mockPerformance.getEntriesByType.mockReturnValue([
        { ...mockNavigationTiming, loadEventEnd: 5000 }, // Slow load time
      ])

      act(() => {
        const recommendations = result.current.getRecommendations()
        expect(Array.isArray(recommendations)).toBe(true)
        expect(recommendations.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Performance Alerts', () => {
    it('should trigger alerts for poor performance', () => {
      const { result } = renderHook(() => usePerformanceMonitor())

      const mockAlert = jest.fn()
      result.current.onAlert = mockAlert

      // Simulate high memory usage
      mockMemory.usedJSHeapSize = 3500000 // 87.5% of total

      act(() => {
        result.current.checkPerformanceThresholds()
      })

      expect(mockAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'memory',
          severity: 'warning',
          message: expect.stringContaining('memory'),
        })
      )
    })

    it('should not trigger alerts for good performance', () => {
      const { result } = renderHook(() => usePerformanceMonitor())

      const mockAlert = jest.fn()
      result.current.onAlert = mockAlert

      act(() => {
        result.current.checkPerformanceThresholds()
      })

      expect(mockAlert).not.toHaveBeenCalled()
    })
  })

  describe('Performance History', () => {
    it('should track performance over time', () => {
      const { result } = renderHook(() => usePerformanceMonitor())

      act(() => {
        result.current.startContinuousMonitoring()
      })

      // Simulate time passing
      act(() => {
        jest.advanceTimersByTime(5000)
      })

      act(() => {
        result.current.stopContinuousMonitoring()
      })

      const history = result.current.getPerformanceHistory()
      expect(history.length).toBeGreaterThan(0)
      expect(history[0]).toHaveProperty('timestamp')
      expect(history[0]).toHaveProperty('metrics')
    })

    it('should export performance data', () => {
      const { result } = renderHook(() => usePerformanceMonitor())

      act(() => {
        const data = result.current.exportPerformanceData()
        expect(data).toHaveProperty('history')
        expect(data).toHaveProperty('summary')
        expect(data).toHaveProperty('recommendations')
        expect(data).toHaveProperty('timestamp')
      })
    })
  })

  describe('Custom Metrics', () => {
    it('should track custom metrics', () => {
      const { result } = renderHook(() => usePerformanceMonitor())

      act(() => {
        result.current.trackCustomMetric('user-interaction', 150)
      })

      const metrics = result.current.getCustomMetrics()
      expect(metrics['user-interaction']).toBeDefined()
      expect(metrics['user-interaction'].count).toBe(1)
      expect(metrics['user-interaction'].average).toBe(150)
    })

    it('should aggregate custom metrics', () => {
      const { result } = renderHook(() => usePerformanceMonitor())

      act(() => {
        result.current.trackCustomMetric('render-time', 100)
        result.current.trackCustomMetric('render-time', 150)
        result.current.trackCustomMetric('render-time', 200)
      })

      const metrics = result.current.getCustomMetrics()
      expect(metrics['render-time'].count).toBe(3)
      expect(metrics['render-time'].average).toBe(150) // (100 + 150 + 200) / 3
      expect(metrics['render-time'].min).toBe(100)
      expect(metrics['render-time'].max).toBe(200)
    })
  })
})
