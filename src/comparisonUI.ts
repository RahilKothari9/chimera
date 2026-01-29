import type { ChangelogEntry } from './changelogParser'
import {
  comparePeriods,
  compareEntries,
  getPresetPeriods,
  type ComparisonMetrics,
  type EntryComparison,
  type ComparisonPeriod,
  type PeriodMetrics,
  type MetricDifferences
} from './comparisonEngine'

/**
 * Create the comparison UI component
 */
export function createComparisonUI(entries: ChangelogEntry[]): HTMLElement {
  const container = document.createElement('div')
  container.className = 'comparison-container'
  
  const header = document.createElement('h2')
  header.className = 'section-title'
  header.textContent = '🔍 Evolution Comparison'
  
  const description = document.createElement('p')
  description.className = 'comparison-description'
  description.textContent = 'Compare different time periods or specific evolution entries to analyze trends and patterns.'
  
  const modeSelector = createModeSelector()
  const comparisonContent = document.createElement('div')
  comparisonContent.className = 'comparison-content'
  
  // Default to period comparison
  comparisonContent.appendChild(createPeriodComparison(entries))
  
  // Handle mode switching
  const selectElement = modeSelector.querySelector('.comparison-mode-select') as HTMLSelectElement
  selectElement.addEventListener('change', (e) => {
    const target = e.target as HTMLSelectElement
    comparisonContent.innerHTML = ''
    
    if (target.value === 'period') {
      comparisonContent.appendChild(createPeriodComparison(entries))
    } else {
      comparisonContent.appendChild(createEntryComparison(entries))
    }
  })
  
  container.appendChild(header)
  container.appendChild(description)
  container.appendChild(modeSelector)
  container.appendChild(comparisonContent)
  
  return container
}

/**
 * Create mode selector (period vs entry comparison)
 */
function createModeSelector(): HTMLElement {
  const container = document.createElement('div')
  container.className = 'comparison-mode-selector'
  
  const label = document.createElement('label')
  label.textContent = 'Comparison Mode: '
  
  const select = document.createElement('select')
  select.className = 'comparison-mode-select'
  
  const periodOption = document.createElement('option')
  periodOption.value = 'period'
  periodOption.textContent = 'Compare Time Periods'
  
  const entryOption = document.createElement('option')
  entryOption.value = 'entry'
  entryOption.textContent = 'Compare Specific Entries'
  
  select.appendChild(periodOption)
  select.appendChild(entryOption)
  
  label.appendChild(select)
  container.appendChild(label)
  
  return container
}

/**
 * Create period comparison UI
 */
function createPeriodComparison(entries: ChangelogEntry[]): HTMLElement {
  const container = document.createElement('div')
  container.className = 'period-comparison'
  
  const presets = getPresetPeriods(entries)
  
  // Period selectors
  const selectorsContainer = document.createElement('div')
  selectorsContainer.className = 'period-selectors'
  
  const period1Selector = createPeriodSelector('Period 1', presets, 0)
  const period2Selector = createPeriodSelector('Period 2', presets, 1)
  
  selectorsContainer.appendChild(period1Selector.element)
  selectorsContainer.appendChild(period2Selector.element)
  
  // Results container
  const resultsContainer = document.createElement('div')
  resultsContainer.className = 'comparison-results'
  
  // Compare button
  const compareButton = document.createElement('button')
  compareButton.className = 'comparison-button'
  compareButton.textContent = 'Compare Periods'
  
  compareButton.addEventListener('click', () => {
    const selectedIndex1 = parseInt(period1Selector.select.value, 10)
    const selectedIndex2 = parseInt(period2Selector.select.value, 10)
    const period1 = presets[selectedIndex1]
    const period2 = presets[selectedIndex2]
    
    if (!period1 || !period2) {
      resultsContainer.innerHTML = '<p class="error">Invalid period selection</p>'
      return
    }
    
    const metrics = comparePeriods(entries, period1, period2)
    resultsContainer.innerHTML = ''
    resultsContainer.appendChild(renderPeriodComparison(metrics))
  })
  
  container.appendChild(selectorsContainer)
  container.appendChild(compareButton)
  container.appendChild(resultsContainer)
  
  return container
}

