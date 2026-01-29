import { describe, it, expect } from 'vitest'
import {
  categorizeEntry,
  estimateTestCount,
  estimateFileCount,
  comparePeriods,
  compareEntries,
  getPresetPeriods,
  type ComparisonPeriod
} from './comparisonEngine'
import type { ChangelogEntry } from './changelogParser'

describe('categorizeEntry', () => {
  it('should categorize testing entries', () => {
    const entry: ChangelogEntry = {
      day: '1',
      date: '2026-01-20',
      feature: 'Test Suite',
      description: 'Added comprehensive testing framework',
      filesModified: 'test.ts'
    }
    expect(categorizeEntry(entry)).toBe('Testing')
  })

  it('should categorize UI/UX entries', () => {
    const entry: ChangelogEntry = {
      day: '2',
      date: '2026-01-21',
      feature: 'Theme System',
      description: 'Added dark mode UI',
      filesModified: 'theme.ts'
    }
    expect(categorizeEntry(entry)).toBe('UI/UX')
  })

  it('should categorize visualization entries', () => {
    const entry: ChangelogEntry = {
      day: '3',
      date: '2026-01-22',
      feature: 'Impact Graph',
      description: 'Added visual chart for tracking',
      filesModified: 'graph.ts'
    }
    expect(categorizeEntry(entry)).toBe('Visualization')
  })

  it('should default to Features for unclassified entries', () => {
    const entry: ChangelogEntry = {
      day: '4',
      date: '2026-01-23',
      feature: 'Random Feature',
      description: 'Something new',
      filesModified: 'feature.ts'
    }
    expect(categorizeEntry(entry)).toBe('Features')
  })
})

describe('estimateTestCount', () => {
  it('should extract explicit test count from description', () => {
    const entry: ChangelogEntry = {
      day: '1',
      date: '2026-01-20',
      feature: 'Feature',
      description: 'Added feature with 42 tests',
      filesModified: 'file.ts'
    }
    expect(estimateTestCount(entry)).toBe(42)
  })

  it('should extract test count from coverage mention', () => {
    const entry: ChangelogEntry = {
      day: '1',
      date: '2026-01-20',
      feature: 'Feature',
      description: 'Includes test coverage with 25 tests',
      filesModified: 'file.ts'
    }
    expect(estimateTestCount(entry)).toBe(25)
  })

  it('should estimate based on category for Testing', () => {
    const entry: ChangelogEntry = {
      day: '1',
      date: '2026-01-20',
      feature: 'Testing Framework',
      description: 'Added comprehensive testing',
      filesModified: 'test.ts'
    }
    expect(estimateTestCount(entry)).toBe(30)
  })

  it('should return default estimate for generic features', () => {
    const entry: ChangelogEntry = {
      day: '1',
      date: '2026-01-20',
      feature: 'Random Feature',
      description: 'Some feature',
      filesModified: 'file.ts'
    }
    expect(estimateTestCount(entry)).toBe(15)
  })
})

describe('estimateFileCount', () => {
  it('should count files from filesModified string', () => {
    const entry: ChangelogEntry = {
      day: '1',
      date: '2026-01-20',
      feature: 'Feature',
      description: 'Feature desc',
      filesModified: 'file1.ts, file2.ts, file3.ts'
    }
    expect(estimateFileCount(entry)).toBe(3)
  })

  it('should return 1 for single file', () => {
    const entry: ChangelogEntry = {
      day: '1',
      date: '2026-01-20',
      feature: 'Feature',
      description: 'Feature desc',
      filesModified: 'file.ts'
    }
    expect(estimateFileCount(entry)).toBe(1)
  })

  it('should handle files with spaces', () => {
    const entry: ChangelogEntry = {
      day: '1',
      date: '2026-01-20',
      feature: 'Feature',
      description: 'Feature desc',
      filesModified: 'file1.ts, file2.ts'
    }
    expect(estimateFileCount(entry)).toBe(2)
  })
})

