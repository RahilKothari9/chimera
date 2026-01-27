/**
 * Code Metrics UI Component
 * Creates interactive visualizations for code metrics
 */

import type { MetricsSummary, CodeMetrics } from './codeMetrics'

/**
 * Create a metric card element
 */
function createMetricCard(
  icon: string,
  label: string,
  value: string | number,
  change?: string,
  changePositive?: boolean
): HTMLElement {
  const card = document.createElement('div')
  card.className = 'metric-card'

  const iconEl = document.createElement('div')
  iconEl.className = 'metric-icon'
  iconEl.textContent = icon

  const content = document.createElement('div')
  content.className = 'metric-content'

  const labelEl = document.createElement('div')
  labelEl.className = 'metric-label'
  labelEl.textContent = label

  const valueEl = document.createElement('div')
  valueEl.className = 'metric-value'
  valueEl.textContent = String(value)

  content.appendChild(labelEl)
  content.appendChild(valueEl)

  if (change !== undefined) {
    const changeEl = document.createElement('div')
    changeEl.className = `metric-change ${changePositive ? 'positive' : 'negative'}`
    changeEl.textContent = change
    content.appendChild(changeEl)
  }

  card.appendChild(iconEl)
  card.appendChild(content)

  return card
}

/**
 * Create insights list
 */
function createInsightsList(insights: string[]): HTMLElement {
  const container = document.createElement('div')
  container.className = 'metrics-insights'

  const title = document.createElement('h3')
  title.className = 'insights-title'
  title.textContent = 'Key Insights'
  container.appendChild(title)

  const list = document.createElement('ul')
  list.className = 'insights-list'

  insights.forEach((insight) => {
    const item = document.createElement('li')
    item.className = 'insight-item'
    item.textContent = insight
    list.appendChild(item)
  })

  container.appendChild(list)

  return container
}

/**
 * Create a simple line chart for metrics history
 */
function createMetricsChart(
  history: CodeMetrics[],
  metric: 'totalLines' | 'testCoverage'
): HTMLElement {
  const container = document.createElement('div')
  container.className = 'metrics-chart'

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('width', '100%')
  svg.setAttribute('height', '200')
  svg.setAttribute('viewBox', '0 0 600 200')

  // Calculate chart dimensions
  const padding = 40
  const chartWidth = 600 - padding * 2
  const chartHeight = 200 - padding * 2

  // Find min/max values for scaling
  const values = history.map((h) => h[metric])
  const maxValue = Math.max(...values)
  const minValue = Math.min(...values)
  const valueRange = maxValue - minValue || 1

  // Create path for line chart
  const points = history.map((h, i) => {
    const x = padding + (i / (history.length - 1 || 1)) * chartWidth
    const normalizedValue = (h[metric] - minValue) / valueRange
    const y = padding + chartHeight - normalizedValue * chartHeight
    return `${x},${y}`
  })

  // Draw line
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  path.setAttribute('d', `M ${points.join(' L ')}`)
  path.setAttribute('stroke', metric === 'totalLines' ? '#667eea' : '#f093fb')
  path.setAttribute('stroke-width', '3')
  path.setAttribute('fill', 'none')
  path.setAttribute('stroke-linecap', 'round')
  path.setAttribute('stroke-linejoin', 'round')

  // Add gradient fill under line
  const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
  const linearGradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient')
  linearGradient.setAttribute('id', `gradient-${metric}`)
  linearGradient.setAttribute('x1', '0%')
  linearGradient.setAttribute('y1', '0%')
  linearGradient.setAttribute('x2', '0%')
  linearGradient.setAttribute('y2', '100%')

  const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop')
  stop1.setAttribute('offset', '0%')
  stop1.setAttribute('stop-color', metric === 'totalLines' ? '#667eea' : '#f093fb')
  stop1.setAttribute('stop-opacity', '0.3')

  const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop')
  stop2.setAttribute('offset', '100%')
  stop2.setAttribute('stop-color', metric === 'totalLines' ? '#667eea' : '#f093fb')
  stop2.setAttribute('stop-opacity', '0')

  linearGradient.appendChild(stop1)
  linearGradient.appendChild(stop2)
  gradient.appendChild(linearGradient)

  // Create fill area
  const fillPath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  const fillPoints = [
    `M ${padding},${padding + chartHeight}`,
    ...points.map(p => `L ${p}`),
    `L ${padding + chartWidth},${padding + chartHeight}`,
    'Z'
  ]
  fillPath.setAttribute('d', fillPoints.join(' '))
  fillPath.setAttribute('fill', `url(#gradient-${metric})`)

  svg.appendChild(gradient)
  svg.appendChild(fillPath)
  svg.appendChild(path)

  // Add dots for each data point
  history.forEach((h, i) => {
    const x = padding + (i / (history.length - 1 || 1)) * chartWidth
    const normalizedValue = (h[metric] - minValue) / valueRange
    const y = padding + chartHeight - normalizedValue * chartHeight

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    circle.setAttribute('cx', String(x))
    circle.setAttribute('cy', String(y))
    circle.setAttribute('r', '4')
    circle.setAttribute('fill', metric === 'totalLines' ? '#667eea' : '#f093fb')
    circle.setAttribute('class', 'chart-dot')

    // Add tooltip on hover
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'title')
    title.textContent = `Day ${i}: ${h[metric]}${metric === 'testCoverage' ? '%' : ' lines'}`
    circle.appendChild(title)

    svg.appendChild(circle)
  })

  // Add axes labels
  const yAxisLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text')
  yAxisLabel.setAttribute('x', '10')
  yAxisLabel.setAttribute('y', '20')
  yAxisLabel.setAttribute('fill', 'var(--text-color)')
  yAxisLabel.setAttribute('font-size', '12')
  yAxisLabel.textContent = metric === 'totalLines' ? 'Lines of Code' : 'Test Coverage %'
  svg.appendChild(yAxisLabel)

  container.appendChild(svg)

  return container
}

