import {
  parseUnixTimestamp,
  parseDateString,
  toDatetimeLocalString,
  type TimestampFormats,
} from './timestampConverter'
import { trackActivity } from './activityFeed'

/**
 * Renders an interactive Unix Timestamp Converter section.
 *
 * Layout
 * ──────
 * ┌──────────────────────────────────────────────────────┐
 * │  🕐 Unix Timestamp Converter                         │
 * │  ── from Unix timestamp ──────────────────────────── │
 * │  [ numeric input          ]  [ Now ]  [ Convert ↓ ]  │
 * │  Unit auto-detected: seconds / milliseconds           │
 * │  ── from human-readable date ─────────────────────── │
 * │  [ datetime-local input   ]  [ Now ]  [ Convert ↑ ]  │
 * │  ── results ──────────────────────────────────────── │
 * │  Seconds   | 1767225600                               │
 * │  MS        | 1767225600000                            │
 * │  ISO 8601  | 2026-01-01T00:00:00.000Z   [ Copy ]     │
 * │  UTC       | Thu, 01 Jan 2026 00:00:00 GMT [ Copy ]   │
 * │  Locale    | …                            [ Copy ]    │
 * │  Relative  | just now                                 │
 * │  Weekday   | Thursday                                 │
 * │  UTC offset| +00:00                                   │
 * └──────────────────────────────────────────────────────┘
 */

