/**
 * Performance Metrics Collector
 * Tracks and analyzes application performance metrics over time
 */

export interface PerformanceMetric {
  timestamp: number
  bundleSize: number // in bytes
  loadTime: number // in milliseconds
  renderTime: number // in milliseconds
  memoryUsage?: number // in MB
  resourceCount: number
}

export interface PerformanceStats {
  current: PerformanceMetric
  average: {
    bundleSize: number
    loadTime: number
    renderTime: number
    memoryUsage: number
    resourceCount: number
  }
  trend: {
    bundleSize: 'improving' | 'stable' | 'degrading'
    loadTime: 'improving' | 'stable' | 'degrading'
    renderTime: 'improving' | 'stable' | 'degrading'
  }
  insights: string[]
}

/**
 * Estimates bundle size based on evolution count and features
 */
export function estimateBundleSize(evolutionCount: number): number {
  // Base bundle size (initial setup)
  const baseSize = 50 * 1024 // 50 KB

  // Each evolution adds features which increases bundle
  // Average increase per evolution (estimated)
  const sizePerEvolution = 5 * 1024 // 5 KB per evolution

  return baseSize + (evolutionCount * sizePerEvolution)
}

/**
 * Measures actual page load time using Performance API
 */
export function measureLoadTime(): number {
  if (!performance.timing) {
    return 0
  }

  const perfData = performance.timing
  const loadTime =
    perfData.loadEventEnd - perfData.navigationStart

  return loadTime > 0 ? loadTime : 0
}

/**
 * Measures render time (DOM content loaded to load complete)
 */
export function measureRenderTime(): number {
  if (!performance.timing) {
    return 0
  }

  const perfData = performance.timing
  const renderTime =
    perfData.loadEventEnd - perfData.domContentLoadedEventEnd

  return renderTime > 0 ? renderTime : 0
}

/**
 * Gets memory usage if available (Chrome/Edge)
 */
export function getMemoryUsage(): number | undefined {
  // @ts-expect-error - memory is not standard but exists in Chrome
  if (performance.memory) {
    // @ts-expect-error
    const usedJSHeapSize = performance.memory.usedJSHeapSize
    return Math.round(usedJSHeapSize / (1024 * 1024)) // Convert to MB
  }
  return undefined
}

/**
 * Counts loaded resources (scripts, styles, images, etc.)
 */
export function countResources(): number {
  if (!performance.getEntriesByType) {
    return 0
  }

  const resources = performance.getEntriesByType('resource')
  return resources.length
}

/**
 * Collects current performance metrics
 */
export function collectMetrics(evolutionCount: number): PerformanceMetric {
  return {
    timestamp: Date.now(),
    bundleSize: estimateBundleSize(evolutionCount),
    loadTime: measureLoadTime(),
    renderTime: measureRenderTime(),
    memoryUsage: getMemoryUsage(),
    resourceCount: countResources(),
  }
}

/**
 * Analyzes performance trend based on historical data
 */
export function analyzeTrend(
  current: number,
  historical: number[]
): 'improving' | 'stable' | 'degrading' {
  if (historical.length === 0) {
    return 'stable'
  }

  const average = historical.reduce((sum, val) => sum + val, 0) / historical.length
  const threshold = 0.1 // 10% change threshold

  const changePercent = (current - average) / average

  if (changePercent < -threshold) {
    return 'improving'
  } else if (changePercent > threshold) {
    return 'degrading'
  }
  return 'stable'
}

/**
 * Generates performance insights based on metrics
 */
