/**
 * Performance Dashboard UI
 * Visualizes application performance metrics and trends
 */

import {
  calculatePerformanceStats,
  collectMetrics,
  generateHistoricalMetrics,
  type PerformanceMetric,
} from './performanceMetrics'

/**
 * Formats bytes to human-readable size
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }
}

/**
 * Formats milliseconds to readable time
 */
export function formatTime(ms: number): string {
  if (ms < 1000) {
    return `${Math.round(ms)} ms`
  } else {
    return `${(ms / 1000).toFixed(2)} s`
  }
}

/**
 * Gets trend indicator emoji
 */
export function getTrendIndicator(
  trend: 'improving' | 'stable' | 'degrading'
): string {
  switch (trend) {
    case 'improving':
      return '📉'
    case 'degrading':
      return '📈'
    default:
      return '➡️'
  }
}

/**
 * Gets trend class for styling
 */
export function getTrendClass(trend: 'improving' | 'stable' | 'degrading'): string {
  switch (trend) {
    case 'improving':
      return 'trend-good'
    case 'degrading':
      return 'trend-bad'
    default:
      return 'trend-stable'
  }
}

/**
 * Creates a metric card element
 */
export function createMetricCard(
  label: string,
  value: string,
  trend?: 'improving' | 'stable' | 'degrading',
  subtitle?: string
): HTMLElement {
  const card = document.createElement('div')
  card.className = 'perf-metric-card'

  if (trend) {
    const trendClass = getTrendClass(trend)
    card.classList.add(trendClass)
  }

  const labelEl = document.createElement('div')
  labelEl.className = 'metric-label'
  labelEl.textContent = label

  const valueEl = document.createElement('div')
  valueEl.className = 'metric-value'
  valueEl.textContent = value

  if (trend) {
    const trendEl = document.createElement('span')
    trendEl.className = 'metric-trend'
    trendEl.textContent = ` ${getTrendIndicator(trend)}`
    valueEl.appendChild(trendEl)
  }

  card.appendChild(labelEl)
  card.appendChild(valueEl)

  if (subtitle) {
    const subtitleEl = document.createElement('div')
    subtitleEl.className = 'metric-subtitle'
    subtitleEl.textContent = subtitle
    card.appendChild(subtitleEl)
  }

  return card
}

/**
 * Creates performance chart (simplified line chart)
 */
export function createPerformanceChart(
  metrics: PerformanceMetric[],
  metricKey: keyof PerformanceMetric,
  label: string,
  formatValue: (val: number) => string
): HTMLElement {
  const container = document.createElement('div')
  container.className = 'perf-chart-container'

  const title = document.createElement('h4')
  title.className = 'perf-chart-title'
  title.textContent = label
  container.appendChild(title)

  if (metrics.length === 0) {
    const noData = document.createElement('p')
    noData.className = 'perf-chart-nodata'
    noData.textContent = 'No historical data yet'
    container.appendChild(noData)
    return container
  }

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('width', '100%')
  svg.setAttribute('height', '200')
  svg.setAttribute('class', 'perf-chart')

  const width = 600
  const height = 200
  const padding = 40

  // Extract values
  const values = metrics
    .map((m) => m[metricKey])
    .filter((v): v is number => typeof v === 'number')

  if (values.length === 0) {
    const noData = document.createElement('p')
    noData.className = 'perf-chart-nodata'
    noData.textContent = 'No data available for this metric'
    container.appendChild(noData)
    return container
  }

  const minVal = Math.min(...values)
  const maxVal = Math.max(...values)
  const range = maxVal - minVal || 1

  // Create points
  const points: { x: number; y: number; value: number }[] = values.map(
    (val, i) => ({
      x: padding + (i / (values.length - 1 || 1)) * (width - padding * 2),
      y: height - padding - ((val - minVal) / range) * (height - padding * 2),
      value: val,
    })
  )

  // Draw line
  const pathData = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ')

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  path.setAttribute('d', pathData)
  path.setAttribute('class', 'perf-chart-line')
  path.setAttribute('fill', 'none')
  path.setAttribute('stroke', 'var(--accent-primary)')
  path.setAttribute('stroke-width', '2')
  svg.appendChild(path)

  // Draw points
  points.forEach((point, i) => {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    circle.setAttribute('cx', point.x.toString())
    circle.setAttribute('cy', point.y.toString())
    circle.setAttribute('r', '4')
    circle.setAttribute('class', 'perf-chart-point')
    circle.setAttribute('fill', 'var(--accent-primary)')

    // Add tooltip
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'title')
    const dayLabel = metrics.length > 1 ? `Day ${i + 1}: ` : ''
    title.textContent = `${dayLabel}${formatValue(point.value)}`
    circle.appendChild(title)

    svg.appendChild(circle)
  })

  // Add axis labels
  const minLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text')
  minLabel.setAttribute('x', '5')
  minLabel.setAttribute('y', (height - padding + 20).toString())
  minLabel.setAttribute('class', 'perf-chart-label')
  minLabel.textContent = formatValue(minVal)
  svg.appendChild(minLabel)

  const maxLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text')
  maxLabel.setAttribute('x', '5')
  maxLabel.setAttribute('y', (padding - 10).toString())
  maxLabel.setAttribute('class', 'perf-chart-label')
  maxLabel.textContent = formatValue(maxVal)
  svg.appendChild(maxLabel)

  container.appendChild(svg)
  return container
}

