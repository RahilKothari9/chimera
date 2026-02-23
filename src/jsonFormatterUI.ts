/**
 * JSON Formatter UI
 * Interactive JSON formatting, validation, and diffing interface
 */

import { formatJson, repairJson, sortKeys, diffJson, JSON_EXAMPLES, type JsonStats } from './jsonFormatter.ts'
import { trackActivity } from './activityFeed.ts'

function showNotification(message: string, type: 'success' | 'error' | 'info' | 'warning'): void {
  window.dispatchEvent(new CustomEvent('chimera-notification', { detail: { message, type } }))
}

export function setupJsonFormatter(container: HTMLElement): void {
  if (!container) return
  container.innerHTML = ''
  container.appendChild(buildJsonFormatterUI())
}

function buildJsonFormatterUI(): HTMLElement {
  const section = document.createElement('section')
  section.className = 'json-formatter-section'
  section.setAttribute('aria-label', 'JSON Formatter and Validator')

  section.innerHTML = `
    <h2 class="section-title">🗂️ JSON Formatter &amp; Validator</h2>
    <p class="json-subtitle">Format, validate, repair and compare JSON instantly</p>

    <div class="json-layout">
      <!-- Left: Input panel -->
      <div class="json-input-panel">
        <div class="json-panel-header">
          <span class="json-panel-label">Input JSON</span>
          <div class="json-toolbar">
            <select class="json-examples-select" aria-label="Load example">
              <option value="">Load example…</option>
              ${JSON_EXAMPLES.map((e, i) => `<option value="${i}">${e.label}</option>`).join('')}
            </select>
            <button class="json-btn json-btn-secondary json-clear-btn" title="Clear input">✕ Clear</button>
          </div>
        </div>
        <textarea
          class="json-textarea"
          id="json-input"
          placeholder='Paste your JSON here, e.g. {"key": "value"}'
          spellcheck="false"
          aria-label="JSON input"
        ></textarea>
        <div class="json-action-row">
          <button class="json-btn json-btn-primary json-format-btn">⚡ Format</button>
          <button class="json-btn json-btn-secondary json-minify-btn">📦 Minify</button>
          <button class="json-btn json-btn-secondary json-sort-btn">🔤 Sort Keys</button>
          <button class="json-btn json-btn-secondary json-repair-btn">🔧 Repair</button>
        </div>
      </div>

      <!-- Right: Output panel -->
      <div class="json-output-panel">
        <div class="json-panel-header">
          <span class="json-panel-label">Output</span>
          <button class="json-btn json-btn-secondary json-copy-btn" style="display:none">📋 Copy</button>
        </div>
        <div class="json-output" id="json-output" role="region" aria-live="polite">
          <p class="json-placeholder">Formatted JSON will appear here…</p>
        </div>
        <div class="json-stats-row" id="json-stats" style="display:none"></div>
      </div>
    </div>

    <!-- Diff section -->
    <div class="json-diff-section">
      <h3 class="json-diff-title">🔍 Compare Two JSON Values</h3>
      <div class="json-diff-layout">
        <textarea class="json-textarea json-diff-a" placeholder='JSON A…' spellcheck="false" aria-label="JSON A for comparison"></textarea>
        <textarea class="json-textarea json-diff-b" placeholder='JSON B…' spellcheck="false" aria-label="JSON B for comparison"></textarea>
      </div>
      <button class="json-btn json-btn-primary json-diff-btn">Compare →</button>
      <div class="json-diff-result" id="json-diff-result" role="region" aria-live="polite"></div>
    </div>
  `

  wireEvents(section)
  return section
}