/**
 * Create period selector dropdown
 */
function createPeriodSelector(
  label: string,
  presets: ComparisonPeriod[],
  defaultIndex: number
): { element: HTMLElement; select: HTMLSelectElement } {
  const container = document.createElement('div')
  container.className = 'period-selector'
  
  const labelElement = document.createElement('label')
  labelElement.textContent = `${label}: `
  
  const select = document.createElement('select')
  select.className = 'period-select'
  
  presets.forEach((preset, index) => {
    const option = document.createElement('option')
    option.value = index.toString()
    option.textContent = preset.label
    if (index === defaultIndex) {
      option.selected = true
    }
    select.appendChild(option)
  })
  
  labelElement.appendChild(select)
  container.appendChild(labelElement)
  
  return { element: container, select }
}

/**
 * Render period comparison results
 */
function renderPeriodComparison(metrics: ComparisonMetrics): HTMLElement {
  const container = document.createElement('div')
  container.className = 'period-comparison-results'
  
  // Side-by-side metrics
  const metricsGrid = document.createElement('div')
  metricsGrid.className = 'metrics-grid'
  
  metricsGrid.appendChild(renderPeriodCard(metrics.period1))
  metricsGrid.appendChild(renderDifferencesCard(metrics.differences))
  metricsGrid.appendChild(renderPeriodCard(metrics.period2))
  
  // Category comparison chart
  const categoryChart = renderCategoryComparison(
    metrics.period1.categories,
    metrics.period2.categories
  )
  
  container.appendChild(metricsGrid)
  container.appendChild(categoryChart)
  
  return container
}

/**
 * Render period metrics card
 */
function renderPeriodCard(period: PeriodMetrics): HTMLElement {
  const card = document.createElement('div')
  card.className = 'period-card'
  
  const title = document.createElement('h3')
  title.textContent = period.label
  
  const metrics = [
    { label: 'Evolutions', value: period.entryCount },
    { label: 'Total Tests', value: period.totalTests },
    { label: 'Total Files', value: period.totalFiles },
    { label: 'Avg Tests/Entry', value: period.avgTestsPerEntry.toFixed(1) },
    { label: 'Avg Files/Entry', value: period.avgFilesPerEntry.toFixed(1) }
  ]
  
  const metricsList = document.createElement('div')
  metricsList.className = 'period-metrics'
  
  metrics.forEach(metric => {
    const item = document.createElement('div')
    item.className = 'metric-item'
    
    const label = document.createElement('span')
    label.className = 'metric-label'
    label.textContent = metric.label
    
    const value = document.createElement('span')
    value.className = 'metric-value'
    value.textContent = metric.value.toString()
    
    item.appendChild(label)
    item.appendChild(value)
    metricsList.appendChild(item)
  })
  
  card.appendChild(title)
  card.appendChild(metricsList)
  
  return card
}

/**
 * Render differences card
 */
function renderDifferencesCard(differences: MetricDifferences): HTMLElement {
  const card = document.createElement('div')
  card.className = 'differences-card'
  
  const title = document.createElement('h3')
  title.textContent = 'Δ Differences'
  
  const metrics = [
    { label: 'Evolutions', value: differences.entryCountDiff, suffix: '' },
    { label: 'Tests', value: differences.totalTestsDiff, suffix: '' },
    { label: 'Files', value: differences.totalFilesDiff, suffix: '' },
    { label: 'Tests/Entry', value: differences.avgTestsPerEntryDiff.toFixed(1), suffix: '' },
    { label: 'Velocity', value: differences.velocityChange.toFixed(1), suffix: '%' }
  ]
  
  const metricsList = document.createElement('div')
  metricsList.className = 'differences-metrics'
  
  metrics.forEach(metric => {
    const item = document.createElement('div')
    item.className = 'metric-item'
    
    const label = document.createElement('span')
    label.className = 'metric-label'
    label.textContent = metric.label
    
    const value = document.createElement('span')
    value.className = 'metric-value'
    
    const numValue = typeof metric.value === 'string' ? parseFloat(metric.value) : metric.value
    const prefix = numValue > 0 ? '+' : ''
    const className = numValue > 0 ? 'positive' : numValue < 0 ? 'negative' : 'neutral'
    
    value.textContent = `${prefix}${metric.value}${metric.suffix}`
    value.classList.add(className)
    
    item.appendChild(label)
    item.appendChild(value)
    metricsList.appendChild(item)
  })
  
  card.appendChild(title)
  card.appendChild(metricsList)
  
  return card
}

