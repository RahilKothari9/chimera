import { describe, it, expect, beforeEach } from 'vitest'
import { createComparisonUI } from './comparisonUI'
import type { ChangelogEntry } from './changelogParser'

describe('createComparisonUI', () => {
  let mockEntries: ChangelogEntry[]

  beforeEach(() => {
    mockEntries = [
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
  })

  it('should create comparison UI container', () => {
    const ui = createComparisonUI(mockEntries)
    
    expect(ui).toBeInstanceOf(HTMLElement)
    expect(ui.className).toBe('comparison-container')
  })

  it('should have a section title', () => {
    const ui = createComparisonUI(mockEntries)
    const title = ui.querySelector('.section-title')
    
    expect(title).not.toBeNull()
    expect(title?.textContent).toContain('Evolution Comparison')
  })

  it('should have a description', () => {
    const ui = createComparisonUI(mockEntries)
    const description = ui.querySelector('.comparison-description')
    
    expect(description).not.toBeNull()
    expect(description?.textContent).toContain('Compare different time periods')
  })

  it('should have mode selector', () => {
    const ui = createComparisonUI(mockEntries)
    const modeSelector = ui.querySelector('.comparison-mode-selector')
    
    expect(modeSelector).not.toBeNull()
  })

  it('should have mode select with period and entry options', () => {
    const ui = createComparisonUI(mockEntries)
    const select = ui.querySelector('.comparison-mode-select') as HTMLSelectElement
    
    expect(select).not.toBeNull()
    expect(select.options.length).toBe(2)
    expect(select.options[0].value).toBe('period')
    expect(select.options[1].value).toBe('entry')
  })

  it('should default to period comparison', () => {
    const ui = createComparisonUI(mockEntries)
    const periodComparison = ui.querySelector('.period-comparison')
    
    expect(periodComparison).not.toBeNull()
  })

  it('should switch to entry comparison when mode changes', () => {
    const ui = createComparisonUI(mockEntries)
    const select = ui.querySelector('.comparison-mode-select') as HTMLSelectElement
    
    // Change to entry mode
    select.value = 'entry'
    select.dispatchEvent(new Event('change'))
    
    const entryComparison = ui.querySelector('.entry-comparison')
    expect(entryComparison).not.toBeNull()
  })

  it('should have comparison content area', () => {
    const ui = createComparisonUI(mockEntries)
    const content = ui.querySelector('.comparison-content')
    
    expect(content).not.toBeNull()
  })
})

describe('Period Comparison UI', () => {
  let mockEntries: ChangelogEntry[]

  beforeEach(() => {
    mockEntries = [
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
      }
    ]
  })

  it('should show period selectors', () => {
    const ui = createComparisonUI(mockEntries)
    const selectors = ui.querySelectorAll('.period-selector')
    
    expect(selectors.length).toBe(2)
  })

  it('should have period select dropdowns', () => {
    const ui = createComparisonUI(mockEntries)
    const selects = ui.querySelectorAll('.period-select')
    
    expect(selects.length).toBe(2)
  })

  it('should have compare button', () => {
    const ui = createComparisonUI(mockEntries)
    const button = ui.querySelector('.comparison-button')
    
    expect(button).not.toBeNull()
    expect(button?.textContent).toBe('Compare Periods')
  })

  it('should have results container', () => {
    const ui = createComparisonUI(mockEntries)
    const results = ui.querySelector('.comparison-results')
    
    expect(results).not.toBeNull()
  })

  it('should show results after clicking compare button', () => {
    const ui = createComparisonUI(mockEntries)
    const button = ui.querySelector('.comparison-button') as HTMLButtonElement
    const results = ui.querySelector('.comparison-results') as HTMLElement
    
    button.click()
    
    expect(results.children.length).toBeGreaterThan(0)
  })

  it('should display period metrics after comparison', () => {
    const ui = createComparisonUI(mockEntries)
    const button = ui.querySelector('.comparison-button') as HTMLButtonElement
    
    button.click()
    
    const periodCards = ui.querySelectorAll('.period-card')
    expect(periodCards.length).toBe(2)
  })

  it('should display differences card after comparison', () => {
    const ui = createComparisonUI(mockEntries)
    const button = ui.querySelector('.comparison-button') as HTMLButtonElement
    
    button.click()
    
    const differencesCard = ui.querySelector('.differences-card')
    expect(differencesCard).not.toBeNull()
  })

  it('should display category comparison after comparison', () => {
    const ui = createComparisonUI(mockEntries)
    const button = ui.querySelector('.comparison-button') as HTMLButtonElement
    
    button.click()
    
    const categoryComparison = ui.querySelector('.category-comparison')
    expect(categoryComparison).not.toBeNull()
  })

  it('should show metric values in period cards', () => {
    const ui = createComparisonUI(mockEntries)
    const button = ui.querySelector('.comparison-button') as HTMLButtonElement
    
    button.click()
    
    const metricValues = ui.querySelectorAll('.metric-value')
    expect(metricValues.length).toBeGreaterThan(0)
  })

  it('should show metric labels in period cards', () => {
    const ui = createComparisonUI(mockEntries)
    const button = ui.querySelector('.comparison-button') as HTMLButtonElement
    
    button.click()
    
    const metricLabels = ui.querySelectorAll('.metric-label')
    expect(metricLabels.length).toBeGreaterThan(0)
  })

  it('should show positive/negative classes for differences', () => {
    const ui = createComparisonUI(mockEntries)
    const button = ui.querySelector('.comparison-button') as HTMLButtonElement
    
    button.click()
    
    const differencesCard = ui.querySelector('.differences-card')
    const values = differencesCard?.querySelectorAll('.metric-value')
    
    expect(values).not.toBeNull()
    expect(values!.length).toBeGreaterThan(0)
  })
})

