import { describe, it, expect, beforeEach } from 'vitest'
import { createMetricsUI, setupMetricsUI } from './metricsUI'
import type { MetricsSummary, CodeMetrics } from './codeMetrics'

describe('Metrics UI', () => {
  let mockSummary: MetricsSummary
  let mockHistory: CodeMetrics[]
  let mockInsights: string[]

  beforeEach(() => {
    mockSummary = {
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
        linesGrowth: 300,
        testCoverageGrowth: 1,
      },
      trends: {
        testCoverageImproving: true,
        codebaseGrowing: true,
        testingStrength: 'good',
      },
    }

    mockHistory = [
      {
        date: '2026-01-25',
        totalFiles: 26,
        testFiles: 13,
        totalLines: 2400,
        testLines: 1000,
        avgLinesPerFile: 92,
        testCoverage: 42,
        codeToTestRatio: 2.4,
      },
      {
        date: '2026-01-26',
        totalFiles: 28,
        testFiles: 14,
        totalLines: 2700,
        testLines: 1100,
        avgLinesPerFile: 96,
        testCoverage: 41,
        codeToTestRatio: 2.45,
      },
      mockSummary.current,
    ]

    mockInsights = [
      '✅ Good test coverage at 40%',
      '👍 Healthy test-to-code ratio (1:2.5)',
      '📈 Codebase actively growing',
    ]
  })

  describe('createMetricsUI', () => {
    it('should create metrics section container', () => {
      const ui = createMetricsUI(mockSummary, mockHistory, mockInsights)

      expect(ui.className).toBe('metrics-section')
    })

    it('should include section title', () => {
      const ui = createMetricsUI(mockSummary, mockHistory, mockInsights)

      const title = ui.querySelector('.section-title')
      expect(title).toBeTruthy()
      expect(title?.textContent).toBe('Code Metrics')
    })

    it('should include subtitle', () => {
      const ui = createMetricsUI(mockSummary, mockHistory, mockInsights)

      const subtitle = ui.querySelector('.metrics-subtitle')
      expect(subtitle).toBeTruthy()
      expect(subtitle?.textContent).toContain('Technical growth')
    })

    it('should create metrics grid', () => {
      const ui = createMetricsUI(mockSummary, mockHistory, mockInsights)

      const grid = ui.querySelector('.metrics-grid')
      expect(grid).toBeTruthy()
    })

    it('should display total files metric', () => {
      const ui = createMetricsUI(mockSummary, mockHistory, mockInsights)

      const cards = ui.querySelectorAll('.metric-card')
      const filesCard = Array.from(cards).find((card) =>
        card.textContent?.includes('Total Files')
      )

      expect(filesCard).toBeTruthy()
      expect(filesCard?.textContent).toContain('30')
    })

    it('should display test files metric', () => {
      const ui = createMetricsUI(mockSummary, mockHistory, mockInsights)

      const cards = ui.querySelectorAll('.metric-card')
      const testFilesCard = Array.from(cards).find((card) =>
        card.textContent?.includes('Test Files')
      )

      expect(testFilesCard).toBeTruthy()
      expect(testFilesCard?.textContent).toContain('15')
    })

    it('should display lines of code metric', () => {
      const ui = createMetricsUI(mockSummary, mockHistory, mockInsights)

      const cards = ui.querySelectorAll('.metric-card')
      const linesCard = Array.from(cards).find((card) =>
        card.textContent?.includes('Lines of Code')
      )

      expect(linesCard).toBeTruthy()
      expect(linesCard?.textContent).toContain('3,000')
    })

    it('should display test coverage metric', () => {
      const ui = createMetricsUI(mockSummary, mockHistory, mockInsights)

      const cards = ui.querySelectorAll('.metric-card')
      const coverageCard = Array.from(cards).find((card) =>
        card.textContent?.includes('Test Coverage')
      )

      expect(coverageCard).toBeTruthy()
      expect(coverageCard?.textContent).toContain('40%')
    })

    it('should display average lines per file metric', () => {
      const ui = createMetricsUI(mockSummary, mockHistory, mockInsights)

      const cards = ui.querySelectorAll('.metric-card')
      const avgCard = Array.from(cards).find((card) =>
        card.textContent?.includes('Avg Lines/File')
      )

      expect(avgCard).toBeTruthy()
      expect(avgCard?.textContent).toContain('100')
    })

    it('should display code to test ratio metric', () => {
      const ui = createMetricsUI(mockSummary, mockHistory, mockInsights)

      const cards = ui.querySelectorAll('.metric-card')
      const ratioCard = Array.from(cards).find((card) =>
        card.textContent?.includes('Code:Test Ratio')
      )

      expect(ratioCard).toBeTruthy()
      expect(ratioCard?.textContent).toContain('2.5')
    })

    it('should show growth indicators for files', () => {
      const ui = createMetricsUI(mockSummary, mockHistory, mockInsights)

      const cards = ui.querySelectorAll('.metric-card')
      const filesCard = Array.from(cards).find((card) =>
        card.textContent?.includes('Total Files')
      )

      expect(filesCard?.textContent).toContain('+2')
    })

    it('should show growth indicators for lines', () => {
      const ui = createMetricsUI(mockSummary, mockHistory, mockInsights)

      const cards = ui.querySelectorAll('.metric-card')
      const linesCard = Array.from(cards).find((card) =>
        card.textContent?.includes('Lines of Code')
      )

      expect(linesCard?.textContent).toContain('+300')
    })

    it('should include charts section', () => {
      const ui = createMetricsUI(mockSummary, mockHistory, mockInsights)

      const chartsSection = ui.querySelector('.metrics-charts-section')
      expect(chartsSection).toBeTruthy()
    })

    it('should create SVG charts', () => {
      const ui = createMetricsUI(mockSummary, mockHistory, mockInsights)

      const svgs = ui.querySelectorAll('svg')
      expect(svgs.length).toBeGreaterThanOrEqual(2) // At least 2 charts
    })

    it('should include insights section', () => {
      const ui = createMetricsUI(mockSummary, mockHistory, mockInsights)

      const insightsSection = ui.querySelector('.metrics-insights')
      expect(insightsSection).toBeTruthy()
    })

    it('should display all insights', () => {
      const ui = createMetricsUI(mockSummary, mockHistory, mockInsights)

      const insightItems = ui.querySelectorAll('.insight-item')
      expect(insightItems.length).toBe(mockInsights.length)
    })

    it('should display insight text correctly', () => {
      const ui = createMetricsUI(mockSummary, mockHistory, mockInsights)

      const insightItems = ui.querySelectorAll('.insight-item')
      const firstInsight = insightItems[0]

      expect(firstInsight.textContent).toBe(mockInsights[0])
    })

    it('should include chart titles', () => {
      const ui = createMetricsUI(mockSummary, mockHistory, mockInsights)

      const chartContainers = ui.querySelectorAll('.chart-container')
      expect(chartContainers.length).toBe(2)

      const titles = ui.querySelectorAll('.chart-container h4')
      expect(titles.length).toBe(2)
    })

    it('should create lines of code chart', () => {
      const ui = createMetricsUI(mockSummary, mockHistory, mockInsights)

      const chartTitles = ui.querySelectorAll('.chart-container h4')
      const locChart = Array.from(chartTitles).find((title) =>
        title.textContent?.includes('Lines of Code')
      )

      expect(locChart).toBeTruthy()
    })

    it('should create test coverage chart', () => {
      const ui = createMetricsUI(mockSummary, mockHistory, mockInsights)

      const chartTitles = ui.querySelectorAll('.chart-container h4')
      const coverageChart = Array.from(chartTitles).find((title) =>
        title.textContent?.includes('Test Coverage')
      )

      expect(coverageChart).toBeTruthy()
    })

    it('should render chart data points', () => {
      const ui = createMetricsUI(mockSummary, mockHistory, mockInsights)

      const circles = ui.querySelectorAll('circle.chart-dot')
      // Should have dots for each history entry (2 charts * 3 history entries)
      expect(circles.length).toBe(mockHistory.length * 2)
    })
  })

  describe('setupMetricsUI', () => {
    it('should clear container before adding UI', () => {
      const container = document.createElement('div')
      container.innerHTML = '<p>Old content</p>'

      setupMetricsUI(container, mockSummary, mockHistory, mockInsights)

      expect(container.querySelector('p')?.textContent).not.toBe('Old content')
    })

    it('should append metrics UI to container', () => {
      const container = document.createElement('div')

      setupMetricsUI(container, mockSummary, mockHistory, mockInsights)

      const metricsSection = container.querySelector('.metrics-section')
      expect(metricsSection).toBeTruthy()
    })

    it('should create complete UI structure', () => {
      const container = document.createElement('div')

      setupMetricsUI(container, mockSummary, mockHistory, mockInsights)

      expect(container.querySelector('.metrics-grid')).toBeTruthy()
      expect(container.querySelector('.metrics-charts-section')).toBeTruthy()
      expect(container.querySelector('.metrics-insights')).toBeTruthy()
    })
  })
})
