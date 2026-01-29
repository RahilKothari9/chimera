import type { ChangelogEntry } from './changelogParser'

export interface ComparisonPeriod {
  label: string
  startDate: Date
  endDate: Date
}

export interface ComparisonMetrics {
  period1: PeriodMetrics
  period2: PeriodMetrics
  differences: MetricDifferences
}

export interface PeriodMetrics {
  label: string
  entryCount: number
  totalTests: number
  totalFiles: number
  avgTestsPerEntry: number
  avgFilesPerEntry: number
  categories: Record<string, number>
  entries: ChangelogEntry[]
}

export interface MetricDifferences {
  entryCountDiff: number
  totalTestsDiff: number
  totalFilesDiff: number
  avgTestsPerEntryDiff: number
  avgFilesPerEntryDiff: number
  categoryChanges: Record<string, number>
  velocityChange: number // percentage
}

export interface EntryComparison {
  entry1: ChangelogEntry
  entry2: ChangelogEntry
  differences: {
    testsDiff: number
    filesDiff: number
    categoryDiff: boolean
    descriptionLengthDiff: number
  }
}

/**
 * Categorizes an evolution entry based on keywords in feature and description
 */
export function categorizeEntry(entry: ChangelogEntry): string {
  const text = `${entry.feature} ${entry.description}`.toLowerCase()
  
  if (text.includes('test') || text.includes('testing')) return 'Testing'
  if (text.includes('ui') || text.includes('ux') || text.includes('theme') || text.includes('design')) return 'UI/UX'
  if (text.includes('visual') || text.includes('graph') || text.includes('chart')) return 'Visualization'
  if (text.includes('search') || text.includes('filter')) return 'Search & Filter'
  if (text.includes('export') || text.includes('data')) return 'Data & Export'
  if (text.includes('predict') || text.includes('ai') || text.includes('intelligence')) return 'AI & Intelligence'
  if (text.includes('achievement') || text.includes('gamif')) return 'Gamification'
  if (text.includes('metric') || text.includes('statistic') || text.includes('analytic')) return 'Analytics'
  if (text.includes('build') || text.includes('deploy')) return 'Build/Deploy'
  if (text.includes('refactor')) return 'Refactoring'
  if (text.includes('document')) return 'Documentation'
  
  return 'Features'
}

/**
 * Estimates test count from entry description
 */
export function estimateTestCount(entry: ChangelogEntry): number {
  const desc = entry.description.toLowerCase()
  
  // Look for explicit test count mentions
  const testMatch = desc.match(/(\d+)\s+(?:new\s+)?tests?/i)
  if (testMatch) {
    return parseInt(testMatch[1], 10)
  }
  
  // Look for test coverage mentions
  const coverageMatch = desc.match(/test coverage.*?(\d+)\s+tests/i)
  if (coverageMatch) {
    return parseInt(coverageMatch[1], 10)
  }
  
  // Default estimate based on category
  const category = categorizeEntry(entry)
  if (category === 'Testing') return 30
  if (category === 'Visualization' || category === 'Analytics') return 25
  if (category === 'UI/UX') return 20
  
  return 15 // Default
}

/**
 * Estimates file count from entry files modified
 */
export function estimateFileCount(entry: ChangelogEntry): number {
  const files = entry.filesModified
  
  // Count commas and add 1
  const fileCount = (files.match(/,/g) || []).length + 1
  
  return fileCount
}

/**
 * Compare two time periods
 */
export function comparePeriods(
  entries: ChangelogEntry[],
  period1: ComparisonPeriod,
  period2: ComparisonPeriod
): ComparisonMetrics {
  const period1Entries = entries.filter(e => {
    const entryDate = new Date(e.date)
    return entryDate >= period1.startDate && entryDate <= period1.endDate
  })
  
  const period2Entries = entries.filter(e => {
    const entryDate = new Date(e.date)
    return entryDate >= period2.startDate && entryDate <= period2.endDate
  })
  
  const period1Metrics = calculatePeriodMetrics(period1.label, period1Entries)
  const period2Metrics = calculatePeriodMetrics(period2.label, period2Entries)
  
  const differences = calculateDifferences(period1Metrics, period2Metrics)
  
  return {
    period1: period1Metrics,
    period2: period2Metrics,
    differences
  }
}