export function generateInsights(stats: PerformanceStats): string[] {
  const insights: string[] = []

  // Bundle size insights
  if (stats.current.bundleSize > 200 * 1024) {
    insights.push('⚠️ Large bundle size - consider code splitting')
  } else if (stats.current.bundleSize < 100 * 1024) {
    insights.push('✓ Excellent bundle size - very lean')
  } else {
    insights.push('✓ Good bundle size - well optimized')
  }

  // Load time insights
  if (stats.current.loadTime > 3000) {
    insights.push('⚠️ Slow page load - optimize assets and code')
  } else if (stats.current.loadTime < 1000) {
    insights.push('✓ Blazing fast load time - excellent performance')
  } else {
    insights.push('✓ Good load time - performs well')
  }

  // Render time insights
  if (stats.current.renderTime > 1000) {
    insights.push('⚠️ Slow render - reduce DOM complexity')
  } else if (stats.current.renderTime < 300) {
    insights.push('✓ Fast rendering - smooth user experience')
  } else {
    insights.push('✓ Acceptable render time')
  }

  // Memory insights
  if (stats.current.memoryUsage && stats.current.memoryUsage > 50) {
    insights.push('⚠️ High memory usage - check for leaks')
  } else if (stats.current.memoryUsage && stats.current.memoryUsage < 20) {
    insights.push('✓ Low memory footprint - efficient')
  }

  // Resource count insights
  if (stats.current.resourceCount > 50) {
    insights.push('ℹ️ Many resources loaded - consider bundling')
  } else if (stats.current.resourceCount < 20) {
    insights.push('✓ Minimal resources - efficient loading')
  }

  // Trend insights
  if (stats.trend.bundleSize === 'degrading') {
    insights.push('📈 Bundle size growing - monitor feature additions')
  }
  if (stats.trend.loadTime === 'improving') {
    insights.push('📉 Load time improving - great optimization work')
  }
  if (stats.trend.renderTime === 'degrading') {
    insights.push('📈 Render time slowing - review recent UI changes')
  }

  return insights
}

/**
 * Calculates performance statistics from current and historical metrics
 */
export function calculatePerformanceStats(
  current: PerformanceMetric,
  historical: PerformanceMetric[]
): PerformanceStats {
  const allMetrics = [...historical, current]

  const average = {
    bundleSize:
      allMetrics.reduce((sum, m) => sum + m.bundleSize, 0) / allMetrics.length,
    loadTime:
      allMetrics.reduce((sum, m) => sum + m.loadTime, 0) / allMetrics.length,
    renderTime:
      allMetrics.reduce((sum, m) => sum + m.renderTime, 0) / allMetrics.length,
    memoryUsage:
      allMetrics.reduce(
        (sum, m) => sum + (m.memoryUsage || 0),
        0
      ) / allMetrics.length,
    resourceCount:
      allMetrics.reduce((sum, m) => sum + m.resourceCount, 0) / allMetrics.length,
  }

  const historicalBundles = historical.map((m) => m.bundleSize)
  const historicalLoads = historical.map((m) => m.loadTime)
  const historicalRenders = historical.map((m) => m.renderTime)

  const trend = {
    bundleSize: analyzeTrend(current.bundleSize, historicalBundles),
    loadTime: analyzeTrend(current.loadTime, historicalLoads),
    renderTime: analyzeTrend(current.renderTime, historicalRenders),
  }

  const stats: PerformanceStats = {
    current,
    average,
    trend,
    insights: [],
  }

  stats.insights = generateInsights(stats)

  return stats
}

/**
 * Generates historical performance data based on evolution history
 */
export function generateHistoricalMetrics(evolutionCount: number): PerformanceMetric[] {
  const metrics: PerformanceMetric[] = []
  const now = Date.now()
  const dayMs = 24 * 60 * 60 * 1000

  // Generate data for the last 7 days of evolution (or less if fewer evolutions)
  const days = Math.min(evolutionCount, 7)

  for (let i = days - 1; i >= 0; i--) {
    const dayEvolutionCount = evolutionCount - i
    const timestamp = now - i * dayMs

    // Simulate realistic variations
    const loadTimeVariation = Math.random() * 200 - 100 // ±100ms
    const renderTimeVariation = Math.random() * 50 - 25 // ±25ms

    metrics.push({
      timestamp,
      bundleSize: estimateBundleSize(dayEvolutionCount),
      loadTime: Math.max(500, 800 + loadTimeVariation), // Base 800ms ± variation
      renderTime: Math.max(100, 200 + renderTimeVariation), // Base 200ms ± variation
      memoryUsage: 15 + Math.floor(dayEvolutionCount / 2), // Memory grows slowly
      resourceCount: 10 + Math.floor(dayEvolutionCount / 2), // Resources grow with features
    })
  }

  return metrics
}