/**
 * Creates insights list
 */
export function createInsightsList(insights: string[]): HTMLElement {
  const container = document.createElement('div')
  container.className = 'perf-insights'

  const title = document.createElement('h4')
  title.className = 'perf-insights-title'
  title.textContent = 'Performance Insights'
  container.appendChild(title)

  const list = document.createElement('ul')
  list.className = 'perf-insights-list'

  insights.forEach((insight) => {
    const item = document.createElement('li')
    item.className = 'perf-insight-item'
    item.textContent = insight
    list.appendChild(item)
  })

  container.appendChild(list)
  return container
}

/**
 * Sets up the performance dashboard UI
 */
export function setupPerformanceUI(
  container: HTMLElement,
  evolutionCount: number
): void {
  // Collect current metrics
  const currentMetrics = collectMetrics(evolutionCount)

  // Generate historical data
  const historicalMetrics = generateHistoricalMetrics(evolutionCount)

  // Calculate stats
  const stats = calculatePerformanceStats(currentMetrics, historicalMetrics)

  // Create header
  const header = document.createElement('div')
  header.className = 'perf-header'

  const title = document.createElement('h2')
  title.className = 'section-title'
  title.textContent = 'Performance Monitoring'
  header.appendChild(title)

  const subtitle = document.createElement('p')
  subtitle.className = 'perf-subtitle'
  subtitle.textContent = 'Real-time application performance metrics and trends'
  header.appendChild(subtitle)

  container.appendChild(header)

  // Create metrics grid
  const metricsGrid = document.createElement('div')
  metricsGrid.className = 'perf-metrics-grid'

  // Bundle size card
  metricsGrid.appendChild(
    createMetricCard(
      'Bundle Size',
      formatBytes(stats.current.bundleSize),
      stats.trend.bundleSize,
      `Avg: ${formatBytes(stats.average.bundleSize)}`
    )
  )

  // Load time card
  metricsGrid.appendChild(
    createMetricCard(
      'Page Load',
      formatTime(stats.current.loadTime),
      stats.trend.loadTime,
      `Avg: ${formatTime(stats.average.loadTime)}`
    )
  )

  // Render time card
  metricsGrid.appendChild(
    createMetricCard(
      'Render Time',
      formatTime(stats.current.renderTime),
      stats.trend.renderTime,
      `Avg: ${formatTime(stats.average.renderTime)}`
    )
  )

  // Memory usage card (if available)
  if (stats.current.memoryUsage !== undefined) {
    metricsGrid.appendChild(
      createMetricCard(
        'Memory Usage',
        `${stats.current.memoryUsage} MB`,
        undefined,
        `Avg: ${stats.average.memoryUsage.toFixed(1)} MB`
      )
    )
  }

  // Resource count card
  metricsGrid.appendChild(
    createMetricCard(
      'Resources',
      stats.current.resourceCount.toString(),
      undefined,
      `Avg: ${Math.round(stats.average.resourceCount)}`
    )
  )

  container.appendChild(metricsGrid)

  // Create charts section
  const chartsSection = document.createElement('div')
  chartsSection.className = 'perf-charts-section'

  const allMetrics = [...historicalMetrics, currentMetrics]

  // Bundle size chart
  chartsSection.appendChild(
    createPerformanceChart(allMetrics, 'bundleSize', 'Bundle Size Trend', formatBytes)
  )

  // Load time chart
  chartsSection.appendChild(
    createPerformanceChart(allMetrics, 'loadTime', 'Load Time Trend', formatTime)
  )

  container.appendChild(chartsSection)

  // Create insights section
  container.appendChild(createInsightsList(stats.insights))

  // Add last updated timestamp
  const footer = document.createElement('div')
  footer.className = 'perf-footer'
  footer.textContent = `Last updated: ${new Date(stats.current.timestamp).toLocaleString()}`
  container.appendChild(footer)
}