function wireEvents(section: HTMLElement): void {
  const inputEl = section.querySelector<HTMLTextAreaElement>('#json-input')!
  const outputEl = section.querySelector<HTMLElement>('#json-output')!
  const statsEl = section.querySelector<HTMLElement>('#json-stats')!
  const copyBtn = section.querySelector<HTMLButtonElement>('.json-copy-btn')!
  const clearBtn = section.querySelector<HTMLButtonElement>('.json-clear-btn')!
  const examplesSelect = section.querySelector<HTMLSelectElement>('.json-examples-select')!

  let lastFormattedOutput = ''

  // Load examples
  examplesSelect.addEventListener('change', () => {
    const idx = parseInt(examplesSelect.value, 10)
    if (!isNaN(idx) && JSON_EXAMPLES[idx]) {
      inputEl.value = JSON_EXAMPLES[idx].value
      examplesSelect.value = ''
      trackActivity('section_view', 'Loaded JSON example', `Loaded "${JSON_EXAMPLES[idx].label}"`)
    }
  })

  // Clear
  clearBtn.addEventListener('click', () => {
    inputEl.value = ''
    showPlaceholder(outputEl, 'Formatted JSON will appear here…')
    statsEl.style.display = 'none'
    copyBtn.style.display = 'none'
    lastFormattedOutput = ''
  })

  // Format
  section.querySelector('.json-format-btn')!.addEventListener('click', () => {
    const result = formatJson(inputEl.value)
    if (result.isValid && result.formatted) {
      showOutput(outputEl, result.formatted)
      lastFormattedOutput = result.formatted
      copyBtn.style.display = ''
      renderStats(statsEl, result.stats!)
      trackActivity('section_view', 'Formatted JSON', `Formatted ${result.stats!.keys} keys, depth ${result.stats!.depth}`)
    } else {
      showError(outputEl, result.error || 'Invalid JSON', result.errorLine, result.errorColumn)
      statsEl.style.display = 'none'
      copyBtn.style.display = 'none'
    }
  })

  // Minify
  section.querySelector('.json-minify-btn')!.addEventListener('click', () => {
    const result = formatJson(inputEl.value)
    if (result.isValid && result.minified) {
      showOutput(outputEl, result.minified)
      lastFormattedOutput = result.minified
      copyBtn.style.display = ''
      renderStats(statsEl, result.stats!)
      trackActivity('section_view', 'Minified JSON', `Minified to ${result.minified.length} characters`)
    } else {
      showError(outputEl, result.error || 'Invalid JSON', result.errorLine, result.errorColumn)
      statsEl.style.display = 'none'
      copyBtn.style.display = 'none'
    }
  })

  // Sort Keys
  section.querySelector('.json-sort-btn')!.addEventListener('click', () => {
    const result = formatJson(inputEl.value)
    if (result.isValid) {
      const sorted = sortKeys(JSON.parse(inputEl.value.trim()))
      const formatted = JSON.stringify(sorted, null, 2)
      showOutput(outputEl, formatted)
      lastFormattedOutput = formatted
      copyBtn.style.display = ''
      renderStats(statsEl, result.stats!)
      trackActivity('section_view', 'Sorted JSON keys', 'Keys sorted alphabetically')
    } else {
      showError(outputEl, result.error || 'Invalid JSON', result.errorLine, result.errorColumn)
      statsEl.style.display = 'none'
      copyBtn.style.display = 'none'
    }
  })

  // Repair
  section.querySelector('.json-repair-btn')!.addEventListener('click', () => {
    const repaired = repairJson(inputEl.value)
    const result = formatJson(repaired)
    if (result.isValid && result.formatted) {
      inputEl.value = repaired
      showOutput(outputEl, result.formatted)
      lastFormattedOutput = result.formatted
      copyBtn.style.display = ''
      renderStats(statsEl, result.stats!)
      showNotification('JSON repaired successfully', 'success')
      trackActivity('section_view', 'Repaired JSON', 'Auto-fixed common JSON syntax issues')
    } else {
      showError(outputEl, `Could not auto-repair: ${result.error || 'Invalid JSON'}`, result.errorLine, result.errorColumn)
      statsEl.style.display = 'none'
      copyBtn.style.display = 'none'
    }
  })

  // Copy output
  copyBtn.addEventListener('click', () => {
    if (!lastFormattedOutput) return
    navigator.clipboard.writeText(lastFormattedOutput).then(() => {
      showNotification('JSON copied to clipboard!', 'success')
      trackActivity('section_view', 'Copied JSON output', 'Copied formatted JSON to clipboard')
    }).catch(() => {
      showNotification('Failed to copy to clipboard', 'error')
    })
  })

  // Diff compare
  const diffAEl = section.querySelector<HTMLTextAreaElement>('.json-diff-a')!
  const diffBEl = section.querySelector<HTMLTextAreaElement>('.json-diff-b')!
  const diffResultEl = section.querySelector<HTMLElement>('#json-diff-result')!

  section.querySelector('.json-diff-btn')!.addEventListener('click', () => {
    const diffs = diffJson(diffAEl.value, diffBEl.value)
    if (diffs === null) {
      diffResultEl.innerHTML = '<p class="json-error-msg">Both inputs must be valid JSON to compare.</p>'
      return
    }
    if (diffs.length === 0) {
      diffResultEl.innerHTML = '<p class="json-diff-same">✅ Both JSON values are identical.</p>'
    } else {
      diffResultEl.innerHTML = renderDiff(diffs)
    }
    trackActivity('section_view', 'Compared JSON', `Found ${diffs.length} difference(s)`)
  })
}