describe('Entry Comparison UI', () => {
  let mockEntries: ChangelogEntry[]

  beforeEach(() => {
    mockEntries = [
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
      }
    ]
  })

  it('should show entry selectors when in entry mode', () => {
    const ui = createComparisonUI(mockEntries)
    const select = ui.querySelector('.comparison-mode-select') as HTMLSelectElement
    
    select.value = 'entry'
    select.dispatchEvent(new Event('change'))
    
    const selectors = ui.querySelectorAll('.entry-selector')
    expect(selectors.length).toBe(2)
  })

  it('should have entry select dropdowns', () => {
    const ui = createComparisonUI(mockEntries)
    const select = ui.querySelector('.comparison-mode-select') as HTMLSelectElement
    
    select.value = 'entry'
    select.dispatchEvent(new Event('change'))
    
    const selects = ui.querySelectorAll('.entry-select')
    expect(selects.length).toBe(2)
  })

  it('should populate entry select with entries', () => {
    const ui = createComparisonUI(mockEntries)
    const modeSelect = ui.querySelector('.comparison-mode-select') as HTMLSelectElement
    
    modeSelect.value = 'entry'
    modeSelect.dispatchEvent(new Event('change'))
    
    const entrySelect = ui.querySelector('.entry-select') as HTMLSelectElement
    expect(entrySelect.options.length).toBe(mockEntries.length)
  })

  it('should have compare button for entries', () => {
    const ui = createComparisonUI(mockEntries)
    const modeSelect = ui.querySelector('.comparison-mode-select') as HTMLSelectElement
    
    modeSelect.value = 'entry'
    modeSelect.dispatchEvent(new Event('change'))
    
    const button = ui.querySelector('.comparison-button')
    expect(button).not.toBeNull()
    expect(button?.textContent).toBe('Compare Entries')
  })

  it('should show results after clicking compare entries button', () => {
    const ui = createComparisonUI(mockEntries)
    const modeSelect = ui.querySelector('.comparison-mode-select') as HTMLSelectElement
    
    modeSelect.value = 'entry'
    modeSelect.dispatchEvent(new Event('change'))
    
    const button = ui.querySelector('.comparison-button') as HTMLButtonElement
    const results = ui.querySelector('.comparison-results') as HTMLElement
    
    button.click()
    
    expect(results.children.length).toBeGreaterThan(0)
  })

  it('should display entry cards after comparison', () => {
    const ui = createComparisonUI(mockEntries)
    const modeSelect = ui.querySelector('.comparison-mode-select') as HTMLSelectElement
    
    modeSelect.value = 'entry'
    modeSelect.dispatchEvent(new Event('change'))
    
    const button = ui.querySelector('.comparison-button') as HTMLButtonElement
    button.click()
    
    const entryCards = ui.querySelectorAll('.entry-card')
    expect(entryCards.length).toBe(2)
  })

  it('should display entry differences card after comparison', () => {
    const ui = createComparisonUI(mockEntries)
    const modeSelect = ui.querySelector('.comparison-mode-select') as HTMLSelectElement
    
    modeSelect.value = 'entry'
    modeSelect.dispatchEvent(new Event('change'))
    
    const button = ui.querySelector('.comparison-button') as HTMLButtonElement
    button.click()
    
    const differencesCard = ui.querySelector('.entry-differences-card')
    expect(differencesCard).not.toBeNull()
  })

  it('should show entry details in cards', () => {
    const ui = createComparisonUI(mockEntries)
    const modeSelect = ui.querySelector('.comparison-mode-select') as HTMLSelectElement
    
    modeSelect.value = 'entry'
    modeSelect.dispatchEvent(new Event('change'))
    
    const button = ui.querySelector('.comparison-button') as HTMLButtonElement
    button.click()
    
    const entryDetails = ui.querySelectorAll('.entry-detail')
    expect(entryDetails.length).toBeGreaterThan(0)
  })

  it('should show entry option labels with day and feature', () => {
    const ui = createComparisonUI(mockEntries)
    const modeSelect = ui.querySelector('.comparison-mode-select') as HTMLSelectElement
    
    modeSelect.value = 'entry'
    modeSelect.dispatchEvent(new Event('change'))
    
    const entrySelect = ui.querySelector('.entry-select') as HTMLSelectElement
    const firstOption = entrySelect.options[0]
    
    expect(firstOption.textContent).toContain('Day')
    expect(firstOption.textContent).toContain('Feature')
  })
})
