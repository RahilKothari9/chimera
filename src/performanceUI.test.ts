import { describe, it, expect, beforeEach } from 'vitest'
import {
  formatBytes,
  formatTime,
  getTrendIndicator,
  getTrendClass,
  createMetricCard,
  createPerformanceChart,
  createInsightsList,
  setupPerformanceUI,
} from './performanceUI'
import type { PerformanceMetric } from './performanceMetrics'

describe('Performance UI', () => {
  describe('formatBytes', () => {
    it('should format bytes', () => {
      expect(formatBytes(500)).toBe('500 B')
    })

    it('should format kilobytes', () => {
      expect(formatBytes(1024)).toBe('1.0 KB')
      expect(formatBytes(5120)).toBe('5.0 KB')
      expect(formatBytes(1536)).toBe('1.5 KB')
    })

    it('should format megabytes', () => {
      expect(formatBytes(1024 * 1024)).toBe('1.00 MB')
      expect(formatBytes(5 * 1024 * 1024)).toBe('5.00 MB')
      expect(formatBytes(1.5 * 1024 * 1024)).toBe('1.50 MB')
    })
  })

  describe('formatTime', () => {
    it('should format milliseconds', () => {
      expect(formatTime(100)).toBe('100 ms')
      expect(formatTime(500)).toBe('500 ms')
    })

    it('should format seconds', () => {
      expect(formatTime(1000)).toBe('1.00 s')
      expect(formatTime(2500)).toBe('2.50 s')
      expect(formatTime(3456)).toBe('3.46 s')
    })
  })

  describe('getTrendIndicator', () => {
    it('should return correct emoji for improving', () => {
      expect(getTrendIndicator('improving')).toBe('📉')
    })

    it('should return correct emoji for degrading', () => {
      expect(getTrendIndicator('degrading')).toBe('📈')
    })

    it('should return correct emoji for stable', () => {
      expect(getTrendIndicator('stable')).toBe('➡️')
    })
  })

  describe('getTrendClass', () => {
    it('should return correct class for improving', () => {
      expect(getTrendClass('improving')).toBe('trend-good')
    })

    it('should return correct class for degrading', () => {
      expect(getTrendClass('degrading')).toBe('trend-bad')
    })

    it('should return correct class for stable', () => {
      expect(getTrendClass('stable')).toBe('trend-stable')
    })
  })

  describe('createMetricCard', () => {
    it('should create basic metric card', () => {
      const card = createMetricCard('Test Metric', '100 KB')

      expect(card.className).toBe('perf-metric-card')
      expect(card.querySelector('.metric-label')?.textContent).toBe('Test Metric')
      expect(card.querySelector('.metric-value')?.textContent).toContain('100 KB')
    })

    it('should include trend indicator', () => {
      const card = createMetricCard('Test Metric', '100 KB', 'improving')

      expect(card.classList.contains('trend-good')).toBe(true)
      expect(card.querySelector('.metric-trend')?.textContent).toContain('📉')
    })

    it('should include subtitle when provided', () => {
      const card = createMetricCard('Test Metric', '100 KB', undefined, 'Avg: 95 KB')

      expect(card.querySelector('.metric-subtitle')?.textContent).toBe('Avg: 95 KB')
    })

    it('should handle all trend types', () => {
      const improving = createMetricCard('M1', '100', 'improving')
      const degrading = createMetricCard('M2', '100', 'degrading')
      const stable = createMetricCard('M3', '100', 'stable')

      expect(improving.classList.contains('trend-good')).toBe(true)
      expect(degrading.classList.contains('trend-bad')).toBe(true)
      expect(stable.classList.contains('trend-stable')).toBe(true)
    })
  })

  describe('createPerformanceChart', () => {
    const mockMetrics: PerformanceMetric[] = [
      {
        timestamp: Date.now() - 2 * 86400000,
        bundleSize: 100 * 1024,
        loadTime: 800,
        renderTime: 200,
        resourceCount: 20,
      },
      {
        timestamp: Date.now() - 86400000,
        bundleSize: 110 * 1024,
        loadTime: 850,
        renderTime: 220,
        resourceCount: 22,
      },
      {
        timestamp: Date.now(),
        bundleSize: 120 * 1024,
        loadTime: 900,
        renderTime: 250,
        resourceCount: 25,
      },
    ]

    it('should create chart container', () => {
      const chart = createPerformanceChart(
        mockMetrics,
        'bundleSize',
        'Test Chart',
        formatBytes
      )

      expect(chart.className).toBe('perf-chart-container')
      expect(chart.querySelector('.perf-chart-title')?.textContent).toBe('Test Chart')
    })

    it('should create SVG chart', () => {
      const chart = createPerformanceChart(
        mockMetrics,
        'bundleSize',
        'Test Chart',
        formatBytes
      )

      const svg = chart.querySelector('svg')
      expect(svg).toBeTruthy()
      expect(svg?.getAttribute('class')).toBe('perf-chart')
    })

    it('should draw line path', () => {
      const chart = createPerformanceChart(
        mockMetrics,
        'loadTime',
        'Load Time',
        formatTime
      )

      const path = chart.querySelector('path.perf-chart-line')
      expect(path).toBeTruthy()
      expect(path?.getAttribute('d')).toContain('M')
      expect(path?.getAttribute('d')).toContain('L')
    })

    it('should draw points for each metric', () => {
      const chart = createPerformanceChart(
        mockMetrics,
        'renderTime',
        'Render Time',
        formatTime
      )

      const circles = chart.querySelectorAll('circle.perf-chart-point')
      expect(circles.length).toBe(mockMetrics.length)
    })

    it('should add tooltips to points', () => {
      const chart = createPerformanceChart(
        mockMetrics,
        'loadTime',
        'Load Time',
        formatTime
      )

      const circles = chart.querySelectorAll('circle.perf-chart-point')
      circles.forEach((circle) => {
        const title = circle.querySelector('title')
        expect(title).toBeTruthy()
        expect(title?.textContent).toBeTruthy()
      })
    })

    it('should add axis labels', () => {
      const chart = createPerformanceChart(
        mockMetrics,
        'bundleSize',
        'Bundle Size',
        formatBytes
      )

      const labels = chart.querySelectorAll('text.perf-chart-label')
      expect(labels.length).toBeGreaterThan(0)
    })

    it('should handle empty metrics', () => {
      const chart = createPerformanceChart([], 'bundleSize', 'Empty Chart', formatBytes)

      expect(chart.querySelector('.perf-chart-nodata')).toBeTruthy()
      expect(chart.querySelector('.perf-chart-nodata')?.textContent).toContain('No historical data')
    })

    it('should handle missing metric values', () => {
      const metricsWithMissing: PerformanceMetric[] = [
        {
          timestamp: Date.now(),
          bundleSize: 100 * 1024,
          loadTime: 800,
          renderTime: 200,
          memoryUsage: undefined,
          resourceCount: 20,
        },
      ]

      const chart = createPerformanceChart(
        metricsWithMissing,
        'memoryUsage',
        'Memory',
        (v) => `${v} MB`
      )

      expect(chart.querySelector('.perf-chart-nodata')).toBeTruthy()
    })
  })

  describe('createInsightsList', () => {
    it('should create insights container', () => {
      const insights = ['Insight 1', 'Insight 2', 'Insight 3']
      const list = createInsightsList(insights)

      expect(list.className).toBe('perf-insights')
      expect(list.querySelector('.perf-insights-title')?.textContent).toBe(
        'Performance Insights'
      )
    })

    it('should list all insights', () => {
      const insights = ['Good performance', 'Bundle size optimal', 'Fast loading']
      const list = createInsightsList(insights)

      const items = list.querySelectorAll('.perf-insight-item')
      expect(items.length).toBe(3)
      expect(items[0].textContent).toBe('Good performance')
      expect(items[1].textContent).toBe('Bundle size optimal')
      expect(items[2].textContent).toBe('Fast loading')
    })

    it('should handle empty insights', () => {
      const list = createInsightsList([])

      const items = list.querySelectorAll('.perf-insight-item')
      expect(items.length).toBe(0)
    })
  })

  describe('setupPerformanceUI', () => {
    let container: HTMLElement

    beforeEach(() => {
      container = document.createElement('div')
      document.body.appendChild(container)
    })

    it('should create performance dashboard', () => {
      setupPerformanceUI(container, 10)

      expect(container.querySelector('.perf-header')).toBeTruthy()
      expect(container.querySelector('.section-title')?.textContent).toBe(
        'Performance Monitoring'
      )
    })

    it('should create metrics grid', () => {
      setupPerformanceUI(container, 5)

      const metricsGrid = container.querySelector('.perf-metrics-grid')
      expect(metricsGrid).toBeTruthy()

      const cards = metricsGrid?.querySelectorAll('.perf-metric-card')
      expect(cards && cards.length).toBeGreaterThan(0)
    })

    it('should include bundle size metric', () => {
      setupPerformanceUI(container, 8)

      const cards = container.querySelectorAll('.perf-metric-card')
      const labels = Array.from(cards).map(
        (card) => card.querySelector('.metric-label')?.textContent
      )

      expect(labels).toContain('Bundle Size')
    })

    it('should include load time metric', () => {
      setupPerformanceUI(container, 8)

      const cards = container.querySelectorAll('.perf-metric-card')
      const labels = Array.from(cards).map(
        (card) => card.querySelector('.metric-label')?.textContent
      )

      expect(labels).toContain('Page Load')
    })

    it('should include render time metric', () => {
      setupPerformanceUI(container, 8)

      const cards = container.querySelectorAll('.perf-metric-card')
      const labels = Array.from(cards).map(
        (card) => card.querySelector('.metric-label')?.textContent
      )

      expect(labels).toContain('Render Time')
    })

    it('should create charts section', () => {
      setupPerformanceUI(container, 10)

      const chartsSection = container.querySelector('.perf-charts-section')
      expect(chartsSection).toBeTruthy()

      const charts = chartsSection?.querySelectorAll('.perf-chart-container')
      expect(charts && charts.length).toBeGreaterThanOrEqual(2)
    })

    it('should create insights section', () => {
      setupPerformanceUI(container, 10)

      const insights = container.querySelector('.perf-insights')
      expect(insights).toBeTruthy()

      const items = insights?.querySelectorAll('.perf-insight-item')
      expect(items && items.length).toBeGreaterThan(0)
    })

    it('should add footer with timestamp', () => {
      setupPerformanceUI(container, 10)

      const footer = container.querySelector('.perf-footer')
      expect(footer).toBeTruthy()
      expect(footer?.textContent).toContain('Last updated')
    })

    it('should handle different evolution counts', () => {
      setupPerformanceUI(container, 1)
      expect(container.querySelector('.perf-header')).toBeTruthy()

      container.innerHTML = ''
      setupPerformanceUI(container, 20)
      expect(container.querySelector('.perf-header')).toBeTruthy()
    })
  })
})