function showOutput(el: HTMLElement, code: string): void {
  el.innerHTML = `<pre class="json-pre"><code>${escapeHtml(code)}</code></pre>`
}

function showPlaceholder(el: HTMLElement, text: string): void {
  el.innerHTML = `<p class="json-placeholder">${escapeHtml(text)}</p>`
}

function showError(el: HTMLElement, message: string, line?: number, col?: number): void {
  const pos = line !== undefined ? ` (line ${line}${col !== undefined ? `, col ${col}` : ''})` : ''
  el.innerHTML = `<p class="json-error-msg">❌ ${escapeHtml(message)}${escapeHtml(pos)}</p>`
}

function renderStats(el: HTMLElement, stats: JsonStats): void {
  el.style.display = 'flex'
  el.innerHTML = [
    stat('Keys', stats.keys),
    stat('Objects', stats.objects),
    stat('Arrays', stats.arrays),
    stat('Strings', stats.strings),
    stat('Numbers', stats.numbers),
    stat('Depth', stats.depth),
    stat('Size', `${stats.size} B`),
  ].join('')
}

function stat(label: string, value: number | string): string {
  return `<span class="json-stat"><strong>${value}</strong> ${label}</span>`
}

function renderDiff(diffs: ReturnType<typeof diffJson>): string {
  if (!diffs) return ''
  const rows = diffs.map(d => {
    let cls = ''
    let badge = ''
    let detail = ''
    if (d.type === 'added') {
      cls = 'json-diff-added'
      badge = '<span class="json-diff-badge added">+</span>'
      detail = `<code>${escapeHtml(JSON.stringify(d.newValue))}</code>`
    } else if (d.type === 'removed') {
      cls = 'json-diff-removed'
      badge = '<span class="json-diff-badge removed">−</span>'
      detail = `<code>${escapeHtml(JSON.stringify(d.oldValue))}</code>`
    } else {
      cls = 'json-diff-changed'
      badge = '<span class="json-diff-badge changed">~</span>'
      detail = `<code>${escapeHtml(JSON.stringify(d.oldValue))}</code> → <code>${escapeHtml(JSON.stringify(d.newValue))}</code>`
    }
    return `<div class="json-diff-row ${cls}">${badge} <span class="json-diff-path">${escapeHtml(d.path)}</span>: ${detail}</div>`
  }).join('')
  return `<div class="json-diff-list">${rows}</div>`
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
