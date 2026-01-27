import { describe, it, expect } from 'vitest'
import {
  estimateCodeMetrics,
  calculateHistoricalMetrics,
  getMetricsSummary,
  getMetricsInsights,
  type MetricsSummary,
} from './codeMetrics'

describe('Code Metrics Tracker', () => {
  describe('estimateCodeMetrics', () => {
    it('should calculate metrics for initial state (0 evolutions)', () => {
      const metrics = estimateCodeMetrics(0)

      expect(metrics.totalFiles).toBe(8)
      expect(metrics.testFiles).toBe(2)
      expect(metrics.totalLines).toBe(500)
      expect(metrics.testLines).toBe(100)
      expect(metrics.date).toBeDefined()
    })

    it('should calculate metrics for 1 evolution', () => {
      const metrics = estimateCodeMetrics(1)

      expect(metrics.totalFiles).toBeGreaterThan(8)
      expect(metrics.testFiles).toBeGreaterThan(2)
      expect(metrics.totalLines).toBeGreaterThan(500)
      expect(metrics.testLines).toBeGreaterThan(100)
    })

    it('should show growth with more evolutions', () => {
      const metrics5 = estimateCodeMetrics(5)
      const metrics10 = estimateCodeMetrics(10)

      expect(metrics10.totalFiles).toBeGreaterThan(metrics5.totalFiles)
      expect(metrics10.totalLines).toBeGreaterThan(metrics5.totalLines)
      expect(metrics10.testFiles).toBeGreaterThan(metrics5.testFiles)
    })

    it('should calculate average lines per file', () => {
      const metrics = estimateCodeMetrics(5)

      expect(metrics.avgLinesPerFile).toBe(
        Math.round(metrics.totalLines / metrics.totalFiles)
      )
    })

    it('should calculate test coverage percentage', () => {
      const metrics = estimateCodeMetrics(5)

      expect(metrics.testCoverage).toBeGreaterThan(0)
      expect(metrics.testCoverage).toBeLessThanOrEqual(100)
      expect(metrics.testCoverage).toBe(
        Math.round((metrics.testLines / metrics.totalLines) * 100)
      )
    })

    it('should calculate code-to-test ratio', () => {
      const metrics = estimateCodeMetrics(5)

      expect(metrics.codeToTestRatio).toBeGreaterThan(0)
      expect(metrics.codeToTestRatio).toBe(
        parseFloat((metrics.totalLines / metrics.testLines).toFixed(2))
      )
    })

    it('should include current date', () => {
      const metrics = estimateCodeMetrics(5)
      const today = new Date().toISOString().split('T')[0]

      expect(metrics.date).toBe(today)
    })
  })

  describe('calculateHistoricalMetrics', () => {
    it('should return metrics for all evolution milestones', () => {
      const history = calculateHistoricalMetrics(5)

      expect(history).toHaveLength(6) // 0 through 5
    })

    it('should show progressive growth in metrics', () => {
      const history = calculateHistoricalMetrics(5)

      for (let i = 1; i < history.length; i++) {
        expect(history[i].totalLines).toBeGreaterThanOrEqual(history[i - 1].totalLines)
        expect(history[i].totalFiles).toBeGreaterThanOrEqual(history[i - 1].totalFiles)
      }
    })

    it('should handle zero evolutions', () => {
      const history = calculateHistoricalMetrics(0)

      expect(history).toHaveLength(1)
      expect(history[0].totalFiles).toBe(8)
    })
  })

  describe('getMetricsSummary', () => {
    it('should include current metrics', () => {
      const summary = getMetricsSummary(5)

      expect(summary.current).toBeDefined()
      expect(summary.current.totalFiles).toBeGreaterThan(0)
      expect(summary.current.totalLines).toBeGreaterThan(0)
    })

    it('should calculate growth metrics', () => {
      const summary = getMetricsSummary(5)

      expect(summary.growth).toBeDefined()
      expect(summary.growth.filesGrowth).toBeGreaterThan(0)
      expect(summary.growth.linesGrowth).toBeGreaterThan(0)
    })

    it('should have zero growth for first evolution', () => {
      const summary = getMetricsSummary(0)

      expect(summary.growth.filesGrowth).toBe(0)
      expect(summary.growth.linesGrowth).toBe(0)
      expect(summary.growth.testCoverageGrowth).toBe(0)
    })

    it('should include trend analysis', () => {
      const summary = getMetricsSummary(5)

      expect(summary.trends).toBeDefined()
      expect(summary.trends.testCoverageImproving).toBeDefined()
      expect(summary.trends.codebaseGrowing).toBeDefined()
      expect(summary.trends.testingStrength).toBeDefined()
    })

    it('should classify testing strength correctly', () => {
      const summary = getMetricsSummary(8)

      expect(['excellent', 'good', 'needs-improvement']).toContain(
        summary.trends.testingStrength
      )
    })

    it('should mark codebase as growing when there is growth', () => {
      const summary = getMetricsSummary(5)

      expect(summary.trends.codebaseGrowing).toBe(
        summary.growth.linesGrowth > 0
      )
    })
  })

  describe('getMetricsInsights', () => {
    it('should return insights array', () => {
      const summary = getMetricsSummary(8)
      const insights = getMetricsInsights(summary)

      expect(Array.isArray(insights)).toBe(true)
      expect(insights.length).toBeGreaterThan(0)
    })

    it('should include test coverage insight', () => {
      const summary = getMetricsSummary(8)
      const insights = getMetricsInsights(summary)

      const hasCoverageInsight = insights.some(
        (insight) =>
          insight.includes('coverage') || insight.includes('test-to-code')
      )
      expect(hasCoverageInsight).toBe(true)
    })

    it('should provide positive insights for excellent testing', () => {
      const summary: MetricsSummary = {
        current: {
          date: '2026-01-27',
          totalFiles: 30,
          testFiles: 15,
          totalLines: 3000,
          testLines: 1500,
          avgLinesPerFile: 100,
          testCoverage: 50,
          codeToTestRatio: 2.0,
        },
        growth: {
          filesGrowth: 2,
          linesGrowth: 200,
          testCoverageGrowth: 1,
        },
        trends: {
          testCoverageImproving: true,
          codebaseGrowing: true,
          testingStrength: 'excellent',
        },
      }

      const insights = getMetricsInsights(summary)
      
      const hasExcellentInsight = insights.some((i) => i.includes('Excellent'))
      expect(hasExcellentInsight).toBe(true)
    })

    it('should highlight growth when codebase is expanding', () => {
      const summary = getMetricsSummary(10)
      const insights = getMetricsInsights(summary)

      const hasGrowthInsight = insights.some((i) => i.includes('growing'))
      expect(hasGrowthInsight).toBe(true)
    })

    it('should mention test coverage improvements', () => {
      const summary: MetricsSummary = {
        current: {
          date: '2026-01-27',
          totalFiles: 30,
          testFiles: 15,
          totalLines: 3000,
          testLines: 1200,
          avgLinesPerFile: 100,
          testCoverage: 40,
          codeToTestRatio: 2.5,
        },
        growth: {
          filesGrowth: 2,
          linesGrowth: 200,
          testCoverageGrowth: 2,
        },
        trends: {
          testCoverageImproving: true,
          codebaseGrowing: true,
          testingStrength: 'good',
        },
      }

      const insights = getMetricsInsights(summary)
      
      const hasImprovementInsight = insights.some((i) => 
        i.includes('improving')
      )
      expect(hasImprovementInsight).toBe(true)
    })

    it('should recognize substantial codebases', () => {
      const summary: MetricsSummary = {
        current: {
          date: '2026-01-27',
          totalFiles: 35,
          testFiles: 18,
          totalLines: 4000,
          testLines: 1800,
          avgLinesPerFile: 114,
          testCoverage: 45,
          codeToTestRatio: 2.22,
        },
        growth: {
          filesGrowth: 2,
          linesGrowth: 300,
          testCoverageGrowth: 0,
        },
        trends: {
          testCoverageImproving: true,
          codebaseGrowing: true,
          testingStrength: 'excellent',
        },
      }

      const insights = getMetricsInsights(summary)
      
      const hasScaleInsight = insights.some((i) => i.includes('Substantial'))
      expect(hasScaleInsight).toBe(true)
    })
  })
})