export function createTimestampConverterUI(): HTMLElement {
  const container = document.createElement('div')
  container.id = 'timestamp-converter-dashboard'
  container.className = 'tsc-container card-section'

  container.innerHTML = `
    <h2 class="section-title">🕐 Unix Timestamp Converter</h2>
    <p class="section-description">
      Convert between Unix timestamps (seconds or milliseconds since epoch)
      and human-readable date/time formats. The unit is auto-detected.
    </p>

    <div class="tsc-panels">
      <!-- Left: inputs -->
      <div class="tsc-inputs">

        <div class="tsc-input-group">
          <label class="tsc-label" for="tsc-unix-input">Unix Timestamp</label>
          <div class="tsc-row">
            <input
              id="tsc-unix-input"
              class="tsc-input"
              type="text"
              placeholder="e.g. 1767225600"
              autocomplete="off"
              spellcheck="false"
              aria-label="Unix timestamp (seconds or milliseconds)"
            />
            <button id="tsc-now-unix-btn" class="tsc-btn tsc-btn-sm" title="Insert current Unix timestamp">Now</button>
          </div>
          <div id="tsc-unit-badge" class="tsc-unit-badge" aria-live="polite" hidden></div>
          <div id="tsc-unix-error" class="tsc-error" role="alert" aria-live="polite" hidden></div>
        </div>

        <div class="tsc-divider">
          <span>or</span>
        </div>

        <div class="tsc-input-group">
          <label class="tsc-label" for="tsc-date-input">Human-readable Date / Time</label>
          <div class="tsc-row">
            <input
              id="tsc-date-input"
              class="tsc-input"
              type="datetime-local"
              step="1"
              aria-label="Date and time"
            />
            <button id="tsc-now-date-btn" class="tsc-btn tsc-btn-sm" title="Insert current date/time">Now</button>
          </div>
          <div id="tsc-date-error" class="tsc-error" role="alert" aria-live="polite" hidden></div>
        </div>

      </div>

      <!-- Right: results -->
      <div class="tsc-results" id="tsc-results" aria-live="polite">
        <p class="tsc-results-placeholder">Enter a timestamp or date above to see all formats.</p>
      </div>
    </div>

    <div class="tsc-toolbar">
      <button id="tsc-clear-btn" class="tsc-btn">🗑 Clear</button>
      <button id="tsc-now-all-btn" class="tsc-btn">⚡ Set to Now</button>
    </div>
  `

  // ── element refs ──────────────────────────────────────────────────────────
  const unixInput   = container.querySelector<HTMLInputElement>('#tsc-unix-input')!
  const dateInput   = container.querySelector<HTMLInputElement>('#tsc-date-input')!
  const unitBadge   = container.querySelector<HTMLDivElement>('#tsc-unit-badge')!
  const unixError   = container.querySelector<HTMLDivElement>('#tsc-unix-error')!
  const dateError   = container.querySelector<HTMLDivElement>('#tsc-date-error')!
  const resultsEl   = container.querySelector<HTMLDivElement>('#tsc-results')!
  const nowUnixBtn  = container.querySelector<HTMLButtonElement>('#tsc-now-unix-btn')!
  const nowDateBtn  = container.querySelector<HTMLButtonElement>('#tsc-now-date-btn')!
  const clearBtn    = container.querySelector<HTMLButtonElement>('#tsc-clear-btn')!
  const nowAllBtn   = container.querySelector<HTMLButtonElement>('#tsc-now-all-btn')!

  // ── helpers ───────────────────────────────────────────────────────────────
  function clearErrors() {
    unixError.hidden = true
    unixError.textContent = ''
    dateError.hidden = true
    dateError.textContent = ''
  }

  function showUnixError(msg: string) {
    unixError.hidden = false
    unixError.textContent = msg
    unitBadge.hidden = true
  }

  function showDateError(msg: string) {
    dateError.hidden = false
    dateError.textContent = msg
  }

  function clearResults() {
    resultsEl.innerHTML = '<p class="tsc-results-placeholder">Enter a timestamp or date above to see all formats.</p>'
    unitBadge.hidden = true
  }

  function renderResults(fmt: TimestampFormats) {
    const rows: { label: string; value: string; copyable: boolean }[] = [
      { label: 'Unix (seconds)',  value: String(fmt.seconds),      copyable: true  },
      { label: 'Unix (ms)',       value: String(fmt.milliseconds),  copyable: true  },
      { label: 'ISO 8601',        value: fmt.iso,                   copyable: true  },
      { label: 'UTC',             value: fmt.utc,                   copyable: true  },
      { label: 'Locale',          value: fmt.locale,                copyable: true  },
      { label: 'Relative',        value: fmt.relative,              copyable: false },
      { label: 'Weekday',         value: fmt.weekday,               copyable: false },
      { label: 'UTC Offset',      value: fmt.offset,                copyable: false },
    ]

    resultsEl.innerHTML = `
      <table class="tsc-table" aria-label="Timestamp formats">
        <thead>
          <tr>
            <th>Format</th>
            <th>Value</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${rows.map((row) => `
            <tr>
              <td class="tsc-table-label">${row.label}</td>
              <td class="tsc-table-value"><code>${escHtml(row.value)}</code></td>
              <td class="tsc-table-action">
                ${row.copyable
                  ? `<button class="tsc-btn tsc-btn-xs tsc-copy-btn" data-value="${escAttr(row.value)}">📋</button>`
                  : ''}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `

    // Wire copy buttons
    resultsEl.querySelectorAll<HTMLButtonElement>('.tsc-copy-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const val = btn.dataset.value ?? ''
        copyText(val, btn, '📋')
        trackActivity('timestamp_converter', 'Copied timestamp format', val)
      })
    })
  }

  function copyText(text: string, btn: HTMLButtonElement, original: string) {
    if (!text) return
    if (!navigator.clipboard) {
      btn.textContent = '❌'
      setTimeout(() => { btn.textContent = original }, 2000)
      return
    }
    navigator.clipboard.writeText(text).then(() => {
      btn.textContent = '✅'
      setTimeout(() => { btn.textContent = original }, 2000)
    }).catch(() => {
      btn.textContent = '❌'
      setTimeout(() => { btn.textContent = original }, 2000)
    })
  }

  function escHtml(s: string): string {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  }

  function escAttr(s: string): string {
    return s.replace(/"/g, '&quot;').replace(/'/g, '&#39;')
  }

  // ── from-unix conversion ──────────────────────────────────────────────────
  function handleUnixInput() {
    clearErrors()
    const raw = unixInput.value.trim()
    if (raw === '') {
      clearResults()
      return
    }

    const result = parseUnixTimestamp(raw)
    if (!result.success) {
      showUnixError(`⚠️ ${result.error}`)
      clearResults()
      return
    }

    unitBadge.hidden = false
    unitBadge.textContent = `Auto-detected: ${result.unit}`

    // Sync the date input without triggering its own handler
    dateInput.removeEventListener('input', handleDateInput)
    dateInput.value = toDatetimeLocalString(new Date(result.ms))
    dateInput.addEventListener('input', handleDateInput)

    renderResults(result.formats)
    trackActivity('timestamp_converter', 'Converted Unix timestamp', `${raw} → ${result.formats.iso}`)
  }

  // ── from-date conversion ──────────────────────────────────────────────────
  function handleDateInput() {
    clearErrors()
    const raw = dateInput.value.trim()
    if (raw === '') {
      clearResults()
      return
    }

    const result = parseDateString(raw)
    if (!result.success) {
      showDateError(`⚠️ ${result.error}`)
      clearResults()
      return
    }

    // Sync the unix input without triggering its own handler
    unixInput.removeEventListener('input', handleUnixInput)
    unixInput.value = String(result.formats.seconds)
    unixInput.addEventListener('input', handleUnixInput)

    unitBadge.hidden = false
    unitBadge.textContent = `Auto-detected: seconds`

    renderResults(result.formats)
    trackActivity('timestamp_converter', 'Converted date string', `${raw} → ${result.formats.seconds}`)
  }

  // ── "Now" helpers ─────────────────────────────────────────────────────────
  function setToNow() {
    const now = new Date()
    unixInput.value = String(Math.floor(now.getTime() / 1000))
    dateInput.value = toDatetimeLocalString(now)
    handleUnixInput()
  }

  // ── event listeners ───────────────────────────────────────────────────────
  unixInput.addEventListener('input', handleUnixInput)
  dateInput.addEventListener('input', handleDateInput)

  nowUnixBtn.addEventListener('click', () => {
    unixInput.value = String(Math.floor(Date.now() / 1000))
    handleUnixInput()
  })

  nowDateBtn.addEventListener('click', () => {
    dateInput.value = toDatetimeLocalString(new Date())
    handleDateInput()
  })

  nowAllBtn.addEventListener('click', () => {
    setToNow()
    trackActivity('timestamp_converter', 'Set timestamp to now', 'Current time loaded')
  })

  clearBtn.addEventListener('click', () => {
    unixInput.value = ''
    dateInput.value = ''
    clearErrors()
    clearResults()
  })

  return container
}