/**
 * Create the complete metrics dashboard UI
 */
export function createMetricsUI(
  summary: MetricsSummary,
  history: CodeMetrics[],
  insights: string[]
): HTMLElement {
  const container = document.createElement('div')
  container.className = 'metrics-section'

  // Header
  const header = document.createElement('div')
  header.className = 'metrics-header'
  
  const title = document.createElement('h2')
  title.className = 'section-title'
  title.textContent = 'Code Metrics'
  
  const subtitle = document.createElement('p')
  subtitle.className = 'metrics-subtitle'
  subtitle.textContent = 'Technical growth analysis of the codebase'
  
  header.appendChild(title)
  header.appendChild(subtitle)
  container.appendChild(header)

  // Metrics cards grid
  const cardsGrid = document.createElement('div')
  cardsGrid.className = 'metrics-grid'

  // Create cards for each metric
  const { current, growth } = summary

  cardsGrid.appendChild(
    createMetricCard(
      '📁',
      'Total Files',
      current.totalFiles,
      growth.filesGrowth > 0 ? `+${growth.filesGrowth}` : undefined,
      growth.filesGrowth > 0
    )
  )

  cardsGrid.appendChild(
    createMetricCard(
      '🧪',
      'Test Files',
      current.testFiles,
      undefined,
      true
    )
  )

  cardsGrid.appendChild(
    createMetricCard(
      '📝',
      'Lines of Code',
      current.totalLines.toLocaleString(),
      growth.linesGrowth > 0 ? `+${growth.linesGrowth}` : undefined,
      growth.linesGrowth > 0
    )
  )

  cardsGrid.appendChild(
    createMetricCard(
      '✅',
      'Test Coverage',
      `${current.testCoverage}%`,
      growth.testCoverageGrowth !== 0 
        ? `${growth.testCoverageGrowth > 0 ? '+' : ''}${growth.testCoverageGrowth}%` 
        : undefined,
      growth.testCoverageGrowth >= 0
    )
  )

  cardsGrid.appendChild(
    createMetricCard(
      '📊',
      'Avg Lines/File',
      current.avgLinesPerFile,
      undefined,
      true
    )
  )

  cardsGrid.appendChild(
    createMetricCard(
      '⚖️',
      'Code:Test Ratio',
      `1:${current.codeToTestRatio}`,
      undefined,
      true
    )
  )

  container.appendChild(cardsGrid)

  // Charts section
  const chartsSection = document.createElement('div')
  chartsSection.className = 'metrics-charts-section'

  const chartsTitle = document.createElement('h3')
  chartsTitle.className = 'charts-title'
  chartsTitle.textContent = 'Growth Trends'
  chartsSection.appendChild(chartsTitle)

  const chartsGrid = document.createElement('div')
  chartsGrid.className = 'charts-grid'

  // Lines of code chart
  const locChartContainer = document.createElement('div')
  locChartContainer.className = 'chart-container'
  const locTitle = document.createElement('h4')
  locTitle.textContent = 'Lines of Code Over Time'
  locChartContainer.appendChild(locTitle)
  locChartContainer.appendChild(createMetricsChart(history, 'totalLines'))
  chartsGrid.appendChild(locChartContainer)

  // Test coverage chart
  const coverageChartContainer = document.createElement('div')
  coverageChartContainer.className = 'chart-container'
  const coverageTitle = document.createElement('h4')
  coverageTitle.textContent = 'Test Coverage Trend'
  coverageChartContainer.appendChild(coverageTitle)
  coverageChartContainer.appendChild(createMetricsChart(history, 'testCoverage'))
  chartsGrid.appendChild(coverageChartContainer)

  chartsSection.appendChild(chartsGrid)
  container.appendChild(chartsSection)

  // Insights section
  container.appendChild(createInsightsList(insights))

  return container
}

/**
 * Setup metrics UI in a container
 */
export function setupMetricsUI(
  container: HTMLElement,
  summary: MetricsSummary,
  history: CodeMetrics[],
  insights: string[]
): void {
  container.innerHTML = ''
  const metricsUI = createMetricsUI(summary, history, insights)
  container.appendChild(metricsUI)
}
