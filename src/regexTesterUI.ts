/**
 * Regex Tester UI
 * Interactive UI for testing regular expressions
 */

import {
  testRegex,
  getHighlightSegments,
  getMatchSummary,
  buildFlagsString,
  REGEX_EXAMPLES,
  type RegexFlags,
  type RegexTestResult,
} from './regexTester'
import { trackActivity } from './activityFeed'
import { notificationManager } from './notificationSystem'

/**
 * Creates and mounts the Regex Tester UI into the given container element
 */
export function setupRegexTester(container: HTMLElement): void {
  container.innerHTML = ''

  const section = document.createElement('div')
  section.className = 'regex-tester-section'
  section.setAttribute('aria-label', 'Regex Tester')

  // Header
  const header = document.createElement('div')
  header.className = 'regex-tester-header'

  const title = document.createElement('h2')
  title.className = 'section-title'
  title.textContent = '🔍 Regex Tester'
  header.appendChild(title)

  const subtitle = document.createElement('p')
  subtitle.className = 'regex-tester-subtitle'
  subtitle.textContent = 'Test and debug regular expressions interactively with real-time highlighting'
  header.appendChild(subtitle)

  section.appendChild(header)

  // Main layout
  const layout = document.createElement('div')
  layout.className = 'regex-tester-layout'

  // ── Left panel: inputs ──────────────────────────────────────
  const inputPanel = document.createElement('div')
  inputPanel.className = 'regex-tester-panel'

  // Pattern input
  const patternGroup = document.createElement('div')
  patternGroup.className = 'regex-input-group'

  const patternLabel = document.createElement('label')
  patternLabel.className = 'regex-label'
  patternLabel.htmlFor = 'regex-pattern'
  patternLabel.textContent = 'Pattern'
  patternGroup.appendChild(patternLabel)

  const patternRow = document.createElement('div')
  patternRow.className = 'regex-pattern-row'

  const patternSlash1 = document.createElement('span')
  patternSlash1.className = 'regex-delimiter'
  patternSlash1.textContent = '/'
  patternRow.appendChild(patternSlash1)

  const patternInput = document.createElement('input')
  patternInput.type = 'text'
  patternInput.id = 'regex-pattern'
  patternInput.className = 'regex-pattern-input'
  patternInput.placeholder = 'Enter regex pattern…'
  patternInput.setAttribute('aria-label', 'Regular expression pattern')
  patternInput.spellcheck = false
  patternRow.appendChild(patternInput)

  const patternSlash2 = document.createElement('span')
  patternSlash2.className = 'regex-delimiter'
  patternSlash2.textContent = '/'
  patternRow.appendChild(patternSlash2)

  const flagsDisplay = document.createElement('span')
  flagsDisplay.className = 'regex-flags-display'
  flagsDisplay.id = 'regex-flags-display'
  flagsDisplay.textContent = 'g'
  patternRow.appendChild(flagsDisplay)

  patternGroup.appendChild(patternRow)

  const patternError = document.createElement('div')
  patternError.className = 'regex-pattern-error'
  patternError.id = 'regex-pattern-error'
  patternError.setAttribute('role', 'alert')
  patternError.setAttribute('aria-live', 'polite')
  patternGroup.appendChild(patternError)

  inputPanel.appendChild(patternGroup)

  // Flags
  const flagsGroup = document.createElement('div')
  flagsGroup.className = 'regex-flags-group'

  const flagsLabel = document.createElement('div')
  flagsLabel.className = 'regex-label'
  flagsLabel.textContent = 'Flags'
  flagsGroup.appendChild(flagsLabel)

  const flagsContainer = document.createElement('div')
  flagsContainer.className = 'regex-flags-container'

  const flagDefs: { key: keyof RegexFlags; label: string; title: string }[] = [
    { key: 'global', label: 'g – global', title: 'Find all matches (not just the first)' },
    { key: 'caseInsensitive', label: 'i – ignore case', title: 'Case-insensitive matching' },
    { key: 'multiline', label: 'm – multiline', title: '^ and $ match line boundaries' },
    { key: 'dotAll', label: 's – dot all', title: '. matches newline characters' },
  ]

  const flags: RegexFlags = {
    global: true,
    caseInsensitive: false,
    multiline: false,
    dotAll: false,
  }

  flagDefs.forEach(def => {
    const flagLabel = document.createElement('label')
    flagLabel.className = 'regex-flag-label'
    flagLabel.title = def.title

    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.className = 'regex-flag-checkbox'
    checkbox.dataset.flag = def.key
    checkbox.checked = flags[def.key]
    checkbox.setAttribute('aria-label', def.title)

    flagLabel.appendChild(checkbox)
    flagLabel.appendChild(document.createTextNode(` ${def.label}`))
    flagsContainer.appendChild(flagLabel)
  })

  flagsGroup.appendChild(flagsContainer)
  inputPanel.appendChild(flagsGroup)

  // Test text
  const testGroup = document.createElement('div')
  testGroup.className = 'regex-input-group'

  const testLabel = document.createElement('label')
  testLabel.className = 'regex-label'
  testLabel.htmlFor = 'regex-test-text'
  testLabel.textContent = 'Test String'
  testGroup.appendChild(testLabel)

  const testTextarea = document.createElement('textarea')
  testTextarea.id = 'regex-test-text'
  testTextarea.className = 'regex-test-textarea'
  testTextarea.placeholder = 'Enter text to test against your pattern…'
  testTextarea.rows = 5
  testTextarea.setAttribute('aria-label', 'Test string')
  testTextarea.spellcheck = false
  testGroup.appendChild(testTextarea)

  inputPanel.appendChild(testGroup)

  // Examples
  const examplesGroup = document.createElement('div')
  examplesGroup.className = 'regex-input-group'

  const examplesLabel = document.createElement('div')
  examplesLabel.className = 'regex-label'
  examplesLabel.textContent = 'Load Example'
  examplesGroup.appendChild(examplesLabel)

  const examplesContainer = document.createElement('div')
  examplesContainer.className = 'regex-examples-container'

  REGEX_EXAMPLES.forEach(example => {
    const btn = document.createElement('button')
    btn.className = 'regex-example-btn'
    btn.textContent = example.name
    btn.title = example.description
    btn.setAttribute('aria-label', `Load ${example.name} example`)
    btn.addEventListener('click', () => {
      patternInput.value = example.pattern
      testTextarea.value = example.testText
      const checkboxes = flagsContainer.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')
      checkboxes.forEach(cb => {
        const key = cb.dataset.flag as keyof RegexFlags
        if (key) {
          cb.checked = example.flags[key]
          flags[key] = example.flags[key]
        }
      })
      runTest()
      trackActivity('regex_example', 'Loaded regex example', `Loaded "${example.name}" example`, { example: example.name })
    })
    examplesContainer.appendChild(btn)
  })

  examplesGroup.appendChild(examplesContainer)
  inputPanel.appendChild(examplesGroup)

  layout.appendChild(inputPanel)

  // ── Right panel: results ────────────────────────────────────
  const resultPanel = document.createElement('div')
  resultPanel.className = 'regex-tester-panel'

  // Summary badge
  const summaryDiv = document.createElement('div')
  summaryDiv.className = 'regex-summary'
  summaryDiv.id = 'regex-summary'
  summaryDiv.setAttribute('aria-live', 'polite')
  summaryDiv.textContent = 'Enter a pattern to start matching'
  resultPanel.appendChild(summaryDiv)

  // Highlighted output
  const highlightGroup = document.createElement('div')
  highlightGroup.className = 'regex-input-group'

  const highlightLabel = document.createElement('div')
  highlightLabel.className = 'regex-label'
  highlightLabel.textContent = 'Match Highlighting'
  highlightGroup.appendChild(highlightLabel)

  const highlightOutput = document.createElement('div')
  highlightOutput.id = 'regex-highlight-output'
  highlightOutput.className = 'regex-highlight-output'
  highlightOutput.setAttribute('aria-label', 'Match highlighting output')
  highlightOutput.setAttribute('aria-live', 'polite')
  highlightGroup.appendChild(highlightOutput)

  resultPanel.appendChild(highlightGroup)

  // Match details list
  const detailsGroup = document.createElement('div')
  detailsGroup.className = 'regex-input-group'

  const detailsLabel = document.createElement('div')
  detailsLabel.className = 'regex-label'
  detailsLabel.textContent = 'Match Details'
  detailsGroup.appendChild(detailsLabel)

  const detailsList = document.createElement('div')
  detailsList.id = 'regex-details-list'
  detailsList.className = 'regex-details-list'
  detailsList.setAttribute('aria-label', 'Match details')
  detailsList.setAttribute('aria-live', 'polite')
  detailsGroup.appendChild(detailsList)

  resultPanel.appendChild(detailsGroup)

  layout.appendChild(resultPanel)
  section.appendChild(layout)
  container.appendChild(section)

  // ── Reactive update logic ───────────────────────────────────
  function runTest(): void {
    const pattern = patternInput.value
    const text = testTextarea.value

    // Sync flags from checkboxes
    const checkboxes = flagsContainer.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')
    checkboxes.forEach(cb => {
      const key = cb.dataset.flag as keyof RegexFlags
      if (key) flags[key] = cb.checked
    })

    // Update flags display
    flagsDisplay.textContent = buildFlagsString(flags)

    const result = testRegex(pattern, flags, text)

    updatePatternError(patternError, result)
    updateSummary(summaryDiv, result)
    updateHighlightOutput(highlightOutput, text, result)
    updateDetailsList(detailsList, result)
  }

  // Event listeners
  patternInput.addEventListener('input', runTest)
  testTextarea.addEventListener('input', runTest)

  const checkboxes = flagsContainer.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')
  checkboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      runTest()
      trackActivity('regex_flags', 'Changed regex flags', `Toggled flag: ${cb.dataset.flag}`, { flag: cb.dataset.flag })
    })
  })

  // Track when user has a successful test
  patternInput.addEventListener('blur', () => {
    if (patternInput.value) {
      const result = testRegex(patternInput.value, flags, testTextarea.value)
      if (result.isValid && result.matchCount > 0) {
        trackActivity('regex_test', 'Tested regex pattern', `Pattern matched ${result.matchCount} time(s)`, {
          pattern: patternInput.value,
          matchCount: result.matchCount,
        })
      }
    }
  })

  // Copy pattern button handler
  section.addEventListener('click', async (e: Event) => {
    const target = e.target as HTMLElement
    if (target.classList.contains('regex-copy-btn')) {
      const text = target.dataset.copy ?? ''
      try {
        await navigator.clipboard.writeText(text)
        notificationManager.success('Copied to clipboard')
      } catch {
        notificationManager.error('Failed to copy')
      }
    }
  })

  // Initial render
  runTest()
}