/**
 * Calculate metrics for a time period
 */
function calculatePeriodMetrics(label: string, entries: ChangelogEntry[]): PeriodMetrics {
  const totalTests = entries.reduce((sum, e) => sum + estimateTestCount(e), 0)
  const totalFiles = entries.reduce((sum, e) => sum + estimateFileCount(e), 0)
  
  const categories: Record<string, number> = {}
  entries.forEach(entry => {
    const category = categorizeEntry(entry)
    categories[category] = (categories[category] || 0) + 1
  })
  
  return {
    label,
    entryCount: entries.length,
    totalTests,
    totalFiles,
    avgTestsPerEntry: entries.length > 0 ? totalTests / entries.length : 0,
    avgFilesPerEntry: entries.length > 0 ? totalFiles / entries.length : 0,
    categories,
    entries
  }
}

/**
 * Calculate differences between two periods
 */
function calculateDifferences(
  period1: PeriodMetrics,
  period2: PeriodMetrics
): MetricDifferences {
  const categoryChanges: Record<string, number> = {}
  
  // Combine all categories
  const allCategories = new Set([
    ...Object.keys(period1.categories),
    ...Object.keys(period2.categories)
  ])
  
  allCategories.forEach(category => {
    const count1 = period1.categories[category] || 0
    const count2 = period2.categories[category] || 0
    categoryChanges[category] = count2 - count1
  })
  
  // Calculate velocity change (entries per period as a percentage)
  const velocityChange = period1.entryCount > 0
    ? ((period2.entryCount - period1.entryCount) / period1.entryCount) * 100
    : 0
  
  return {
    entryCountDiff: period2.entryCount - period1.entryCount,
    totalTestsDiff: period2.totalTests - period1.totalTests,
    totalFilesDiff: period2.totalFiles - period1.totalFiles,
    avgTestsPerEntryDiff: period2.avgTestsPerEntry - period1.avgTestsPerEntry,
    avgFilesPerEntryDiff: period2.avgFilesPerEntry - period1.avgFilesPerEntry,
    categoryChanges,
    velocityChange
  }
}

/**
 * Compare two specific entries
 */
export function compareEntries(
  entry1: ChangelogEntry,
  entry2: ChangelogEntry
): EntryComparison {
  const tests1 = estimateTestCount(entry1)
  const tests2 = estimateTestCount(entry2)
  const files1 = estimateFileCount(entry1)
  const files2 = estimateFileCount(entry2)
  
  return {
    entry1,
    entry2,
    differences: {
      testsDiff: tests2 - tests1,
      filesDiff: files2 - files1,
      categoryDiff: categorizeEntry(entry1) !== categorizeEntry(entry2),
      descriptionLengthDiff: entry2.description.length - entry1.description.length
    }
  }
}

/**
 * Generate preset comparison periods
 */
export function getPresetPeriods(entries: ChangelogEntry[]): ComparisonPeriod[] {
  if (entries.length === 0) return []
  
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
  
  // Get oldest entry date
  const oldestEntry = entries[entries.length - 1]
  const oldestDate = new Date(oldestEntry.date)
  
  // Calculate week boundaries
  const week1Start = oldestDate
  const week1End = new Date(oldestDate.getTime() + 7 * 24 * 60 * 60 * 1000)
  const week2Start = new Date(week1End.getTime() + 1)
  const week2End = new Date(week2Start.getTime() + 7 * 24 * 60 * 60 * 1000)
  
  return [
    { label: 'Last 7 Days', startDate: sevenDaysAgo, endDate: now },
    { label: 'Previous 7 Days', startDate: fourteenDaysAgo, endDate: sevenDaysAgo },
    { label: 'Week 1', startDate: week1Start, endDate: week1End },
    { label: 'Week 2', startDate: week2Start, endDate: week2End }
  ]
}
