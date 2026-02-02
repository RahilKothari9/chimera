import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  estimateBundleSize,
  measureLoadTime,
  measureRenderTime,
  getMemoryUsage,
  countResources,
  collectMetrics,
  analyzeTrend,
  generateInsights,
  calculatePerformanceStats,
  generateHistoricalMetrics,
  type PerformanceMetric,
} from './performanceMetrics'

describe('Performance Metrics', () => {
  describe('estimateBundleSize', () => {
    it('should return base size for 0 evolutions', () => {
      const size = estimateBundleSize(0)
      expect(size).toBe(50 * 1024) // 50 KB
    })

    it('should increase size with evolutions', () => {
      const size1 = estimateBundleSize(1)
      const size10 = estimateBundleSize(10)

      expect(size10).toBeGreaterThan(size1)
      expect(size10 - size1).toBe(9 * 5 * 1024) // 9 evolutions * 5 KB each
    })

    it('should calculate correctly for 16 evolutions', () => {
      const size = estimateBundleSize(16)
      // Base 50 KB + 16 * 5 KB = 50 + 80 = 130 KB
      expect(size).toBe(130 * 1024)
    })
  })

  describe('measureLoadTime', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('should return 0 if Performance API not available', () => {
      const originalTiming = performance.timing
      // @ts-expect-error - Testing undefined case
      performance.timing = undefined

      const loadTime = measureLoadTime()
      expect(loadTime).toBe(0)

      // @ts-expect-error - Restore
      performance.timing = originalTiming
    })

    it('should measure load time when available', () => {
      const mockTiming = {
        navigationStart: 1000,
        loadEventEnd: 2500,
        domContentLoadedEventEnd: 2000,
      }

      const originalTiming = performance.timing
      // @ts-expect-error - Mock timing
      performance.timing = mockTiming

      const loadTime = measureLoadTime()
      expect(loadTime).toBe(1500)

      // @ts-expect-error - Restore
      performance.timing = originalTiming
    })

    it('should return 0 for negative load times', () => {
      const mockTiming = {
        navigationStart: 2000,
        loadEventEnd: 1000,
        domContentLoadedEventEnd: 1500,
      }

      const originalTiming = performance.timing
      // @ts-expect-error - Mock timing
      performance.timing = mockTiming

      const loadTime = measureLoadTime()
      expect(loadTime).toBe(0)

      // @ts-expect-error - Restore
      performance.timing = originalTiming
    })
  })

  describe('measureRenderTime', () => {
    it('should return 0 if Performance API not available', () => {
      const originalTiming = performance.timing
      // @ts-expect-error - Testing undefined case
      performance.timing = undefined

      const renderTime = measureRenderTime()
      expect(renderTime).toBe(0)

      // @ts-expect-error - Restore
      performance.timing = originalTiming
    })

    it('should measure render time when available', () => {
      const mockTiming = {
        navigationStart: 1000,
        loadEventEnd: 2500,
        domContentLoadedEventEnd: 2000,
      }

      const originalTiming = performance.timing
      // @ts-expect-error - Mock timing
      performance.timing = mockTiming

      const renderTime = measureRenderTime()
      expect(renderTime).toBe(500)

      // @ts-expect-error - Restore
      performance.timing = originalTiming
    })
  })

  describe('getMemoryUsage', () => {
    it('should return undefined if memory API not available', () => {
      const memoryUsage = getMemoryUsage()
      // In test environment, memory might not be available
      expect(memoryUsage === undefined || typeof memoryUsage === 'number').toBe(
        true
      )
    })

    it('should convert bytes to MB when available', () => {
      const originalMemory = (performance as any).memory
      ;(performance as any).memory = {
        usedJSHeapSize: 20 * 1024 * 1024, // 20 MB
      }

      const memoryUsage = getMemoryUsage()
      expect(memoryUsage).toBe(20)

      // Restore
      if (originalMemory === undefined) {
        delete (performance as any).memory
      } else {
        ;(performance as any).memory = originalMemory
      }
    })
  })

  describe('countResources', () => {
    it('should return 0 if API not available', () => {
      const originalGetEntriesByType = performance.getEntriesByType
      // @ts-expect-error - Testing undefined case
      performance.getEntriesByType = undefined

      const count = countResources()
      expect(count).toBe(0)

      performance.getEntriesByType = originalGetEntriesByType
    })

    it('should count resources when available', () => {
      const count = countResources()
      // Should return a number (count of actual resources in test env)
      expect(typeof count).toBe('number')
      expect(count).toBeGreaterThanOrEqual(0)
    })
  })

  describe('collectMetrics', () => {
    it('should collect all metrics', () => {
      const metrics = collectMetrics(10)

      expect(metrics).toHaveProperty('timestamp')
      expect(metrics).toHaveProperty('bundleSize')
      expect(metrics).toHaveProperty('loadTime')
      expect(metrics).toHaveProperty('renderTime')
      expect(metrics).toHaveProperty('resourceCount')
      expect(typeof metrics.timestamp).toBe('number')
      expect(typeof metrics.bundleSize).toBe('number')
      expect(metrics.bundleSize).toBeGreaterThan(0)
    })

    it('should include memory usage if available', () => {
      const metrics = collectMetrics(5)

      // memoryUsage can be undefined in test environment
      expect(
        metrics.memoryUsage === undefined || typeof metrics.memoryUsage === 'number'
      ).toBe(true)
    })
  })

  describe('analyzeTrend', () => {
    it('should return stable for empty history', () => {
      const trend = analyzeTrend(100, [])
      expect(trend).toBe('stable')
    })

    it('should detect improving trend', () => {
      const historical = [100, 95, 90]
      const current = 80

      const trend = analyzeTrend(current, historical)
      expect(trend).toBe('improving')
    })

    it('should detect degrading trend', () => {
      const historical = [80, 85, 90]
      const current = 110

      const trend = analyzeTrend(current, historical)
      expect(trend).toBe('degrading')
    })

    it('should detect stable trend', () => {
      const historical = [100, 102, 98]
      const current = 101

      const trend = analyzeTrend(current, historical)
      expect(trend).toBe('stable')
    })

    it('should use 10% threshold for changes', () => {
      const historical = [100]
      // 9% change should be stable
      const trend1 = analyzeTrend(109, historical)
      expect(trend1).toBe('stable')

      // 11% change should be degrading
      const trend2 = analyzeTrend(111, historical)
      expect(trend2).toBe('degrading')

      // -11% change should be improving
      const trend3 = analyzeTrend(89, historical)
      expect(trend3).toBe('improving')
    })
  })

  describe('generateInsights', () => {
    it('should generate bundle size insights', () => {
      const stats = {
        current: {
          timestamp: Date.now(),
          bundleSize: 50 * 1024,
          loadTime: 500,
          renderTime: 200,
          resourceCount: 15,
        },
        average: {
          bundleSize: 50 * 1024,
          loadTime: 500,
          renderTime: 200,
          memoryUsage: 10,
          resourceCount: 15,
        },
        trend: {
          bundleSize: 'stable' as const,
          loadTime: 'stable' as const,
          renderTime: 'stable' as const,
        },
        insights: [],
      }

      const insights = generateInsights(stats)
      expect(insights.length).toBeGreaterThan(0)
      expect(insights.some((i) => i.includes('bundle'))).toBe(true)
    })

    it('should warn about large bundle', () => {
      const stats = {
        current: {
          timestamp: Date.now(),
          bundleSize: 300 * 1024, // Large
          loadTime: 500,
          renderTime: 200,
          resourceCount: 15,
        },
        average: {
          bundleSize: 300 * 1024,
          loadTime: 500,
          renderTime: 200,
          memoryUsage: 10,
          resourceCount: 15,
        },
        trend: {
          bundleSize: 'stable' as const,
          loadTime: 'stable' as const,
          renderTime: 'stable' as const,
        },
        insights: [],
      }

      const insights = generateInsights(stats)
      expect(insights.some((i) => i.includes('⚠️') && i.includes('bundle'))).toBe(
        true
      )
    })

    it('should warn about slow load time', () => {
      const stats = {
        current: {
          timestamp: Date.now(),
          bundleSize: 50 * 1024,
          loadTime: 4000, // Slow
          renderTime: 200,
          resourceCount: 15,
        },
        average: {
          bundleSize: 50 * 1024,
          loadTime: 4000,
          renderTime: 200,
          memoryUsage: 10,
          resourceCount: 15,
        },
        trend: {
          bundleSize: 'stable' as const,
          loadTime: 'stable' as const,
          renderTime: 'stable' as const,
        },
        insights: [],
      }

      const insights = generateInsights(stats)
      expect(insights.some((i) => i.includes('⚠️') && i.includes('load'))).toBe(true)
    })

    it('should include trend insights', () => {
      const stats = {
        current: {
          timestamp: Date.now(),
          bundleSize: 100 * 1024,
          loadTime: 500,
          renderTime: 200,
          resourceCount: 15,
        },
        average: {
          bundleSize: 100 * 1024,
          loadTime: 500,
          renderTime: 200,
          memoryUsage: 10,
          resourceCount: 15,
        },
        trend: {
          bundleSize: 'degrading' as const,
          loadTime: 'improving' as const,
          renderTime: 'stable' as const,
        },
        insights: [],
      }

      const insights = generateInsights(stats)
      expect(insights.some((i) => i.includes('Bundle size growing'))).toBe(true)
      expect(insights.some((i) => i.includes('Load time improving'))).toBe(true)
    })

    it('should include memory insights when available', () => {
      const stats = {
        current: {
          timestamp: Date.now(),
          bundleSize: 50 * 1024,
          loadTime: 500,
          renderTime: 200,
          memoryUsage: 60, // High
          resourceCount: 15,
        },
        average: {
          bundleSize: 50 * 1024,
          loadTime: 500,
          renderTime: 200,
          memoryUsage: 60,
          resourceCount: 15,
        },
        trend: {
          bundleSize: 'stable' as const,
          loadTime: 'stable' as const,
          renderTime: 'stable' as const,
        },
        insights: [],
      }

      const insights = generateInsights(stats)
      expect(insights.some((i) => i.includes('memory'))).toBe(true)
    })
  })

  describe('calculatePerformanceStats', () => {
    it('should calculate statistics from metrics', () => {
      const current: PerformanceMetric = {
        timestamp: Date.now(),
        bundleSize: 100 * 1024,
        loadTime: 1000,
        renderTime: 300,
        memoryUsage: 20,
        resourceCount: 25,
      }

      const historical: PerformanceMetric[] = [
        {
          timestamp: Date.now() - 86400000,
          bundleSize: 90 * 1024,
          loadTime: 900,
          renderTime: 280,
          memoryUsage: 18,
          resourceCount: 22,
        },
      ]

      const stats = calculatePerformanceStats(current, historical)

      expect(stats.current).toEqual(current)
      expect(stats.average.bundleSize).toBe((100 * 1024 + 90 * 1024) / 2)
      expect(stats.average.loadTime).toBe(950)
      expect(stats.trend).toHaveProperty('bundleSize')
      expect(stats.trend).toHaveProperty('loadTime')
      expect(stats.trend).toHaveProperty('renderTime')
      expect(stats.insights.length).toBeGreaterThan(0)
    })

    it('should work with empty historical data', () => {
      const current: PerformanceMetric = {
        timestamp: Date.now(),
        bundleSize: 100 * 1024,
        loadTime: 1000,
        renderTime: 300,
        memoryUsage: 20,
        resourceCount: 25,
      }

      const stats = calculatePerformanceStats(current, [])

      expect(stats.current).toEqual(current)
      expect(stats.average.bundleSize).toBe(current.bundleSize)
      expect(stats.trend.bundleSize).toBe('stable')
    })
  })

  describe('generateHistoricalMetrics', () => {
    it('should generate metrics for evolution history', () => {
      const metrics = generateHistoricalMetrics(10)

      expect(metrics.length).toBeGreaterThan(0)
      expect(metrics.length).toBeLessThanOrEqual(7)
      metrics.forEach((m) => {
        expect(m).toHaveProperty('timestamp')
        expect(m).toHaveProperty('bundleSize')
        expect(m).toHaveProperty('loadTime')
        expect(m).toHaveProperty('renderTime')
        expect(m.bundleSize).toBeGreaterThan(0)
        expect(m.loadTime).toBeGreaterThan(0)
      })
    })

    it('should limit to 7 days max', () => {
      const metrics = generateHistoricalMetrics(20)
      expect(metrics.length).toBe(7)
    })

    it('should limit to actual evolution count if less than 7', () => {
      const metrics = generateHistoricalMetrics(3)
      expect(metrics.length).toBe(3)
    })

    it('should show increasing bundle size over time', () => {
      const metrics = generateHistoricalMetrics(7)

      // First metric should be smaller than last (oldest vs newest)
      expect(metrics[0].bundleSize).toBeLessThan(
        metrics[metrics.length - 1].bundleSize
      )
    })

    it('should have realistic variations in load times', () => {
      const metrics = generateHistoricalMetrics(5)

      // Check that load times vary but are reasonable
      metrics.forEach((m) => {
        expect(m.loadTime).toBeGreaterThan(0)
        expect(m.loadTime).toBeLessThan(5000) // Less than 5 seconds
      })
    })
  })
})