describe('comparePeriods', () => {
  const mockEntries: ChangelogEntry[] = [
    {
      day: '1',
      date: '2026-01-20',
      feature: 'Feature 1',
      description: 'Testing feature with 20 tests',
      filesModified: 'file1.ts, file2.ts'
    },
    {
      day: '2',
      date: '2026-01-22',
      feature: 'Feature 2',
      description: 'UI feature with 15 tests',
      filesModified: 'file3.ts'
    },
    {
      day: '3',
      date: '2026-01-25',
      feature: 'Feature 3',
      description: 'Visualization with 25 tests',
      filesModified: 'file4.ts, file5.ts, file6.ts'
    }
  ]

  it('should compare two periods correctly', () => {
    const period1: ComparisonPeriod = {
      label: 'Period 1',
      startDate: new Date('2026-01-19'),
      endDate: new Date('2026-01-21')
    }
    const period2: ComparisonPeriod = {
      label: 'Period 2',
      startDate: new Date('2026-01-23'),
      endDate: new Date('2026-01-26')
    }

    const result = comparePeriods(mockEntries, period1, period2)

    expect(result.period1.entryCount).toBe(1)
    expect(result.period2.entryCount).toBe(1)
    expect(result.differences.entryCountDiff).toBe(0)
  })

  it('should calculate metrics for period with multiple entries', () => {
    const period1: ComparisonPeriod = {
      label: 'All',
      startDate: new Date('2026-01-19'),
      endDate: new Date('2026-01-26')
    }
    const period2: ComparisonPeriod = {
      label: 'None',
      startDate: new Date('2026-01-27'),
      endDate: new Date('2026-01-28')
    }

    const result = comparePeriods(mockEntries, period1, period2)

    expect(result.period1.entryCount).toBe(3)
    expect(result.period1.totalTests).toBeGreaterThan(0)
    expect(result.period1.totalFiles).toBeGreaterThan(0)
    expect(result.period2.entryCount).toBe(0)
  })

  it('should calculate category changes', () => {
    const period1: ComparisonPeriod = {
      label: 'Period 1',
      startDate: new Date('2026-01-19'),
      endDate: new Date('2026-01-21')
    }
    const period2: ComparisonPeriod = {
      label: 'Period 2',
      startDate: new Date('2026-01-24'),
      endDate: new Date('2026-01-26')
    }

    const result = comparePeriods(mockEntries, period1, period2)

    expect(result.period1.categories).toBeDefined()
    expect(result.period2.categories).toBeDefined()
    expect(result.differences.categoryChanges).toBeDefined()
  })

  it('should calculate velocity change', () => {
    const period1: ComparisonPeriod = {
      label: 'Period 1',
      startDate: new Date('2026-01-19'),
      endDate: new Date('2026-01-21')
    }
    const period2: ComparisonPeriod = {
      label: 'Period 2',
      startDate: new Date('2026-01-22'),
      endDate: new Date('2026-01-26')
    }

    const result = comparePeriods(mockEntries, period1, period2)

    expect(typeof result.differences.velocityChange).toBe('number')
  })
})

describe('compareEntries', () => {
  it('should compare two entries', () => {
    const entry1: ChangelogEntry = {
      day: '1',
      date: '2026-01-20',
      feature: 'Feature 1',
      description: 'Testing with 20 tests',
      filesModified: 'file1.ts, file2.ts'
    }
    const entry2: ChangelogEntry = {
      day: '2',
      date: '2026-01-21',
      feature: 'Feature 2',
      description: 'UI with 15 tests',
      filesModified: 'file3.ts'
    }

    const result = compareEntries(entry1, entry2)

    expect(result.entry1).toBe(entry1)
    expect(result.entry2).toBe(entry2)
    expect(result.differences.testsDiff).toBe(-5)
    expect(result.differences.filesDiff).toBe(-1)
  })

  it('should detect category differences', () => {
    const entry1: ChangelogEntry = {
      day: '1',
      date: '2026-01-20',
      feature: 'Testing Framework',
      description: 'Testing',
      filesModified: 'file1.ts'
    }
    const entry2: ChangelogEntry = {
      day: '2',
      date: '2026-01-21',
      feature: 'UI Feature',
      description: 'UI improvement',
      filesModified: 'file2.ts'
    }

    const result = compareEntries(entry1, entry2)

    expect(result.differences.categoryDiff).toBe(true)
  })

  it('should detect same category', () => {
    const entry1: ChangelogEntry = {
      day: '1',
      date: '2026-01-20',
      feature: 'Testing Framework',
      description: 'Testing',
      filesModified: 'file1.ts'
    }
    const entry2: ChangelogEntry = {
      day: '2',
      date: '2026-01-21',
      feature: 'Test Suite',
      description: 'More testing',
      filesModified: 'file2.ts'
    }

    const result = compareEntries(entry1, entry2)

    expect(result.differences.categoryDiff).toBe(false)
  })

  it('should calculate description length difference', () => {
    const entry1: ChangelogEntry = {
      day: '1',
      date: '2026-01-20',
      feature: 'Feature',
      description: 'Short',
      filesModified: 'file1.ts'
    }
    const entry2: ChangelogEntry = {
      day: '2',
      date: '2026-01-21',
      feature: 'Feature',
      description: 'Much longer description',
      filesModified: 'file2.ts'
    }

    const result = compareEntries(entry1, entry2)

    expect(result.differences.descriptionLengthDiff).toBeGreaterThan(0)
  })
})

describe('getPresetPeriods', () => {
  const mockEntries: ChangelogEntry[] = [
    {
      day: '1',
      date: '2026-01-10',
      feature: 'Feature 1',
      description: 'Desc',
      filesModified: 'file.ts'
    },
    {
      day: '2',
      date: '2026-01-15',
      feature: 'Feature 2',
      description: 'Desc',
      filesModified: 'file.ts'
    }
  ]

  it('should return empty array for no entries', () => {
    const periods = getPresetPeriods([])
    expect(periods).toEqual([])
  })

  it('should generate preset periods', () => {
    const periods = getPresetPeriods(mockEntries)
    
    expect(periods.length).toBe(4)
    expect(periods[0].label).toBe('Last 7 Days')
    expect(periods[1].label).toBe('Previous 7 Days')
    expect(periods[2].label).toBe('Week 1')
    expect(periods[3].label).toBe('Week 2')
  })

  it('should create valid date ranges', () => {
    const periods = getPresetPeriods(mockEntries)
    
    periods.forEach(period => {
      expect(period.startDate).toBeInstanceOf(Date)
      expect(period.endDate).toBeInstanceOf(Date)
      expect(period.startDate.getTime()).toBeLessThanOrEqual(period.endDate.getTime())
    })
  })
})