/**
 * Render category comparison chart
 */
function renderCategoryComparison(
  categories1: Record<string, number>,
  categories2: Record<string, number>
): HTMLElement {
  const container = document.createElement('div')
  container.className = 'category-comparison'
  
  const title = document.createElement('h3')
  title.textContent = 'Category Distribution'
  
  const chart = document.createElement('div')
  chart.className = 'category-chart'
  
  const allCategories = new Set([
    ...Object.keys(categories1),
    ...Object.keys(categories2)
  ])
  
  allCategories.forEach(category => {
    const count1 = categories1[category] || 0
    const count2 = categories2[category] || 0
    
    const row = document.createElement('div')
    row.className = 'category-row'
    
    const label = document.createElement('span')
    label.className = 'category-label'
    label.textContent = category
    
    const bars = document.createElement('div')
    bars.className = 'category-bars'
    
    const bar1 = document.createElement('div')
    bar1.className = 'category-bar period1'
    bar1.style.width = `${count1 * 30}px`
    bar1.textContent = count1 > 0 ? count1.toString() : ''
    
    const bar2 = document.createElement('div')
    bar2.className = 'category-bar period2'
    bar2.style.width = `${count2 * 30}px`
    bar2.textContent = count2 > 0 ? count2.toString() : ''
    
    bars.appendChild(bar1)
    bars.appendChild(bar2)
    
    row.appendChild(label)
    row.appendChild(bars)
    chart.appendChild(row)
  })
  
  container.appendChild(title)
  container.appendChild(chart)
  
  return container
}

/**
 * Create entry comparison UI
 */
function createEntryComparison(entries: ChangelogEntry[]): HTMLElement {
  const container = document.createElement('div')
  container.className = 'entry-comparison'
  
  // Entry selectors
  const selectorsContainer = document.createElement('div')
  selectorsContainer.className = 'entry-selectors'
  
  const entry1Selector = createEntrySelector('Entry 1', entries, 0)
  const entry2Selector = createEntrySelector('Entry 2', entries, Math.min(1, entries.length - 1))
  
  selectorsContainer.appendChild(entry1Selector.element)
  selectorsContainer.appendChild(entry2Selector.element)
  
  // Results container
  const resultsContainer = document.createElement('div')
  resultsContainer.className = 'comparison-results'
  
  // Compare button
  const compareButton = document.createElement('button')
  compareButton.className = 'comparison-button'
  compareButton.textContent = 'Compare Entries'
  
  compareButton.addEventListener('click', () => {
    const selectedIndex1 = parseInt(entry1Selector.select.value, 10)
    const selectedIndex2 = parseInt(entry2Selector.select.value, 10)
    const entry1 = entries[selectedIndex1]
    const entry2 = entries[selectedIndex2]
    
    if (!entry1 || !entry2) {
      resultsContainer.innerHTML = '<p class="error">Invalid entry selection</p>'
      return
    }
    
    const comparison = compareEntries(entry1, entry2)
    resultsContainer.innerHTML = ''
    resultsContainer.appendChild(renderEntryComparison(comparison))
  })
  
  container.appendChild(selectorsContainer)
  container.appendChild(compareButton)
  container.appendChild(resultsContainer)
  
  return container
}

/**
 * Create entry selector dropdown
 */
function createEntrySelector(
  label: string,
  entries: ChangelogEntry[],
  defaultIndex: number
): { element: HTMLElement; select: HTMLSelectElement } {
  const container = document.createElement('div')
  container.className = 'entry-selector'
  
  const labelElement = document.createElement('label')
  labelElement.textContent = `${label}: `
  
  const select = document.createElement('select')
  select.className = 'entry-select'
  
  entries.forEach((entry, index) => {
    const option = document.createElement('option')
    option.value = index.toString()
    option.textContent = `Day ${entry.day}: ${entry.feature}`
    if (index === defaultIndex) {
      option.selected = true
    }
    select.appendChild(option)
  })
  
  labelElement.appendChild(select)
  container.appendChild(labelElement)
  
  return { element: container, select }
}