// ── Private helpers ─────────────────────────────────────────────

function updatePatternError(el: HTMLElement, result: RegexTestResult): void {
  if (!result.isValid && result.error) {
    el.textContent = `⚠ ${result.error}`
    el.style.display = 'block'
  } else {
    el.textContent = ''
    el.style.display = 'none'
  }
}

function updateSummary(el: HTMLElement, result: RegexTestResult): void {
  el.textContent = getMatchSummary(result)
  el.className = 'regex-summary'
  if (!result.isValid) {
    el.classList.add('regex-summary--error')
  } else if (result.matchCount > 0) {
    el.classList.add('regex-summary--success')
  }
}

function updateHighlightOutput(el: HTMLElement, text: string, result: RegexTestResult): void {
  el.innerHTML = ''

  if (!text) {
    const placeholder = document.createElement('span')
    placeholder.className = 'regex-highlight-placeholder'
    placeholder.textContent = 'Your test string with matches highlighted will appear here…'
    el.appendChild(placeholder)
    return
  }

  const segments = getHighlightSegments(text, result)

  if (segments.length === 0) {
    const span = document.createElement('span')
    span.textContent = text
    el.appendChild(span)
    return
  }

  segments.forEach(seg => {
    const span = document.createElement('span')
    span.textContent = seg.text
    if (seg.isMatch) {
      span.className = 'regex-match-highlight'
      if (seg.matchIndex !== undefined) {
        span.dataset.matchIndex = String(seg.matchIndex)
      }
    }
    el.appendChild(span)
  })
}