/**
 * Render entry comparison results
 */
function renderEntryComparison(comparison: EntryComparison): HTMLElement {
  const container = document.createElement('div')
  container.className = 'entry-comparison-results'
  
  const grid = document.createElement('div')
  grid.className = 'entry-grid'
  
  grid.appendChild(renderEntryCard(comparison.entry1, 'Entry 1'))
  grid.appendChild(renderEntryDifferencesCard(comparison.differences))
  grid.appendChild(renderEntryCard(comparison.entry2, 'Entry 2'))
  
  container.appendChild(grid)
  
  return container
}

/**
 * Render entry details card
 */
function renderEntryCard(entry: ChangelogEntry, title: string): HTMLElement {
  const card = document.createElement('div')
  card.className = 'entry-card'
  
  const cardTitle = document.createElement('h3')
  cardTitle.textContent = title
  
  const details = document.createElement('div')
  details.className = 'entry-details'
  
  const dayLabel = document.createElement('div')
  dayLabel.className = 'entry-detail'
  const dayStrong = document.createElement('strong')
  dayStrong.textContent = 'Day: '
  dayLabel.appendChild(dayStrong)
  dayLabel.appendChild(document.createTextNode(entry.day))
  
  const dateLabel = document.createElement('div')
  dateLabel.className = 'entry-detail'
  const dateStrong = document.createElement('strong')
  dateStrong.textContent = 'Date: '
  dateLabel.appendChild(dateStrong)
  dateLabel.appendChild(document.createTextNode(entry.date))
  
  const featureLabel = document.createElement('div')
  featureLabel.className = 'entry-detail'
  const featureStrong = document.createElement('strong')
  featureStrong.textContent = 'Feature: '
  featureLabel.appendChild(featureStrong)
  featureLabel.appendChild(document.createTextNode(entry.feature))
  
  const descLabel = document.createElement('div')
  descLabel.className = 'entry-detail'
  const descStrong = document.createElement('strong')
  descStrong.textContent = 'Description: '
  descLabel.appendChild(descStrong)
  const truncatedDesc = entry.description.length > 100 
    ? entry.description.substring(0, 100) + '...'
    : entry.description
  descLabel.appendChild(document.createTextNode(truncatedDesc))
  
  details.appendChild(dayLabel)
  details.appendChild(dateLabel)
  details.appendChild(featureLabel)
  details.appendChild(descLabel)
  
  card.appendChild(cardTitle)
  card.appendChild(details)
  
  return card
}

/**
 * Render entry differences card
 */
function renderEntryDifferencesCard(differences: EntryComparison['differences']): HTMLElement {
  const card = document.createElement('div')
  card.className = 'entry-differences-card'
  
  const title = document.createElement('h3')
  title.textContent = 'Δ Differences'
  
  const metrics = [
    { label: 'Tests', value: differences.testsDiff },
    { label: 'Files', value: differences.filesDiff },
    { label: 'Description Length', value: differences.descriptionLengthDiff },
    { label: 'Category Changed', value: differences.categoryDiff ? 'Yes' : 'No' }
  ]
  
  const metricsList = document.createElement('div')
  metricsList.className = 'entry-differences-metrics'
  
  metrics.forEach(metric => {
    const item = document.createElement('div')
    item.className = 'metric-item'
    
    const label = document.createElement('span')
    label.className = 'metric-label'
    label.textContent = metric.label
    
    const value = document.createElement('span')
    value.className = 'metric-value'
    
    if (typeof metric.value === 'number') {
      const prefix = metric.value > 0 ? '+' : ''
      const className = metric.value > 0 ? 'positive' : metric.value < 0 ? 'negative' : 'neutral'
      value.textContent = `${prefix}${metric.value}`
      value.classList.add(className)
    } else {
      value.textContent = metric.value
    }
    
    item.appendChild(label)
    item.appendChild(value)
    metricsList.appendChild(item)
  })
  
  card.appendChild(title)
  card.appendChild(metricsList)
  
  return card
}