function updateDetailsList(el: HTMLElement, result: RegexTestResult): void {
  el.innerHTML = ''

  if (!result.isValid || result.matchCount === 0) {
    const empty = document.createElement('div')
    empty.className = 'regex-details-empty'
    empty.textContent = result.isValid ? 'No matches to display' : 'Fix the pattern to see match details'
    el.appendChild(empty)
    return
  }

  result.matches.forEach((match, idx) => {
    const card = document.createElement('div')
    card.className = 'regex-match-card'

    const cardHeader = document.createElement('div')
    cardHeader.className = 'regex-match-card-header'

    const matchTitle = document.createElement('span')
    matchTitle.className = 'regex-match-title'
    matchTitle.textContent = `Match ${idx + 1}`

    const copyBtn = document.createElement('button')
    copyBtn.className = 'regex-copy-btn'
    copyBtn.dataset.copy = match.fullMatch
    copyBtn.textContent = '📋 Copy'
    copyBtn.setAttribute('aria-label', `Copy match ${idx + 1}`)

    cardHeader.appendChild(matchTitle)
    cardHeader.appendChild(copyBtn)
    card.appendChild(cardHeader)

    const rows: { label: string; value: string }[] = [
      { label: 'Value', value: match.fullMatch || '(empty string)' },
      { label: 'Index', value: String(match.index) },
      { label: 'Length', value: String(match.fullMatch.length) },
    ]

    // Add capture groups
    if (match.captures.length > 0) {
      match.captures.forEach((cap, i) => {
        rows.push({ label: `Group ${i + 1}`, value: cap !== undefined ? cap : 'undefined' })
      })
    }

    // Add named groups
    const namedGroups = Object.entries(match.groups)
    if (namedGroups.length > 0) {
      namedGroups.forEach(([name, value]) => {
        rows.push({ label: `Group "${name}"`, value: value !== undefined ? value : 'undefined' })
      })
    }

    const table = document.createElement('table')
    table.className = 'regex-match-table'

    rows.forEach(row => {
      const tr = document.createElement('tr')

      const th = document.createElement('th')
      th.textContent = row.label
      tr.appendChild(th)

      const td = document.createElement('td')
      const code = document.createElement('code')
      code.textContent = row.value
      td.appendChild(code)
      tr.appendChild(td)

      table.appendChild(tr)
    })

    card.appendChild(table)
    el.appendChild(card)
  })
}
